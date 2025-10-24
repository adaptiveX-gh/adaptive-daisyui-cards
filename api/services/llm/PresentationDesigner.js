/**
 * Presentation Designer Service
 * Phase 4: Content Generation Architecture
 *
 * Generates presentation structure and narrative arc using LLM
 * First stage in the 3-stage content generation pipeline
 *
 * Pipeline: PresentationDesigner → VisualDesigner → Copywriter
 */

import { PromptLoader } from './PromptLoader.js';

/**
 * Presentation structure generator
 *
 * @class
 */
export class PresentationDesigner {
  /**
   * Create a presentation designer
   *
   * @param {LLMProviderAdapter} llmAdapter - LLM adapter instance
   * @param {PromptLoader} [promptLoader] - Prompt loader instance
   */
  constructor(llmAdapter, promptLoader = null) {
    if (!llmAdapter) {
      throw new Error('LLMProviderAdapter is required');
    }

    this.llmAdapter = llmAdapter;
    this.promptLoader = promptLoader || new PromptLoader();

    console.log('[PresentationDesigner] Initialized');
  }

  /**
   * Generate presentation structure
   *
   * @param {Object} params - Generation parameters
   * @param {string} params.topic - Main topic or goal
   * @param {string} [params.presentationType='education'] - pitch | education | report | workshop | story
   * @param {string} [params.audience='general'] - Target audience description
   * @param {number} [params.cardCount=6] - Number of cards to generate
   * @param {string} [params.context=''] - Additional context
   * @param {number} [params.temperature=0.7] - LLM temperature
   * @returns {Promise<Object>} Presentation structure
   * @throws {Error} If generation fails
   *
   * @example
   * const structure = await designer.generateStructure({
   *   topic: 'AI Ethics in Healthcare',
   *   presentationType: 'education',
   *   audience: 'medical professionals',
   *   cardCount: 8
   * });
   */
  async generateStructure(params) {
    this._validateParams(params);

    const {
      topic,
      presentationType = 'education',
      audience = 'general',
      cardCount = 6,
      context = '',
      temperature = 0.7
    } = params;

    console.log(`[PresentationDesigner] Generating structure for: "${topic}" (${presentationType})`);

    try {
      // Compose prompt
      const prompt = await this._composePrompt({
        topic,
        presentationType,
        audience,
        cardCount,
        context
      });

      // Generate with LLM
      const response = await this.llmAdapter.generate({
        prompt,
        maxTokens: 4000,
        temperature,
        format: 'json'
      });

      // Parse response
      const structure = this._parseStructure(response);

      // Validate structure
      this._validateStructure(structure, cardCount);

      console.log(`[PresentationDesigner] ✓ Generated structure with ${structure.cards.length} cards`);
      return structure;

    } catch (error) {
      console.error('[PresentationDesigner] Generation failed:', error.message);
      throw new Error(`Failed to generate presentation structure: ${error.message}`);
    }
  }

  /**
   * Compose prompt from templates
   *
   * @private
   * @param {Object} params - Parameters
   * @returns {Promise<string>} Composed prompt
   */
  async _composePrompt(params) {
    const { topic, presentationType, audience, cardCount, context } = params;

    try {
      // Load system prompt
      const systemPrompt = await this.promptLoader.load('presentation-designer/system-prompt.md');

      // Load framework for presentation type
      const frameworkPath = `presentation-designer/${presentationType}.md`;
      const frameworkExists = await this.promptLoader.exists(frameworkPath);

      let framework = '';
      if (frameworkExists) {
        framework = await this.promptLoader.load(frameworkPath);
      } else {
        console.warn(`[PresentationDesigner] Framework not found: ${presentationType}, using base`);
        framework = await this.promptLoader.load('presentation-designer/base.md');
      }

      // Compose user request
      const userRequest = `
Generate a presentation structure for:

**Topic**: ${topic}
**Type**: ${presentationType}
**Audience**: ${audience}
**Card Count**: ${cardCount}
${context ? `**Context**: ${context}` : ''}

Please create a complete presentation outline following the JSON schema specified in your system prompt.
Focus on creating a compelling narrative arc that engages the audience and achieves the presentation goal.
`;

      // Combine all parts
      const fullPrompt = `${systemPrompt}

---

${framework}

---

${userRequest}`;

      return fullPrompt;

    } catch (error) {
      throw new Error(`Failed to compose prompt: ${error.message}`);
    }
  }

  /**
   * Parse LLM response into structure object
   *
   * @private
   * @param {string} response - Raw LLM response
   * @returns {Object} Parsed structure
   * @throws {Error} If parsing fails
   */
  _parseStructure(response) {
    // Try to extract JSON from response
    const json = this.llmAdapter._extractJSON(response);

    if (!json) {
      throw new Error('Failed to parse JSON from LLM response');
    }

    // Ensure required fields exist
    if (!json.meta) {
      json.meta = {
        title: 'Untitled Presentation',
        type: 'education',
        audience: 'general',
        goal: 'Inform and engage',
        duration_estimate: 'Variable'
      };
    }

    if (!json.cards || !Array.isArray(json.cards)) {
      throw new Error('Structure must contain cards array');
    }

    if (!json.narrative_arc) {
      json.narrative_arc = {
        opening: 'Hook with compelling question',
        development: 'Build understanding progressively',
        climax: 'Reveal key insight',
        closing: 'Call to action'
      };
    }

    if (!json.coherence) {
      json.coherence = {
        transitions: [],
        recurring_themes: [],
        callbacks: 'Build on earlier concepts'
      };
    }

    return json;
  }

  /**
   * Validate structure object
   *
   * @private
   * @param {Object} structure - Structure to validate
   * @param {number} expectedCardCount - Expected number of cards
   * @throws {Error} If validation fails
   */
  _validateStructure(structure, expectedCardCount) {
    // Check cards array
    if (!Array.isArray(structure.cards) || structure.cards.length === 0) {
      throw new Error('Structure must contain at least one card');
    }

    // Warn if card count doesn't match
    if (structure.cards.length !== expectedCardCount) {
      console.warn(`[PresentationDesigner] Card count mismatch: expected ${expectedCardCount}, got ${structure.cards.length}`);
    }

    // Validate each card
    for (const [index, card] of structure.cards.entries()) {
      if (!card.key_message) {
        throw new Error(`Card ${index + 1} missing key_message`);
      }

      if (!card.role) {
        console.warn(`Card ${index + 1} missing role, defaulting to 'body'`);
        card.role = 'body';
      }

      if (!card.content_type) {
        console.warn(`Card ${index + 1} missing content_type, defaulting to 'concept'`);
        card.content_type = 'concept';
      }

      // Ensure card_number is set
      if (!card.card_number) {
        card.card_number = index + 1;
      }

      // Ensure supporting_points is an array
      if (!Array.isArray(card.supporting_points)) {
        card.supporting_points = [];
      }
    }

    console.log('[PresentationDesigner] ✓ Structure validation passed');
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

    if (params.presentationType) {
      const validTypes = ['pitch', 'education', 'report', 'workshop', 'story'];
      if (!validTypes.includes(params.presentationType)) {
        throw new Error(`presentationType must be one of: ${validTypes.join(', ')}`);
      }
    }

    if (params.cardCount !== undefined) {
      if (typeof params.cardCount !== 'number' ||
          params.cardCount < 3 ||
          params.cardCount > 30) {
        throw new Error('cardCount must be a number between 3 and 30');
      }
    }
  }

  /**
   * Get supported presentation types
   *
   * @returns {string[]} Array of supported types
   */
  getSupportedTypes() {
    return ['pitch', 'education', 'report', 'workshop', 'story'];
  }
}

export default PresentationDesigner;
