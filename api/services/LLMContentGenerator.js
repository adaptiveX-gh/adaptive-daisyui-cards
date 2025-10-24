/**
 * LLM Content Generator (Orchestrator)
 * Phase 4: Content Generation Architecture
 *
 * Main orchestrator that coordinates the 3-stage content generation pipeline:
 * 1. PresentationDesigner → 2. VisualDesigner → 3. Copywriter
 *
 * This is the primary interface for "smart mode" content generation.
 */

import { GeminiLLMAdapter } from './adapters/GeminiLLMAdapter.js';
import { PresentationDesigner } from './llm/PresentationDesigner.js';
import { VisualDesigner } from './llm/VisualDesigner.js';
import { Copywriter } from './llm/Copywriter.js';
import { PromptLoader } from './llm/PromptLoader.js';

/**
 * Main content generation orchestrator
 *
 * @class
 */
export class LLMContentGenerator {
  /**
   * Create content generator
   *
   * @param {Object} config - Configuration
   * @param {LLMProviderAdapter} [config.adapter] - Custom LLM adapter (defaults to Gemini)
   * @param {boolean} [config.mockMode=false] - Use mock mode for testing
   * @param {string} [config.apiKey] - LLM API key
   * @param {string} [config.model] - LLM model name
   */
  constructor(config = {}) {
    // Initialize LLM adapter
    if (config.adapter) {
      this.adapter = config.adapter;
    } else {
      this.adapter = new GeminiLLMAdapter({
        apiKey: config.apiKey,
        model: config.model,
        mockMode: config.mockMode
      });
    }

    // Initialize prompt loader (shared across services)
    this.promptLoader = new PromptLoader();

    // Initialize the three services
    this.presentationDesigner = new PresentationDesigner(this.adapter, this.promptLoader);
    this.visualDesigner = new VisualDesigner(this.adapter, this.promptLoader);
    this.copywriter = new Copywriter(this.adapter, this.promptLoader);

    console.log('[LLMContentGenerator] Initialized with', this.adapter.getName(), 'adapter');
  }

  /**
   * Generate complete presentation with LLM
   *
   * This is the main method for "smart mode" generation.
   * Runs the full 3-stage pipeline.
   *
   * @param {Object} params - Generation parameters
   * @param {string} params.topic - Main topic or goal
   * @param {number} [params.cardCount=6] - Number of cards to generate
   * @param {string} [params.presentationType='education'] - pitch | education | report | workshop | story
   * @param {string} [params.audience='general'] - Target audience
   * @param {string} [params.tone='professional'] - Copy tone
   * @param {string} [params.context=''] - Additional context
   * @param {Object} [params.temperatures] - Custom temperatures for each stage
   * @returns {Promise<Object>} Complete presentation with cards
   * @throws {Error} If generation fails
   *
   * @example
   * const presentation = await generator.generatePresentation({
   *   topic: 'The Future of AI in Healthcare',
   *   cardCount: 8,
   *   presentationType: 'education',
   *   audience: 'medical professionals',
   *   tone: 'professional'
   * });
   */
  async generatePresentation(params) {
    this._validateParams(params);

    const {
      topic,
      cardCount = 6,
      presentationType = 'education',
      audience = 'general',
      tone = 'professional',
      context = '',
      temperatures = {}
    } = params;

    console.log(`\n[LLMContentGenerator] 🚀 Starting smart generation for: "${topic}"`);
    console.log(`[LLMContentGenerator] Type: ${presentationType}, Cards: ${cardCount}, Tone: ${tone}`);

    const startTime = Date.now();

    try {
      // Stage 1: Generate presentation structure
      console.log('\n[Stage 1/3] 📋 Designing presentation structure...');
      const structure = await this.presentationDesigner.generateStructure({
        topic,
        presentationType,
        audience,
        cardCount,
        context,
        temperature: temperatures.structure || 0.7
      });

      // Stage 2: Assign layouts to cards
      console.log('\n[Stage 2/3] 🎨 Assigning visual layouts...');
      const enrichedStructure = await this.visualDesigner.assignLayouts({
        structure,
        presentationType,
        temperature: temperatures.layouts || 0.5
      });

      // Stage 3: Generate copy for each card
      console.log('\n[Stage 3/3] ✍️  Writing copy...');
      const cards = await this.copywriter.generateCards({
        structure: enrichedStructure,
        tone,
        temperature: temperatures.copy || 0.7
      });

      const totalTime = Date.now() - startTime;

      console.log(`\n[LLMContentGenerator] ✅ Generation complete in ${(totalTime / 1000).toFixed(1)}s`);
      console.log(`[LLMContentGenerator] Generated ${cards.length} cards`);

      // Return complete presentation
      return {
        meta: {
          ...enrichedStructure.meta,
          generatedAt: new Date().toISOString(),
          generationTimeMs: totalTime,
          mode: 'smart'
        },
        cards: cards,
        narrative_arc: enrichedStructure.narrative_arc,
        visual_theme: enrichedStructure.visual_theme,
        coherence: enrichedStructure.coherence
      };

    } catch (error) {
      console.error('[LLMContentGenerator] Generation failed:', error.message);
      throw new Error(`Failed to generate presentation: ${error.message}`);
    }
  }

  /**
   * Generate a single card with LLM
   *
   * For adding individual cards to an existing presentation.
   *
   * @param {Object} params - Parameters
   * @param {string} params.keyMessage - The card's main message
   * @param {string[]} [params.supportingPoints=[]] - Additional points
   * @param {string} [params.layout='sidebar-layout'] - Layout type
   * @param {string} [params.tone='professional'] - Copy tone
   * @param {string} [params.context=''] - Presentation context
   * @returns {Promise<Object>} Single card object
   * @throws {Error} If generation fails
   */
  async generateCard(params) {
    const {
      keyMessage,
      supportingPoints = [],
      layout = 'sidebar-layout',
      tone = 'professional',
      context = ''
    } = params;

    if (!keyMessage) {
      throw new Error('keyMessage is required');
    }

    console.log(`[LLMContentGenerator] Generating single card: "${keyMessage}"`);

    try {
      // Create minimal structure for single card
      const structure = {
        meta: {
          title: 'Single Card',
          audience: 'general'
        },
        cards: [{
          card_number: 1,
          role: 'body',
          key_message: keyMessage,
          supporting_points: supportingPoints,
          layout: layout,
          content_type: 'concept'
        }]
      };

      // Generate copy
      const cards = await this.copywriter.generateCards({
        structure,
        tone,
        temperature: 0.7
      });

      return cards[0];

    } catch (error) {
      console.error('[LLMContentGenerator] Card generation failed:', error.message);
      throw new Error(`Failed to generate card: ${error.message}`);
    }
  }

  /**
   * Check if LLM is available
   *
   * @returns {Promise<boolean>} True if ready to generate
   */
  async isAvailable() {
    return await this.adapter.isAvailable();
  }

  /**
   * Get LLM provider name
   *
   * @returns {string} Provider name
   */
  getProviderName() {
    return this.adapter.getName();
  }

  /**
   * Validate generation parameters
   *
   * @private
   * @param {Object} params - Parameters to validate
   * @throws {Error} If invalid
   */
  _validateParams(params) {
    if (!params) {
      throw new Error('Generation parameters are required');
    }

    if (!params.topic || typeof params.topic !== 'string') {
      throw new Error('topic must be a non-empty string');
    }

    if (params.topic.length < 3) {
      throw new Error('topic is too short (minimum 3 characters)');
    }

    if (params.topic.length > 500) {
      throw new Error('topic is too long (maximum 500 characters)');
    }

    if (params.cardCount !== undefined) {
      if (typeof params.cardCount !== 'number' ||
          params.cardCount < 3 ||
          params.cardCount > 30) {
        throw new Error('cardCount must be between 3 and 30');
      }
    }

    const validTypes = ['pitch', 'education', 'report', 'workshop', 'story'];
    if (params.presentationType && !validTypes.includes(params.presentationType)) {
      throw new Error(`presentationType must be one of: ${validTypes.join(', ')}`);
    }

    const validTones = ['professional', 'creative', 'minimal', 'inspirational'];
    if (params.tone && !validTones.includes(params.tone)) {
      console.warn(`[LLMContentGenerator] Unknown tone "${params.tone}", using default`);
    }
  }

  /**
   * Get supported configuration options
   *
   * @returns {Object} Supported options
   */
  getSupportedOptions() {
    return {
      presentationTypes: this.presentationDesigner.getSupportedTypes(),
      layouts: this.visualDesigner.getAvailableLayouts(),
      tones: this.copywriter.getSupportedTones()
    };
  }
}

export default LLMContentGenerator;
