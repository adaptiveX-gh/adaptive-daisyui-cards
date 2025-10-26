/**
 * Copywriter Service
 * Phase 4: Content Generation Architecture
 *
 * Generates polished copy for each card based on structure and layout
 * Third and final stage in the 3-stage content generation pipeline
 *
 * Pipeline: PresentationDesigner → VisualDesigner → Copywriter
 */

import { PromptLoader } from './PromptLoader.js';

/**
 * Card copy generator
 *
 * @class
 */
export class Copywriter {
  /**
   * Create a copywriter
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

    console.log('[Copywriter] Initialized');
  }

  /**
   * Generate copy for all cards in structure
   *
   * @param {Object} params - Generation parameters
   * @param {Object} params.structure - Presentation structure with layouts
   * @param {string} [params.tone='professional'] - professional | creative | minimal | inspirational
   * @param {number} [params.temperature=0.7] - LLM temperature
   * @returns {Promise<Array>} Array of card objects with generated copy
   * @throws {Error} If generation fails
   *
   * @example
   * const cards = await copywriter.generateCards({
   *   structure: enrichedStructure,
   *   tone: 'professional'
   * });
   */
  async generateCards(params) {
    this._validateParams(params);

    const {
      structure,
      tone = 'professional',
      temperature = 0.7
    } = params;

    console.log(`[Copywriter] Generating copy for ${structure.cards.length} cards (tone: ${tone})`);

    try {
      const cards = [];

      // Generate copy for each card
      for (const [index, cardData] of structure.cards.entries()) {
        console.log(`[Copywriter] Processing card ${index + 1}/${structure.cards.length}`);

        const card = await this._generateCard({
          cardData,
          structure,
          tone,
          temperature,
          index
        });

        cards.push(card);
      }

      console.log(`[Copywriter] ✓ Generated copy for ${cards.length} cards`);
      return cards;

    } catch (error) {
      console.error('[Copywriter] Generation failed:', error.message);
      throw new Error(`Failed to generate card copy: ${error.message}`);
    }
  }

  /**
   * Generate copy for a single card
   *
   * @private
   * @param {Object} params - Parameters
   * @returns {Promise<Object>} Card with copy
   */
  async _generateCard(params) {
    const { cardData, structure, tone, temperature, index } = params;

    try {
      // Compose prompt
      const prompt = await this._composePrompt({
        cardData,
        structure,
        tone,
        index
      });

      // Generate with LLM
      const response = await this.llmAdapter.generate({
        prompt,
        maxTokens: 1500,
        temperature,
        format: 'json'
      });

      // Parse response
      const copy = this._parseCopy(response);

      // Build content object based on layout type
      const content = {
        title: copy.title,
        subtitle: copy.subtitle || null,
        imagePrompt: copy.image_prompt || null // LLM-generated image prompt (layout-aware!)
      };

      // Add columns or body based on what was generated
      if (copy.columns) {
        content.columns = copy.columns;
      } else {
        content.body = copy.body;
        content.kicker = copy.kicker || null;
      }

      // Build complete card object
      const card = {
        id: `card-${index + 1}`,
        type: cardData.content_type || 'content',
        layout: cardData.layout || 'sidebar-layout',
        role: cardData.role || 'body',

        // Generated copy
        content,

        // Metadata
        speakerNotes: copy.speaker_notes || cardData.speaker_notes || '',

        // Visual guidance from VisualDesigner
        visualGuidance: cardData.visual_guidance || {},

        // Original structure data (for reference)
        originalMessage: cardData.key_message,
        wordCount: copy.word_count?.total || 0
      };

      return card;

    } catch (error) {
      console.error(`[Copywriter] Failed to generate card ${index + 1}:`, error.message);
      // Return fallback card with original content
      return this._createFallbackCard(cardData, index);
    }
  }

  /**
   * Compose prompt for copy generation
   *
   * @private
   * @param {Object} params - Parameters
   * @returns {Promise<string>} Composed prompt
   */
  async _composePrompt(params) {
    const { cardData, structure, tone, index } = params;

    try {
      // Load system prompt
      const systemPrompt = await this.promptLoader.load('copywriter/system-prompt.md');

      // Load tone guide if available
      let toneGuide = '';
      const toneGuidePath = `copywriter/tone/${tone}.md`;
      const toneGuideExists = await this.promptLoader.exists(toneGuidePath);

      if (toneGuideExists) {
        toneGuide = await this.promptLoader.load(toneGuidePath);
      }

      // Create context about adjacent cards
      const prevCard = index > 0 ? structure.cards[index - 1] : null;
      const nextCard = index < structure.cards.length - 1 ? structure.cards[index + 1] : null;

      const contextNotes = `
**Previous Card**: ${prevCard ? prevCard.key_message : 'This is the first card'}
**Next Card**: ${nextCard ? nextCard.key_message : 'This is the last card'}
`;

      // User request
      const userRequest = `
Generate compelling copy for this presentation card:

**Presentation**: ${structure.meta.title}
**Audience**: ${structure.meta.audience}
**Card Position**: ${index + 1} of ${structure.cards.length}

**Card Details**:
- **Role**: ${cardData.role}
- **Layout**: ${cardData.layout}
- **Key Message**: ${cardData.key_message}
- **Supporting Points**: ${(cardData.supporting_points || []).map((p, i) => `\n  ${i + 1}. ${p}`).join('')}
- **Visual Needs**: ${cardData.visual_needs || 'None specified'}

**Context**:
${contextNotes}

**Tone**: ${tone}

Please generate polished, audience-ready copy following the JSON schema in your system prompt.
Respect the layout constraints for ${cardData.layout}.
The copy should be concise, scannable, and emotionally resonant.
`;

      const fullPrompt = `${systemPrompt}

${toneGuide ? `---\n\n${toneGuide}\n` : ''}
---

${userRequest}`;

      return fullPrompt;

    } catch (error) {
      throw new Error(`Failed to compose prompt: ${error.message}`);
    }
  }

  /**
   * Parse LLM response into copy object
   *
   * @private
   * @param {string} response - Raw LLM response
   * @returns {Object} Parsed copy
   * @throws {Error} If parsing fails
   */
  _parseCopy(response) {
    const json = this.llmAdapter._extractJSON(response);

    if (!json) {
      throw new Error('Failed to parse JSON from LLM response');
    }

    if (!json.title) {
      throw new Error('Copy must contain title');
    }

    // Build base object
    const parsed = {
      title: json.title,
      subtitle: json.subtitle || null,
      speaker_notes: json.speaker_notes || '',
      word_count: json.word_count || { total: 0 },
      image_prompt: json.image_prompt || null
    };

    // Handle column-based layouts
    if (json.columns && Array.isArray(json.columns)) {
      parsed.columns = json.columns;
    } else {
      // Simple layouts use body/kicker
      parsed.body = json.body || '';
      parsed.kicker = json.kicker || null;
    }

    return parsed;
  }

  /**
   * Create fallback card when generation fails
   *
   * @private
   * @param {Object} cardData - Original card data
   * @param {number} index - Card index
   * @returns {Object} Fallback card
   */
  _createFallbackCard(cardData, index) {
    console.warn(`[Copywriter] Using fallback content for card ${index + 1}`);

    return {
      id: `card-${index + 1}`,
      type: cardData.content_type || 'content',
      layout: cardData.layout || 'sidebar-layout',
      role: cardData.role || 'body',

      content: {
        title: cardData.key_message || 'Untitled',
        subtitle: null,
        body: (cardData.supporting_points || []).join('\n'),
        kicker: null
      },

      speakerNotes: cardData.speaker_notes || '',
      visualGuidance: cardData.visual_guidance || {},
      originalMessage: cardData.key_message,
      wordCount: 0
    };
  }

  /**
   * Validate parameters
   *
   * @private
   * @param {Object} params - Parameters to validate
   * @throws {Error} If invalid
   */
  _validateParams(params) {
    if (!params) {
      throw new Error('Parameters are required');
    }

    if (!params.structure) {
      throw new Error('structure is required');
    }

    if (!params.structure.cards || !Array.isArray(params.structure.cards)) {
      throw new Error('structure must contain cards array');
    }

    if (params.structure.cards.length === 0) {
      throw new Error('structure must contain at least one card');
    }

    if (params.tone) {
      const validTones = ['professional', 'creative', 'minimal', 'inspirational'];
      if (!validTones.includes(params.tone)) {
        console.warn(`[Copywriter] Unknown tone "${params.tone}", using default`);
      }
    }
  }

  /**
   * Get supported tones
   *
   * @returns {string[]} Array of tone names
   */
  getSupportedTones() {
    return ['professional', 'creative', 'minimal', 'inspirational'];
  }
}

export default Copywriter;
