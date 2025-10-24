/**
 * Visual Designer Service
 * Phase 4: Content Generation Architecture
 *
 * Assigns layouts and visual elements to cards based on content
 * Second stage in the 3-stage content generation pipeline
 *
 * Pipeline: PresentationDesigner → VisualDesigner → Copywriter
 */

import { PromptLoader } from './PromptLoader.js';

/**
 * Layout and visual design generator
 *
 * @class
 */
export class VisualDesigner {
  /**
   * Create a visual designer
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

    // Available layouts
    this.availableLayouts = [
      'hero-layout',
      'hero-layout.overlay',
      'split-layout',
      'sidebar-layout',
      'feature-layout',
      'dashboard-layout',
      'masonry-layout'
    ];

    console.log('[VisualDesigner] Initialized');
  }

  /**
   * Assign layouts to all cards in structure
   *
   * @param {Object} params - Parameters
   * @param {Object} params.structure - Presentation structure from PresentationDesigner
   * @param {string} [params.presentationType='education'] - Type of presentation
   * @param {number} [params.temperature=0.5] - LLM temperature (lower for more consistent choices)
   * @returns {Promise<Object>} Structure with assigned layouts
   * @throws {Error} If assignment fails
   *
   * @example
   * const withLayouts = await visualDesigner.assignLayouts({
   *   structure: presentationStructure,
   *   presentationType: 'pitch'
   * });
   */
  async assignLayouts(params) {
    this._validateParams(params);

    const {
      structure,
      presentationType = 'education',
      temperature = 0.5
    } = params;

    console.log(`[VisualDesigner] Assigning layouts to ${structure.cards.length} cards`);

    try {
      // Compose prompt
      const prompt = await this._composePrompt({
        structure,
        presentationType
      });

      // Generate with LLM
      const response = await this.llmAdapter.generate({
        prompt,
        maxTokens: 3000,
        temperature,
        format: 'json'
      });

      // Parse response
      const layoutPlan = this._parseLayoutPlan(response);

      // Validate and apply layouts
      const enrichedStructure = this._applyLayouts(structure, layoutPlan);

      console.log('[VisualDesigner] ✓ Layouts assigned successfully');
      return enrichedStructure;

    } catch (error) {
      console.error('[VisualDesigner] Layout assignment failed:', error.message);
      // Fallback: assign default layouts
      console.warn('[VisualDesigner] Falling back to default layout strategy');
      return this._applyDefaultLayouts(structure);
    }
  }

  /**
   * Compose prompt for layout assignment
   *
   * @private
   * @param {Object} params - Parameters
   * @returns {Promise<string>} Composed prompt
   */
  async _composePrompt(params) {
    const { structure, presentationType } = params;

    try {
      // Load system prompt
      const systemPrompt = await this.promptLoader.load('visual-designer/system-prompt.md');

      // Create user request with card summaries
      const cardSummaries = structure.cards.map((card, index) => {
        return `Card ${index + 1}:
- Role: ${card.role}
- Content Type: ${card.content_type}
- Key Message: ${card.key_message}
- Supporting Points: ${card.supporting_points?.length || 0} points
- Visual Needs: ${card.visual_needs || 'None specified'}`;
      }).join('\n\n');

      const userRequest = `
Assign layouts to the following ${structure.cards.length} cards for a ${presentationType} presentation:

**Presentation**: ${structure.meta.title}
**Goal**: ${structure.meta.goal}
**Audience**: ${structure.meta.audience}

**Cards**:

${cardSummaries}

For each card, recommend the optimal layout and provide visual design guidance.

Return a JSON object with this structure:
\`\`\`json
{
  "cards": [
    {
      "card_number": 1,
      "layout": "hero-layout",
      "layout_rationale": "Why this layout was chosen",
      "visual_guidance": {
        "primary_element": "What dominates visually",
        "visual_suggestions": ["Suggestion 1", "Suggestion 2"]
      }
    }
  ],
  "overall_theme": {
    "style": "professional | creative | minimal | bold",
    "color_strategy": "How to use color across presentation",
    "consistency_notes": "How to maintain visual coherence"
  }
}
\`\`\`
`;

      const fullPrompt = `${systemPrompt}

---

${userRequest}`;

      return fullPrompt;

    } catch (error) {
      throw new Error(`Failed to compose prompt: ${error.message}`);
    }
  }

  /**
   * Parse LLM response into layout plan
   *
   * @private
   * @param {string} response - Raw LLM response
   * @returns {Object} Parsed layout plan
   * @throws {Error} If parsing fails
   */
  _parseLayoutPlan(response) {
    const json = this.llmAdapter._extractJSON(response);

    if (!json) {
      throw new Error('Failed to parse JSON from LLM response');
    }

    if (!json.cards || !Array.isArray(json.cards)) {
      throw new Error('Layout plan must contain cards array');
    }

    return json;
  }

  /**
   * Apply layouts from plan to structure
   *
   * @private
   * @param {Object} structure - Original structure
   * @param {Object} layoutPlan - Layout assignments from LLM
   * @returns {Object} Enriched structure
   */
  _applyLayouts(structure, layoutPlan) {
    const enriched = { ...structure };

    // Apply layout to each card
    for (const [index, card] of enriched.cards.entries()) {
      const layoutCard = layoutPlan.cards[index];

      if (!layoutCard) {
        console.warn(`[VisualDesigner] No layout for card ${index + 1}, using default`);
        card.layout = this._getDefaultLayout(card);
        continue;
      }

      // Validate layout
      if (!this.availableLayouts.includes(layoutCard.layout)) {
        console.warn(`[VisualDesigner] Invalid layout "${layoutCard.layout}", using default`);
        card.layout = this._getDefaultLayout(card);
      } else {
        card.layout = layoutCard.layout;
      }

      // Add visual guidance
      card.layout_rationale = layoutCard.layout_rationale;
      card.visual_guidance = layoutCard.visual_guidance || {};
    }

    // Add overall theme
    if (layoutPlan.overall_theme) {
      enriched.visual_theme = layoutPlan.overall_theme;
    }

    return enriched;
  }

  /**
   * Apply default layouts when LLM fails
   *
   * @private
   * @param {Object} structure - Original structure
   * @returns {Object} Structure with default layouts
   */
  _applyDefaultLayouts(structure) {
    const enriched = { ...structure };

    for (const card of enriched.cards) {
      card.layout = this._getDefaultLayout(card);
      card.layout_rationale = 'Default layout assigned';
    }

    return enriched;
  }

  /**
   * Get default layout based on card properties
   *
   * @private
   * @param {Object} card - Card object
   * @returns {string} Layout name
   */
  _getDefaultLayout(card) {
    // Simple heuristic-based layout selection
    if (card.role === 'opening' || card.role === 'closing') {
      return 'hero-layout';
    }

    if (card.content_type === 'title' || card.content_type === 'takeaway') {
      return 'hero-layout';
    }

    if (card.content_type === 'comparison') {
      return 'split-layout';
    }

    if (card.content_type === 'data') {
      return 'dashboard-layout';
    }

    if (card.content_type === 'image') {
      return 'hero-layout.overlay';
    }

    if (card.supporting_points && card.supporting_points.length >= 3) {
      return 'feature-layout';
    }

    // Default
    return 'sidebar-layout';
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
  }

  /**
   * Get available layouts
   *
   * @returns {string[]} Array of layout names
   */
  getAvailableLayouts() {
    return [...this.availableLayouts];
  }
}

export default VisualDesigner;
