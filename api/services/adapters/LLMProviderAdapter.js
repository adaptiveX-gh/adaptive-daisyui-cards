/**
 * LLM Provider Adapter (Abstract Base Class)
 * Phase 4: Content Generation Architecture
 *
 * Provides a unified interface for multiple LLM providers (Gemini, GPT, Claude, etc.)
 * Subclasses must implement generate() and optionally generateStream().
 *
 * @abstract
 */

/**
 * Abstract base class for LLM provider adapters
 *
 * @class
 * @abstract
 */
export class LLMProviderAdapter {
  /**
   * Create an LLM adapter
   *
   * @param {Object} config - Provider-specific configuration
   */
  constructor(config = {}) {
    if (new.target === LLMProviderAdapter) {
      throw new TypeError('Cannot instantiate abstract class LLMProviderAdapter directly');
    }

    this.config = config;
    this.mockMode = config.mockMode || false;
  }

  /**
   * Generate text completion from prompt
   *
   * @abstract
   * @param {Object} params - Generation parameters
   * @param {string} params.prompt - The prompt text
   * @param {number} [params.maxTokens=2000] - Maximum tokens to generate
   * @param {number} [params.temperature=0.7] - Sampling temperature (0-1)
   * @param {string} [params.format='text'] - Response format ('text' | 'json')
   * @returns {Promise<string>} Generated text
   * @throws {Error} If generation fails
   */
  async generate(params) {
    throw new Error('generate() must be implemented by subclass');
  }

  /**
   * Generate streaming text completion
   *
   * @abstract
   * @param {Object} params - Generation parameters (same as generate)
   * @returns {AsyncGenerator<string>} Streaming text chunks
   * @throws {Error} If streaming fails
   */
  async *generateStream(params) {
    throw new Error('generateStream() must be implemented by subclass');
  }

  /**
   * Get the provider name
   *
   * @abstract
   * @returns {string} Provider name (e.g., 'gemini', 'gpt', 'claude')
   */
  getName() {
    throw new Error('getName() must be implemented by subclass');
  }

  /**
   * Check if the provider is available and configured
   *
   * @abstract
   * @returns {Promise<boolean>} True if provider is ready to use
   */
  async isAvailable() {
    throw new Error('isAvailable() must be implemented by subclass');
  }

  /**
   * Validate generation parameters
   *
   * @protected
   * @param {Object} params - Parameters to validate
   * @throws {Error} If parameters are invalid
   */
  _validateParams(params) {
    if (!params) {
      throw new Error('Generation parameters are required');
    }

    if (!params.prompt || typeof params.prompt !== 'string') {
      throw new Error('Prompt must be a non-empty string');
    }

    if (params.maxTokens !== undefined &&
        (typeof params.maxTokens !== 'number' || params.maxTokens <= 0)) {
      throw new Error('maxTokens must be a positive number');
    }

    if (params.temperature !== undefined) {
      const temp = params.temperature;
      if (typeof temp !== 'number' || temp < 0 || temp > 1) {
        throw new Error('temperature must be a number between 0 and 1');
      }
    }

    if (params.format && !['text', 'json'].includes(params.format)) {
      throw new Error('format must be "text" or "json"');
    }
  }

  /**
   * Parse JSON response safely
   *
   * @protected
   * @param {string} text - Text that may contain JSON
   * @returns {Object|null} Parsed JSON or null if parsing fails
   */
  _parseJSON(text) {
    try {
      // Remove markdown code blocks if present
      const cleaned = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      return JSON.parse(cleaned);
    } catch (error) {
      console.error('[LLMAdapter] Failed to parse JSON:', error.message);
      return null;
    }
  }

  /**
   * Extract JSON from mixed text/JSON response
   *
   * @protected
   * @param {string} text - Response text
   * @returns {Object|null} Extracted and parsed JSON
   */
  _extractJSON(text) {
    // Try direct parse first
    let json = this._parseJSON(text);
    if (json) return json;

    // Try to find JSON object in text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      json = this._parseJSON(jsonMatch[0]);
      if (json) return json;
    }

    // Try to find JSON array in text
    const arrayMatch = text.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      json = this._parseJSON(arrayMatch[0]);
      if (json) return json;
    }

    return null;
  }

  /**
   * Log generation metrics
   *
   * @protected
   * @param {Object} metrics - Metrics to log
   */
  _logMetrics(metrics) {
    if (this.config.logMetrics !== false) {
      console.log(`[${this.getName()}] Generation metrics:`, {
        promptTokens: metrics.promptTokens || 'N/A',
        completionTokens: metrics.completionTokens || 'N/A',
        totalTokens: metrics.totalTokens || 'N/A',
        latencyMs: metrics.latencyMs || 'N/A'
      });
    }
  }
}

export default LLMProviderAdapter;
