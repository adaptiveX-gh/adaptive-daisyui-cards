/**
 * PlaceholderAdapter - Adapter wrapper for PlaceholderService
 * Provides instant placeholder images as a fallback option
 */

import BaseImageAdapter from './BaseImageAdapter.js';
import PlaceholderService from '../services/PlaceholderService.js';

export class PlaceholderAdapter extends BaseImageAdapter {
  constructor(config = {}) {
    super(config);
    this.placeholderService = new PlaceholderService();
  }

  /**
   * Validate options - more lenient than base class
   * Placeholder should always work as final fallback
   */
  async validate(options) {
    const errors = [];

    // Only validate prompt - everything else has defaults
    if (!options.prompt || typeof options.prompt !== 'string') {
      errors.push('Prompt is required and must be a string');
    }

    if (options.prompt && options.prompt.length > 500) {
      errors.push('Prompt must be 500 characters or less');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate a placeholder image
   * Always succeeds instantly - this is the final fallback
   *
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async generate(options) {
    const validation = await this.validate(options);
    if (!validation.valid) {
      throw new Error(`Invalid options: ${validation.errors.join(', ')}`);
    }

    const { prompt, aspectRatio = '16:9', style = 'professional-presentation' } = options;

    // Extract theme from options or use defaults
    const theme = options.theme || this.getDefaultThemeForStyle(style);

    // Generate placeholder based on prompt hash
    const placeholder = this.placeholderService.selectPlaceholder(theme, aspectRatio, prompt);

    // Convert SVG to data URL for inline use
    const dataUrl = this.svgToDataUrl(placeholder.svg);

    return {
      url: dataUrl,
      type: 'placeholder',
      placeholderType: placeholder.type,
      metadata: {
        provider: 'placeholder',
        type: placeholder.type,
        aspectRatio: placeholder.aspectRatio,
        loadingState: false, // Placeholder is final, not loading
        instant: true,
        generatedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Convert SVG string to data URL
   */
  svgToDataUrl(svg) {
    const encoded = Buffer.from(svg).toString('base64');
    return `data:image/svg+xml;base64,${encoded}`;
  }

  /**
   * Get default theme colors based on style
   */
  getDefaultThemeForStyle(style) {
    const themes = {
      'professional-presentation': {
        colors: {
          primary: '#3b82f6',
          secondary: '#1e40af',
          accent: '#60a5fa',
          background: '#f8fafc',
          text: '#1e293b'
        }
      },
      'abstract': {
        colors: {
          primary: '#8b5cf6',
          secondary: '#ec4899',
          accent: '#f59e0b',
          background: '#faf5ff',
          text: '#581c87'
        }
      },
      'minimalist': {
        colors: {
          primary: '#64748b',
          secondary: '#334155',
          accent: '#94a3b8',
          background: '#ffffff',
          text: '#0f172a'
        }
      },
      'illustrative': {
        colors: {
          primary: '#10b981',
          secondary: '#059669',
          accent: '#34d399',
          background: '#f0fdf4',
          text: '#064e3b'
        }
      }
    };

    return themes[style] || themes['professional-presentation'];
  }

  /**
   * Placeholder generation never fails, so this always returns true
   */
  getStatus() {
    return {
      name: 'PlaceholderAdapter',
      available: true,
      instant: true,
      timeout: 0,
      retries: 0,
      description: 'Instant SVG placeholder generation'
    };
  }
}

export default PlaceholderAdapter;
