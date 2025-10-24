/**
 * BaseImageAdapter - Abstract base class for image generation providers
 * All image adapters must extend this class and implement the generate() method
 */

export class BaseImageAdapter {
  constructor(config = {}) {
    this.config = config;
    this.name = this.constructor.name;
    this.timeout = config.timeout || 30000; // 30 seconds default
    this.retries = config.retries || 2;
  }

  /**
   * Generate an image from a prompt
   * Must be implemented by subclasses
   *
   * @param {Object} options - Generation options
   * @param {string} options.prompt - The image generation prompt
   * @param {string} options.aspectRatio - Aspect ratio (e.g., '16:9', '1:1', '4:3', '9:16')
   * @param {string} options.style - Style preset (e.g., 'professional-presentation', 'abstract', 'minimalist')
   * @returns {Promise<Object>} - { url: string, metadata: Object }
   */
  async generate(options) {
    throw new Error(`${this.name}.generate() must be implemented by subclass`);
  }

  /**
   * Validate generation options
   *
   * @param {Object} options - Options to validate
   * @returns {Object} - { valid: boolean, errors: string[] }
   */
  async validate(options) {
    const errors = [];

    // Prompt validation
    if (!options.prompt || typeof options.prompt !== 'string') {
      errors.push('Prompt is required and must be a string');
    }

    if (options.prompt && options.prompt.length > 500) {
      errors.push('Prompt must be 500 characters or less');
    }

    // Optional: Aspect ratio validation (only if provided)
    if (options.aspectRatio && !this.isValidAspectRatio(options.aspectRatio)) {
      errors.push('Aspect ratio must be one of: 1:1, 16:9, 9:16, 4:3, 3:4');
    }

    // Optional: Style validation (only if provided and not empty)
    if (options.style && options.style.trim() !== '' && !this.isValidStyle(options.style)) {
      errors.push('Style must be one of: professional-presentation, abstract, minimalist, illustrative, or omit for default');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if aspect ratio is valid
   */
  isValidAspectRatio(ratio) {
    const validRatios = ['1:1', '16:9', '9:16', '4:3', '3:4'];
    return validRatios.includes(ratio);
  }

  /**
   * Check if style is valid
   */
  isValidStyle(style) {
    const validStyles = ['professional-presentation', 'abstract', 'minimalist', 'illustrative'];
    return validStyles.includes(style);
  }

  /**
   * Standardize error format
   *
   * @param {Error} error - The error to handle
   * @returns {Object} - Standardized error object
   */
  handleError(error) {
    return {
      provider: this.name,
      error: error.message,
      code: error.code || 'UNKNOWN_ERROR',
      timestamp: new Date().toISOString(),
      retryable: this.isRetryableError(error)
    };
  }

  /**
   * Determine if an error is retryable
   */
  isRetryableError(error) {
    const retryableCodes = [
      'ETIMEDOUT',
      'ECONNRESET',
      'ENOTFOUND',
      'RATE_LIMIT',
      'SERVICE_UNAVAILABLE',
      'TIMEOUT'
    ];

    return retryableCodes.includes(error.code) ||
           error.message?.includes('timeout') ||
           error.message?.includes('rate limit');
  }

  /**
   * Generate with timeout wrapper
   */
  async generateWithTimeout(options) {
    return Promise.race([
      this.generate(options),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT: Image generation exceeded timeout')), this.timeout)
      )
    ]);
  }

  /**
   * Generate with retry logic
   */
  async generateWithRetry(options) {
    let lastError;

    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const result = await this.generateWithTimeout(options);
        return result;
      } catch (error) {
        lastError = error;

        if (!this.isRetryableError(error) || attempt === this.retries) {
          throw this.handleError(error);
        }

        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw this.handleError(lastError);
  }

  /**
   * Get provider status
   */
  getStatus() {
    return {
      name: this.name,
      available: true,
      timeout: this.timeout,
      retries: this.retries
    };
  }
}

export default BaseImageAdapter;
