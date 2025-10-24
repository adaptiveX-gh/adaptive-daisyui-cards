/**
 * ImageGenerationService - Main service for multi-provider image generation
 * Orchestrates image generation with fallback chain and async handling
 */

import GeminiImageAdapter from '../adapters/GeminiImageAdapter.js';
import PlaceholderAdapter from '../adapters/PlaceholderAdapter.js';
import { imageStatusStore } from './ImageStatusStore.js';
import { generateImagePromptFromCard, sanitizePrompt } from '../utils/promptEnhancer.js';

export class ImageGenerationService {
  constructor(config = {}) {
    this.config = config;

    // Initialize providers
    this.providers = {
      gemini: new GeminiImageAdapter({
        apiKey: config.geminiApiKey || process.env.GEMINI_API_KEY,
        timeout: config.timeout || parseInt(process.env.IMAGE_GENERATION_TIMEOUT || '30000'),
        retries: 2
      }),
      placeholder: new PlaceholderAdapter()
    };

    // Fallback chain: Gemini -> Placeholder
    this.fallbackChain = config.fallbackChain || ['gemini', 'placeholder'];

    // Status store
    this.statusStore = config.statusStore || imageStatusStore;

    // Enable/disable fallback
    this.fallbackEnabled = config.fallbackEnabled !== false &&
                           process.env.IMAGE_FALLBACK_ENABLED !== 'false';
  }

  /**
   * Generate image with specified provider
   *
   * @param {string} prompt - Image generation prompt
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} - Generated image result
   */
  async generateImage(prompt, options = {}) {
    const {
      provider = 'gemini',
      aspectRatio = '16:9',
      style = 'professional-presentation',
      theme = null
    } = options;

    // Sanitize prompt
    const sanitizedPrompt = sanitizePrompt(prompt);

    // Validate provider
    if (!this.providers[provider]) {
      throw new Error(`Unknown provider: ${provider}. Available: ${Object.keys(this.providers).join(', ')}`);
    }

    // Generate with selected provider
    const selectedProvider = this.providers[provider];

    try {
      const result = await selectedProvider.generateWithRetry({
        prompt: sanitizedPrompt,
        aspectRatio,
        style,
        theme
      });

      return {
        ...result,
        provider
      };
    } catch (error) {
      console.error(`ImageGenerationService: ${provider} failed:`, error.message);
      throw error;
    }
  }

  /**
   * Generate image with fallback chain
   * Tries providers in order until one succeeds
   *
   * @param {string} prompt - Image generation prompt
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} - Generated image result
   */
  async generateWithFallback(prompt, options = {}) {
    const errors = [];
    const chain = options.fallbackChain || this.fallbackChain;

    for (const providerName of chain) {
      try {
        console.log(`ImageGenerationService: Trying provider ${providerName}...`);

        const result = await this.generateImage(prompt, {
          ...options,
          provider: providerName
        });

        console.log(`ImageGenerationService: ${providerName} succeeded`);
        return result;

      } catch (error) {
        console.error(`ImageGenerationService: ${providerName} failed:`, error.message);
        errors.push({
          provider: providerName,
          error: error.message
        });

        // If fallback is disabled, throw immediately
        if (!this.fallbackEnabled) {
          throw error;
        }

        // Continue to next provider in chain
        continue;
      }
    }

    // All providers failed
    throw new Error(`All providers failed: ${JSON.stringify(errors)}`);
  }

  /**
   * Generate image asynchronously for a card
   * Returns placeholder immediately, generates real image in background
   *
   * @param {Object} card - Card object
   * @param {Object} options - Generation options
   * @returns {Object} - Immediate response with placeholder
   */
  generateImageAsync(card, options = {}) {
    const {
      provider = 'gemini',
      aspectRatio = '16:9',
      style = 'professional-presentation'
    } = options;

    // Generate prompt from card content if not provided
    const prompt = options.prompt || generateImagePromptFromCard(card);

    // Get placeholder immediately
    const placeholderProvider = this.providers.placeholder;
    const placeholderResult = placeholderProvider.generate({
      prompt,
      aspectRatio,
      style,
      theme: card.theme
    });

    // Set initial status
    this.statusStore.set(card.id, {
      status: 'generating',
      provider,
      prompt,
      placeholder: placeholderResult,
      startedAt: new Date().toISOString()
    });

    // Start background generation (don't await)
    this.generateInBackground(card.id, prompt, {
      provider,
      aspectRatio,
      style,
      theme: card.theme
    }).catch(error => {
      console.error(`Background generation failed for card ${card.id}:`, error);
    });

    // Return placeholder immediately
    return {
      image: {
        status: 'generating',
        url: null,
        provider,
        placeholder: {
          type: placeholderResult.placeholderType,
          url: placeholderResult.url,
          loadingState: true,
          aspectRatio
        },
        error: null,
        generatedAt: null
      }
    };
  }

  /**
   * Generate image in background and update status
   *
   * @param {string} cardId - Card ID
   * @param {string} prompt - Image prompt
   * @param {Object} options - Generation options
   */
  async generateInBackground(cardId, prompt, options) {
    try {
      // Generate with fallback
      const result = await this.generateWithFallback(prompt, options);

      // Update status to ready
      this.statusStore.update(cardId, {
        status: 'ready',
        url: result.url,
        metadata: result.metadata,
        completedAt: new Date().toISOString()
      });

      console.log(`Background generation completed for card ${cardId}`);

    } catch (error) {
      // Update status to failed
      this.statusStore.update(cardId, {
        status: 'failed',
        error: error.message,
        failedAt: new Date().toISOString()
      });

      console.error(`Background generation failed for card ${cardId}:`, error);
    }
  }

  /**
   * Get image generation status for a card
   *
   * @param {string} cardId - Card ID
   * @returns {Object|null} - Status object or null
   */
  getImageStatus(cardId) {
    const status = this.statusStore.get(cardId);

    if (!status) {
      return null;
    }

    return {
      cardId,
      status: status.status,
      provider: status.provider,
      url: status.url || null,
      placeholder: status.placeholder || null,
      error: status.error || null,
      startedAt: status.startedAt,
      updatedAt: status.updatedAt,
      completedAt: status.completedAt || null
    };
  }

  /**
   * Cancel image generation for a card
   *
   * @param {string} cardId - Card ID
   * @returns {boolean} - True if cancelled, false if not found
   */
  cancelGeneration(cardId) {
    const status = this.statusStore.get(cardId);

    if (!status) {
      return false;
    }

    // Update status to cancelled
    this.statusStore.update(cardId, {
      status: 'cancelled',
      cancelledAt: new Date().toISOString()
    });

    return true;
  }

  /**
   * Regenerate image with different provider
   *
   * @param {string} cardId - Card ID
   * @param {string} provider - New provider to try
   * @returns {Object} - New status
   */
  async regenerateImage(cardId, provider = 'gemini') {
    const currentStatus = this.statusStore.get(cardId);

    if (!currentStatus) {
      throw new Error(`No generation found for card: ${cardId}`);
    }

    const { prompt, aspectRatio, style, theme } = currentStatus;

    // Update status
    this.statusStore.update(cardId, {
      status: 'generating',
      provider,
      retriedAt: new Date().toISOString()
    });

    // Start background generation
    this.generateInBackground(cardId, prompt, {
      provider,
      aspectRatio,
      style,
      theme
    }).catch(error => {
      console.error(`Regeneration failed for card ${cardId}:`, error);
    });

    return this.getImageStatus(cardId);
  }

  /**
   * Get status of all providers
   *
   * @returns {Object} - Provider statuses
   */
  getProviderStatuses() {
    const statuses = {};

    for (const [name, provider] of Object.entries(this.providers)) {
      statuses[name] = provider.getStatus();
    }

    return statuses;
  }

  /**
   * Get service statistics
   *
   * @returns {Object}
   */
  getStats() {
    return {
      providers: this.getProviderStatuses(),
      fallbackChain: this.fallbackChain,
      fallbackEnabled: this.fallbackEnabled,
      statusStore: this.statusStore.getStats()
    };
  }

  /**
   * Test provider connection
   *
   * @param {string} providerName - Provider to test
   * @returns {Promise<Object>}
   */
  async testProvider(providerName) {
    const provider = this.providers[providerName];

    if (!provider) {
      return {
        provider: providerName,
        success: false,
        error: 'Provider not found'
      };
    }

    // Placeholder always works
    if (providerName === 'placeholder') {
      return {
        provider: providerName,
        success: true,
        message: 'Placeholder provider always available'
      };
    }

    // Test Gemini connection
    if (providerName === 'gemini' && provider.testConnection) {
      const result = await provider.testConnection();
      return {
        provider: providerName,
        ...result
      };
    }

    return {
      provider: providerName,
      success: true,
      message: 'Provider available'
    };
  }
}

// Create singleton instance
export const imageGenerationService = new ImageGenerationService();

export default ImageGenerationService;
