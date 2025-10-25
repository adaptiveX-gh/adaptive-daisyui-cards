/**
 * LLM Adapter Factory
 * Creates appropriate LLM adapter based on environment configuration
 *
 * Supports multiple providers:
 * - Google (Gemini)
 * - OpenAI (GPT-4, GPT-3.5)
 * - Anthropic (Claude)
 * - Mock (for testing)
 *
 * Environment Variables:
 *   CONTENT_LLM_PROVIDER - Provider name (google, openai, anthropic, mock)
 *   CONTENT_LLM_MODEL - Model name (provider-specific)
 *   GOOGLE_API_KEY - Google AI API key
 *   OPENAI_API_KEY - OpenAI API key
 *   ANTHROPIC_API_KEY - Anthropic API key
 */

import { GeminiLLMAdapter } from './GeminiLLMAdapter.js';

/**
 * Create content LLM adapter based on environment configuration
 *
 * @param {Object} options - Override options
 * @param {string} [options.provider] - Override provider
 * @param {string} [options.model] - Override model
 * @param {boolean} [options.mockMode] - Force mock mode
 * @returns {LLMProviderAdapter} Configured LLM adapter
 * @throws {Error} If provider is not supported
 */
export function createContentLLMAdapter(options = {}) {
  const provider = options.provider || process.env.CONTENT_LLM_PROVIDER || 'google';
  const model = options.model || process.env.CONTENT_LLM_MODEL;
  const mockMode = options.mockMode !== undefined ? options.mockMode : process.env.LLM_MOCK_MODE === 'true';

  console.log(`[LLMFactory] Creating content LLM adapter: ${provider} (model: ${model || 'default'})`);

  switch (provider.toLowerCase()) {
    case 'google':
    case 'gemini':
      return new GeminiLLMAdapter({
        apiKey: process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY,
        model: model || process.env.CONTENT_LLM_MODEL || 'gemini-1.5-pro',
        mockMode
      });

    case 'openai':
      // TODO: Implement OpenAI adapter
      throw new Error('OpenAI adapter not yet implemented. Coming soon!');

    case 'anthropic':
    case 'claude':
      // TODO: Implement Anthropic adapter
      throw new Error('Anthropic adapter not yet implemented. Coming soon!');

    case 'mock':
      return new GeminiLLMAdapter({
        mockMode: true,
        model: 'mock'
      });

    default:
      throw new Error(`Unsupported LLM provider: ${provider}. Supported: google, openai, anthropic, mock`);
  }
}

/**
 * Get LLM configuration info
 *
 * @returns {Object} Configuration details
 */
export function getLLMConfig() {
  return {
    provider: process.env.CONTENT_LLM_PROVIDER || 'google',
    model: process.env.CONTENT_LLM_MODEL || 'gemini-1.5-pro',
    mockMode: process.env.LLM_MOCK_MODE === 'true',
    hasGoogleKey: !!(process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY),
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY
  };
}
