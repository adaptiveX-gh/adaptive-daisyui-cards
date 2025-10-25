/**
 * Gemini LLM Adapter
 * Phase 4: Content Generation Architecture
 *
 * Implementation of LLMProviderAdapter for Google Gemini API
 * Supports both mock mode (for testing) and real API calls
 *
 * Environment Variables:
 *   GEMINI_API_KEY - Google AI API key
 *   GEMINI_MODEL - Model name (default: gemini-2.0-flash-exp)
 *   LLM_MOCK_MODE - Set to 'true' for mock responses
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { LLMProviderAdapter } from './LLMProviderAdapter.js';

/**
 * Gemini API adapter
 *
 * @class
 * @extends LLMProviderAdapter
 */
export class GeminiLLMAdapter extends LLMProviderAdapter {
  /**
   * Create a Gemini adapter
   *
   * @param {Object} config - Configuration
   * @param {string} [config.apiKey] - Gemini API key (or use GEMINI_API_KEY env var)
   * @param {string} [config.model='gemini-2.0-flash-exp'] - Model name
   * @param {boolean} [config.mockMode=false] - Use mock responses for testing
   * @param {boolean} [config.logMetrics=true] - Log token usage and latency
   */
  constructor(config = {}) {
    super(config);

    this.apiKey = config.apiKey || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    this.model = config.model || process.env.CONTENT_LLM_MODEL || process.env.GEMINI_MODEL || 'gemini-1.5-pro';
    this.mockMode = config.mockMode !== undefined ? config.mockMode : (process.env.LLM_MOCK_MODE === 'true');

    if (!this.mockMode && !this.apiKey) {
      console.warn('[GeminiAdapter] No API key provided. Running in mock mode.');
      this.mockMode = true;
    }

    // Initialize Gemini client
    if (!this.mockMode) {
      try {
        this.client = new GoogleGenerativeAI(this.apiKey);
        this.generativeModel = this.client.getGenerativeModel({ model: this.model });
      } catch (error) {
        console.error('[GeminiAdapter] Failed to initialize client:', error.message);
        this.mockMode = true;
      }
    }
  }

  /**
   * Generate text completion from prompt
   *
   * @param {Object} params - Generation parameters
   * @param {string} params.prompt - The prompt text
   * @param {number} [params.maxTokens=2000] - Maximum tokens to generate
   * @param {number} [params.temperature=0.7] - Sampling temperature (0-1)
   * @param {string} [params.format='text'] - Response format ('text' | 'json')
   * @returns {Promise<string>} Generated text
   * @throws {Error} If generation fails
   */
  async generate(params) {
    this._validateParams(params);

    const {
      prompt,
      maxTokens = 2000,
      temperature = 0.7,
      format = 'text'
    } = params;

    // Mock mode
    if (this.mockMode) {
      return this._generateMock(params);
    }

    // Real API call
    try {
      const startTime = Date.now();

      const generationConfig = {
        maxOutputTokens: maxTokens,
        temperature: temperature
      };

      // Add JSON mode instruction if requested
      const actualPrompt = format === 'json'
        ? `${prompt}\n\nIMPORTANT: Respond with valid JSON only. No markdown, no explanations.`
        : prompt;

      const result = await this.generativeModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: actualPrompt }] }],
        generationConfig
      });

      const response = result.response;
      const text = response.text();

      // Log metrics
      const latencyMs = Date.now() - startTime;
      this._logMetrics({
        promptTokens: response.usageMetadata?.promptTokenCount || 0,
        completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: response.usageMetadata?.totalTokenCount || 0,
        latencyMs
      });

      return text;

    } catch (error) {
      console.error('[GeminiAdapter] Generation failed:', error.message);
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }

  /**
   * Generate streaming text completion (stub for future implementation)
   *
   * @param {Object} params - Generation parameters
   * @returns {AsyncGenerator<string>} Streaming text chunks
   * @throws {Error} Not yet implemented
   */
  async *generateStream(params) {
    this._validateParams(params);

    const {
      prompt,
      maxTokens = 2000,
      temperature = 0.7
    } = params;

    if (this.mockMode) {
      // Mock streaming: yield mock response in chunks
      const mockResponse = await this._generateMock(params);
      const chunkSize = 50;

      for (let i = 0; i < mockResponse.length; i += chunkSize) {
        yield mockResponse.slice(i, i + chunkSize);
        await this._sleep(50); // Simulate streaming delay
      }
      return;
    }

    // Real streaming
    try {
      const generationConfig = {
        maxOutputTokens: maxTokens,
        temperature: temperature
      };

      const result = await this.generativeModel.generateContentStream({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig
      });

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        yield chunkText;
      }

    } catch (error) {
      console.error('[GeminiAdapter] Streaming failed:', error.message);
      throw new Error(`Gemini streaming error: ${error.message}`);
    }
  }

  /**
   * Get provider name
   *
   * @returns {string} 'gemini'
   */
  getName() {
    return 'gemini';
  }

  /**
   * Check if Gemini is available
   *
   * @returns {Promise<boolean>} True if API key is configured or mock mode is enabled
   */
  async isAvailable() {
    if (this.mockMode) {
      return true;
    }

    if (!this.apiKey) {
      return false;
    }

    // Optional: Could test API key with a simple request
    // For now, just check if key exists
    return !!this.client;
  }

  /**
   * Generate mock response for testing
   *
   * @private
   * @param {Object} params - Generation parameters
   * @returns {Promise<string>} Mock response
   */
  async _generateMock(params) {
    const { prompt, format } = params;

    console.log('[GeminiAdapter] Mock mode: generating response');

    // Simulate API latency
    await this._sleep(200);

    // Return format-appropriate mock
    if (format === 'json') {
      return this._getMockJSONResponse(prompt);
    }

    return this._getMockTextResponse(prompt);
  }

  /**
   * Get mock JSON response based on prompt content
   *
   * @private
   * @param {string} prompt - The prompt
   * @returns {string} Mock JSON string
   */
  _getMockJSONResponse(prompt) {
    const lowerPrompt = prompt.toLowerCase();

    // Detect what kind of generation is requested
    if (lowerPrompt.includes('presentation structure') || lowerPrompt.includes('outline')) {
      // Mock PresentationDesigner response
      return JSON.stringify({
        title: 'Mock Presentation',
        type: 'education',
        audience: 'general',
        sections: [
          {
            id: 'intro',
            title: 'Introduction',
            purpose: 'Set context',
            suggestedLayout: 'hero',
            keyPoints: ['Hook the audience', 'State the problem']
          },
          {
            id: 'main-1',
            title: 'Key Concept',
            purpose: 'Explain main idea',
            suggestedLayout: 'split',
            keyPoints: ['Core principle', 'Why it matters']
          },
          {
            id: 'conclusion',
            title: 'Conclusion',
            purpose: 'Wrap up',
            suggestedLayout: 'hero',
            keyPoints: ['Summary', 'Call to action']
          }
        ]
      }, null, 2);
    }

    if (lowerPrompt.includes('layout') || lowerPrompt.includes('visual')) {
      // Mock VisualDesigner response
      return JSON.stringify({
        layoutPlan: [
          { sectionId: 'intro', layout: 'hero', reasoning: 'Strong opening' },
          { sectionId: 'main-1', layout: 'split', reasoning: 'Compare concepts' },
          { sectionId: 'conclusion', layout: 'hero', reasoning: 'Memorable close' }
        ],
        visualTheme: {
          primaryColor: 'blue',
          style: 'professional',
          imageStyle: 'photography'
        }
      }, null, 2);
    }

    if (lowerPrompt.includes('copy') || lowerPrompt.includes('content')) {
      // Mock Copywriter response
      return JSON.stringify({
        cardId: 'mock-card-1',
        content: {
          title: 'Mock Card Title',
          subtitle: 'Supporting subtitle text',
          body: 'This is mock body content generated in mock mode for testing purposes.',
          bullets: [
            'First key point',
            'Second key point',
            'Third key point'
          ],
          cta: 'Learn More'
        },
        imagePrompt: 'A professional photograph showing the concept in action',
        metadata: {
          tone: 'professional',
          wordCount: 42
        }
      }, null, 2);
    }

    // Generic mock JSON
    return JSON.stringify({
      message: 'Mock response',
      data: { mock: true }
    }, null, 2);
  }

  /**
   * Get mock text response
   *
   * @private
   * @param {string} prompt - The prompt
   * @returns {string} Mock text
   */
  _getMockTextResponse(prompt) {
    return `This is a mock response generated by GeminiLLMAdapter in mock mode.

Prompt received: "${prompt.slice(0, 100)}..."

This mock response would be replaced by actual Gemini API output when GEMINI_API_KEY is configured.`;
  }

  /**
   * Sleep helper for simulating delays
   *
   * @private
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default GeminiLLMAdapter;
