/**
 * Prompt Loader
 * Phase 4: Content Generation Architecture
 *
 * Loads and caches prompt templates from the api/prompts/ directory
 * Supports markdown (.md) and JSON (.json) files
 *
 * Features:
 * - File-based prompt management
 * - LRU caching for performance
 * - Template composition (combine multiple prompts)
 * - Hot reload support for development
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Prompt loader with caching
 *
 * @class
 */
export class PromptLoader {
  /**
   * Create a prompt loader
   *
   * @param {Object} config - Configuration
   * @param {string} [config.promptsDir] - Base directory for prompts (default: api/prompts)
   * @param {boolean} [config.cache=true] - Enable caching
   * @param {number} [config.cacheTTL=3600000] - Cache TTL in ms (default: 1 hour)
   */
  constructor(config = {}) {
    this.promptsDir = config.promptsDir ||
      path.join(__dirname, '../../prompts');

    this.enableCache = config.cache !== false;
    this.cacheTTL = config.cacheTTL || 3600000; // 1 hour default

    // Cache: Map<string, {content: string, timestamp: number}>
    this.cache = new Map();

    console.log(`[PromptLoader] Initialized with prompts directory: ${this.promptsDir}`);
  }

  /**
   * Load a prompt from a file
   *
   * @param {string} promptPath - Relative path from prompts directory
   * @returns {Promise<string>} Prompt content
   * @throws {Error} If file not found or read fails
   *
   * @example
   * // Load base presentation designer prompt
   * const prompt = await loader.load('presentation-designer/base.md');
   *
   * // Load education framework
   * const framework = await loader.load('presentation-designer/frameworks/education.md');
   */
  async load(promptPath) {
    if (!promptPath || typeof promptPath !== 'string') {
      throw new Error('promptPath must be a non-empty string');
    }

    // Check cache first
    if (this.enableCache) {
      const cached = this._getFromCache(promptPath);
      if (cached) {
        console.log(`[PromptLoader] Cache hit: ${promptPath}`);
        return cached;
      }
    }

    // Load from file
    const fullPath = path.join(this.promptsDir, promptPath);

    try {
      const content = await fs.readFile(fullPath, 'utf-8');

      // Cache the result
      if (this.enableCache) {
        this._addToCache(promptPath, content);
      }

      console.log(`[PromptLoader] Loaded: ${promptPath} (${content.length} chars)`);
      return content;

    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Prompt file not found: ${promptPath}`);
      }
      throw new Error(`Failed to load prompt ${promptPath}: ${error.message}`);
    }
  }

  /**
   * Load and parse a JSON file
   *
   * @param {string} jsonPath - Relative path to JSON file
   * @returns {Promise<Object|Array>} Parsed JSON
   * @throws {Error} If file not found, read fails, or JSON is invalid
   *
   * @example
   * // Load example structure
   * const example = await loader.loadJSON('presentation-designer/examples/education-example.json');
   */
  async loadJSON(jsonPath) {
    const content = await this.load(jsonPath);

    try {
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Invalid JSON in ${jsonPath}: ${error.message}`);
    }
  }

  /**
   * Compose multiple prompts into one
   *
   * @param {string[]} promptPaths - Array of prompt paths to combine
   * @param {string} [separator='\n\n---\n\n'] - Separator between prompts
   * @returns {Promise<string>} Combined prompt
   *
   * @example
   * // Combine base prompt + framework + examples
   * const fullPrompt = await loader.compose([
   *   'presentation-designer/base.md',
   *   'presentation-designer/frameworks/education.md'
   * ]);
   */
  async compose(promptPaths, separator = '\n\n---\n\n') {
    if (!Array.isArray(promptPaths) || promptPaths.length === 0) {
      throw new Error('promptPaths must be a non-empty array');
    }

    const prompts = await Promise.all(
      promptPaths.map(path => this.load(path))
    );

    return prompts.join(separator);
  }

  /**
   * Load a prompt with variable substitution
   *
   * @param {string} promptPath - Path to prompt template
   * @param {Object} variables - Variables to substitute
   * @returns {Promise<string>} Prompt with variables replaced
   *
   * @example
   * // Prompt contains: "Topic: {{topic}}"
   * const prompt = await loader.loadWithVariables(
   *   'copywriter/sections/title-generation.md',
   *   { topic: 'AI Ethics', tone: 'professional' }
   * );
   * // Result: "Topic: AI Ethics"
   */
  async loadWithVariables(promptPath, variables = {}) {
    let content = await this.load(promptPath);

    // Replace {{variable}} patterns
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      content = content.replace(regex, String(value));
    }

    // Check for unreplaced variables
    const unreplaced = content.match(/\{\{[^}]+\}\}/g);
    if (unreplaced) {
      console.warn(`[PromptLoader] Unreplaced variables in ${promptPath}:`, unreplaced);
    }

    return content;
  }

  /**
   * Clear the cache
   *
   * @param {string} [promptPath] - Clear specific prompt, or all if not provided
   */
  clearCache(promptPath = null) {
    if (promptPath) {
      this.cache.delete(promptPath);
      console.log(`[PromptLoader] Cleared cache for: ${promptPath}`);
    } else {
      this.cache.clear();
      console.log('[PromptLoader] Cleared all cache');
    }
  }

  /**
   * Reload a prompt (bypass cache)
   *
   * @param {string} promptPath - Path to reload
   * @returns {Promise<string>} Fresh prompt content
   */
  async reload(promptPath) {
    this.clearCache(promptPath);
    return this.load(promptPath);
  }

  /**
   * Check if a prompt file exists
   *
   * @param {string} promptPath - Path to check
   * @returns {Promise<boolean>} True if file exists
   */
  async exists(promptPath) {
    const fullPath = path.join(this.promptsDir, promptPath);

    try {
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * List all prompts in a directory
   *
   * @param {string} [dirPath=''] - Subdirectory to list
   * @returns {Promise<string[]>} Array of prompt file paths
   */
  async list(dirPath = '') {
    const fullPath = path.join(this.promptsDir, dirPath);

    try {
      const entries = await fs.readdir(fullPath, { withFileTypes: true });

      const files = entries
        .filter(entry => entry.isFile() && (
          entry.name.endsWith('.md') || entry.name.endsWith('.json')
        ))
        .map(entry => path.join(dirPath, entry.name));

      return files;

    } catch (error) {
      throw new Error(`Failed to list prompts in ${dirPath}: ${error.message}`);
    }
  }

  /**
   * Get cache statistics
   *
   * @returns {Object} Cache stats
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      enabled: this.enableCache,
      ttl: this.cacheTTL,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Get from cache if valid
   *
   * @private
   * @param {string} key - Cache key
   * @returns {string|null} Cached content or null
   */
  _getFromCache(key) {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    const age = Date.now() - entry.timestamp;
    if (age > this.cacheTTL) {
      this.cache.delete(key);
      return null;
    }

    return entry.content;
  }

  /**
   * Add to cache
   *
   * @private
   * @param {string} key - Cache key
   * @param {string} content - Content to cache
   */
  _addToCache(key, content) {
    this.cache.set(key, {
      content,
      timestamp: Date.now()
    });

    // Simple LRU: limit cache size
    const MAX_CACHE_SIZE = 100;
    if (this.cache.size > MAX_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }
}

// Export singleton instance
export const promptLoader = new PromptLoader();

export default PromptLoader;
