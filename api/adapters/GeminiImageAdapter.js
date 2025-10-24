/**
 * GeminiImageAdapter - Google Gemini AI image generation adapter
 * Uses Google's Generative AI for high-quality presentation images
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import BaseImageAdapter from './BaseImageAdapter.js';
import { enhancePrompt, sanitizePrompt } from '../utils/promptEnhancer.js';

export class GeminiImageAdapter extends BaseImageAdapter {
  constructor(config = {}) {
    super(config);

    this.apiKey = config.apiKey || process.env.GEMINI_API_KEY;
    this.imageModel = config.model || 'gemini-2.5-flash-image'; // Gemini 2.5 Flash Image model

    if (!this.apiKey) {
      console.warn('GeminiImageAdapter: No API key provided. Image generation will fail.');
    }

    // Initialize Gemini client
    if (this.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
    }
  }

  /**
   * Generate image using Gemini
   *
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async generate(options) {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const validation = await this.validate(options);
    if (!validation.valid) {
      throw new Error(`Invalid options: ${validation.errors.join(', ')}`);
    }

    const { prompt, aspectRatio = '16:9', style = 'professional-presentation' } = options;
    const theme = options.theme?.name || 'professional';

    // Sanitize and enhance the prompt
    const sanitizedPrompt = sanitizePrompt(prompt);
    const enhancedPrompt = enhancePrompt(sanitizedPrompt, style, theme, {
      forTextOverlay: true
    });

    try {
      // Note: As of early 2025, Gemini's image generation API may still be in preview
      // This is a mock implementation that demonstrates the pattern
      // In production, you would use the actual Gemini image generation endpoint

      const result = await this.generateWithGeminiAPI(enhancedPrompt, aspectRatio);

      return {
        url: result.url,
        type: 'generated',
        metadata: {
          provider: 'gemini',
          model: this.imageModel,
          prompt: enhancedPrompt,
          originalPrompt: prompt,
          aspectRatio,
          style,
          theme,
          generatedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      // Add context to error
      error.code = error.code || 'GEMINI_GENERATION_ERROR';
      throw error;
    }
  }

  /**
   * Generate image with Gemini 2.5 Flash Image
   */
  async generateWithGeminiAPI(prompt, aspectRatio) {
    // Mock mode for testing without API calls
    if (process.env.GEMINI_MOCK_MODE === 'true') {
      return this.generateMockResponse(prompt, aspectRatio);
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: this.imageModel });

      // Add aspect ratio hint to prompt
      const promptWithRatio = `${prompt}. Aspect ratio: ${aspectRatio}`;

      // Generate image using Gemini 2.5 Flash Image
      const result = await model.generateContent(promptWithRatio);
      const response = result.response;

      // Extract image from response
      const imageUrl = this.extractImageUrl(response);

      if (!imageUrl) {
        throw new Error('No image data in Gemini response');
      }

      return {
        url: imageUrl,
        raw: result
      };
    } catch (error) {
      // Log helpful error messages
      if (error.message?.includes('not supported') || error.message?.includes('not available')) {
        console.warn('Gemini image generation not available, falling back');
      }
      throw error;
    }
  }

  /**
   * Generate mock response for testing without API
   */
  generateMockResponse(prompt, aspectRatio) {
    // Return a placeholder URL that indicates this is a mock
    const mockUrl = `https://placehold.co/${this.getAspectRatioDimensions(aspectRatio)}/3b82f6/white?text=${encodeURIComponent('Gemini+Mock+Image')}`;

    return {
      url: mockUrl,
      mock: true
    };
  }

  /**
   * Extract image URL from Gemini response
   * Response structure is speculative - adjust based on actual API
   */
  extractImageUrl(result) {
    // Method 1: Direct URL in response
    if (result.response?.image?.url) {
      return result.response.image.url;
    }

    // Method 2: Base64 image data
    if (result.response?.image?.data) {
      return `data:image/png;base64,${result.response.image.data}`;
    }

    // Method 3: From candidates
    if (result.response?.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
      const inlineData = result.response.candidates[0].content.parts[0].inlineData;
      return `data:${inlineData.mimeType};base64,${inlineData.data}`;
    }

    return null;
  }

  /**
   * Get dimensions for aspect ratio (for placeholder URLs)
   */
  getAspectRatioDimensions(aspectRatio) {
    const dimensions = {
      '16:9': '1600x900',
      '9:16': '900x1600',
      '4:3': '1200x900',
      '3:4': '900x1200',
      '1:1': '1000x1000'
    };
    return dimensions[aspectRatio] || '1600x900';
  }

  /**
   * Check if Gemini is properly configured
   */
  getStatus() {
    return {
      name: 'GeminiImageAdapter',
      available: !!this.apiKey,
      configured: !!this.apiKey,
      model: this.imageModel,
      timeout: this.timeout,
      retries: this.retries,
      mockMode: process.env.GEMINI_MOCK_MODE === 'true',
      description: 'Google Gemini AI image generation'
    };
  }

  /**
   * Test the connection to Gemini
   */
  async testConnection() {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'No API key configured'
      };
    }

    try {
      // Simple test to verify API key works
      const model = this.genAI.getGenerativeModel({ model: this.model });
      await model.generateContent({
        contents: [{ parts: [{ text: 'test' }] }]
      });

      return {
        success: true,
        message: 'Gemini API connection successful'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default GeminiImageAdapter;
