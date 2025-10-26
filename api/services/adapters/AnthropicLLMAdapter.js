/**
 * Anthropic LLM Adapter
 * Phase 4: Content Generation Architecture
 *
 * Implementation of LLMProviderAdapter for Anthropic Claude API
 * Supports both mock mode (for testing) and real API calls
 *
 * Environment Variables:
 *   ANTHROPIC_API_KEY - Anthropic API key
 *   CONTENT_LLM_MODEL - Model name (default: claude-3-5-sonnet-20241022)
 *   LLM_MOCK_MODE - Set to 'true' for mock responses
 */

import Anthropic from '@anthropic-ai/sdk';
import { LLMProviderAdapter } from './LLMProviderAdapter.js';

/**
 * Anthropic Claude API adapter
 *
 * @class
 * @extends LLMProviderAdapter
 */
export class AnthropicLLMAdapter extends LLMProviderAdapter {
  /**
   * Create an Anthropic adapter
   *
   * @param {Object} config - Configuration
   * @param {string} [config.apiKey] - Anthropic API key (or use ANTHROPIC_API_KEY env var)
   * @param {string} [config.model='claude-3-5-sonnet-20241022'] - Model name
   * @param {boolean} [config.mockMode=false] - Use mock responses for testing
   * @param {boolean} [config.logMetrics=true] - Log token usage and latency
   */
  constructor(config = {}) {
    super(config);

    this.apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY;
    this.model = config.model || process.env.CONTENT_LLM_MODEL || 'claude-3-5-sonnet-20240620';
    this.mockMode = config.mockMode !== undefined ? config.mockMode : (process.env.LLM_MOCK_MODE === 'true');

    if (!this.mockMode && !this.apiKey) {
      console.warn('[AnthropicAdapter] No API key provided. Running in mock mode.');
      this.mockMode = true;
    }

    // Initialize Anthropic client
    if (!this.mockMode) {
      try {
        this.client = new Anthropic({
          apiKey: this.apiKey
        });
      } catch (error) {
        console.error('[AnthropicAdapter] Failed to initialize client:', error.message);
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

      // Build messages array
      const messages = [
        {
          role: 'user',
          content: prompt
        }
      ];

      // Add JSON mode instructions if requested
      let systemPrompt = '';
      if (format === 'json') {
        systemPrompt = 'You are a helpful assistant that always responds with valid JSON. Never include markdown formatting, explanations, or any text outside the JSON object.';
      }

      const requestParams = {
        model: this.model,
        max_tokens: maxTokens,
        temperature: temperature,
        messages: messages
      };

      // Add system prompt if provided
      if (systemPrompt) {
        requestParams.system = systemPrompt;
      }

      const response = await this.client.messages.create(requestParams);

      // Extract text from response
      const text = response.content[0].text;

      // Log metrics
      const latencyMs = Date.now() - startTime;
      this._logMetrics({
        promptTokens: response.usage?.input_tokens || 0,
        completionTokens: response.usage?.output_tokens || 0,
        totalTokens: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0),
        latencyMs
      });

      return text;

    } catch (error) {
      console.error('[AnthropicAdapter] Generation failed:', error.message);
      throw new Error(`Anthropic API error: ${error.message}`);
    }
  }

  /**
   * Generate streaming text completion
   *
   * @param {Object} params - Generation parameters
   * @returns {AsyncGenerator<string>} Streaming text chunks
   * @throws {Error} If streaming fails
   */
  async *generateStream(params) {
    this._validateParams(params);

    const {
      prompt,
      maxTokens = 2000,
      temperature = 0.7,
      format = 'text'
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
      // Build messages array
      const messages = [
        {
          role: 'user',
          content: prompt
        }
      ];

      // Add JSON mode instructions if requested
      let systemPrompt = '';
      if (format === 'json') {
        systemPrompt = 'You are a helpful assistant that always responds with valid JSON. Never include markdown formatting, explanations, or any text outside the JSON object.';
      }

      const requestParams = {
        model: this.model,
        max_tokens: maxTokens,
        temperature: temperature,
        messages: messages,
        stream: true
      };

      // Add system prompt if provided
      if (systemPrompt) {
        requestParams.system = systemPrompt;
      }

      const stream = await this.client.messages.create(requestParams);

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
          yield event.delta.text;
        }
      }

    } catch (error) {
      console.error('[AnthropicAdapter] Streaming failed:', error.message);
      throw new Error(`Anthropic streaming error: ${error.message}`);
    }
  }

  /**
   * Get provider name
   *
   * @returns {string} 'anthropic'
   */
  getName() {
    return 'anthropic';
  }

  /**
   * Check if Anthropic is available
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

    // API key exists and client is initialized
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

    console.log('[AnthropicAdapter] Mock mode: generating response');

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
            suggestedLayout: 'hero-layout',
            keyPoints: ['Hook the audience', 'State the problem']
          },
          {
            id: 'main-1',
            title: 'Key Concept',
            purpose: 'Explain main idea',
            suggestedLayout: 'split-layout',
            keyPoints: ['Core principle', 'Why it matters']
          },
          {
            id: 'conclusion',
            title: 'Conclusion',
            purpose: 'Wrap up',
            suggestedLayout: 'hero-layout',
            keyPoints: ['Summary', 'Call to action']
          }
        ]
      }, null, 2);
    }

    if (lowerPrompt.includes('layout') || lowerPrompt.includes('visual')) {
      // Mock VisualDesigner response
      return JSON.stringify({
        layoutPlan: [
          { sectionId: 'intro', layout: 'hero-layout', reasoning: 'Strong opening' },
          { sectionId: 'main-1', layout: 'split-layout', reasoning: 'Compare concepts' },
          { sectionId: 'conclusion', layout: 'hero-layout', reasoning: 'Memorable close' }
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
    return `This is a mock response generated by AnthropicLLMAdapter in mock mode.

Prompt received: "${prompt.slice(0, 100)}..."

This mock response would be replaced by actual Claude API output when ANTHROPIC_API_KEY is configured.`;
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

export default AnthropicLLMAdapter;
