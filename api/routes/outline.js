/**
 * Outline routes - Presentation outline generation and editing
 * Implements the outline-first workflow where users review and edit
 * AI-generated outlines before final presentation generation
 */

import express from 'express';
import crypto from 'crypto';
import { Copywriter } from '../services/llm/Copywriter.js';
import { PresentationDesigner } from '../services/llm/PresentationDesigner.js';
import { createContentLLMAdapter, getLLMConfig } from '../services/adapters/LLMAdapterFactory.js';
import { PromptLoader } from '../services/llm/PromptLoader.js';

const router = express.Router();

// Initialize LLM services with factory
const llmAdapter = createContentLLMAdapter();
const promptLoader = new PromptLoader();
const presentationDesigner = new PresentationDesigner(llmAdapter, promptLoader);
const copywriter = new Copywriter(llmAdapter, promptLoader);

// Log LLM configuration on startup
const llmConfig = getLLMConfig();
console.log('[OUTLINE] LLM Configuration:', llmConfig);

/**
 * POST /api/presentation/design-structure
 * Stage 1: Generate presentation structure with pedagogical design
 * Uses PresentationDesigner to create instructional design blueprint
 */
router.post('/design-structure', async (req, res) => {
  try {
    const {
      topic,
      cardCount = 6,
      presentationType = 'education',
      audience = 'general',
      tone = 'professional',
      context = ''
    } = req.body;

    // Validate required fields
    if (!topic) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Field "topic" is required'
      });
    }

    // Validate card count
    if (cardCount < 1 || cardCount > 20) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Field "cardCount" must be between 1 and 20'
      });
    }

    console.log('[OUTLINE] Stage 1: Designing structure:', {
      topic,
      cardCount,
      presentationType,
      audience
    });

    // Generate structure using PresentationDesigner
    const structure = await presentationDesigner.generateStructure({
      topic,
      presentationType,
      audience,
      cardCount,
      context
    });

    console.log(`[OUTLINE] Stage 1 complete: Structure with ${structure.cards.length} cards`);

    res.json({
      success: true,
      structure
    });

  } catch (error) {
    console.error('[OUTLINE] Stage 1 error:', error);

    // Return fallback structure on error
    const fallbackStructure = generateFallbackStructure(req.body);

    res.json({
      success: true,
      structure: fallbackStructure,
      fallback: true,
      warning: 'Using template-based structure due to generation error'
    });
  }
});

/**
 * POST /api/presentation/generate-outline
 * Stage 2: Generate content outline from structure
 * Accepts optional structure from Stage 1, or generates single-stage outline
 */
router.post('/generate-outline', async (req, res) => {
  try {
    const {
      topic,
      cardCount = 6,
      presentationType = 'education',
      audience = 'general',
      tone = 'professional',
      structure = null // Optional: Structure from Stage 1
    } = req.body;

    // If structure is provided, use two-stage approach
    if (structure) {
      console.log('[OUTLINE] Stage 2: Generating outline from structure:', {
        topic,
        cardCount: structure.cards.length,
        presentationType,
        tone
      });

      // Generate outline using structure blueprint
      const outline = await generateOutlineFromStructure({
        structure,
        topic,
        tone
      });

      console.log(`[OUTLINE] Stage 2 complete: Outline with ${outline.cards.length} cards`);

      res.json({
        success: true,
        outline,
        twoStage: true
      });

    } else {
      // Fallback to single-stage approach for backward compatibility
      // Validate required fields
      if (!topic) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Field "topic" is required'
        });
      }

      // Validate card count
      if (cardCount < 1 || cardCount > 20) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Field "cardCount" must be between 1 and 20'
        });
      }

      console.log('[OUTLINE] Single-stage: Generating outline:', {
        topic,
        cardCount,
        presentationType,
        audience,
        tone
      });

      // Generate outline using Copywriter in outline mode (legacy)
      const outline = await generateOutline({
        topic,
        cardCount,
        presentationType,
        audience,
        tone
      });

      console.log(`[OUTLINE] Single-stage complete: ${outline.cards.length} cards`);

      res.json({
        success: true,
        outline,
        twoStage: false
      });
    }

  } catch (error) {
    console.error('[OUTLINE] Error generating outline:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

/**
 * POST /api/presentation/generate-from-outline
 * Generate full presentation from edited outline
 * Returns SSE stream for progressive rendering
 */
router.post('/generate-from-outline', async (req, res) => {
  try {
    const {
      cards,
      includeImages = false,
      imageProvider = 'gemini'
    } = req.body;

    // Validate required fields
    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Field "cards" is required and must be a non-empty array'
      });
    }

    // Validate each card
    for (const card of cards) {
      if (!card.id || !card.content || !card.layout) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Each card must have id, content, and layout'
        });
      }
    }

    console.log('[OUTLINE] Generating presentation from outline:', {
      cardCount: cards.length,
      includeImages,
      layouts: cards.map(c => c.layout)
    });

    // This endpoint will redirect to streaming endpoint
    // For now, return the validated outline
    res.json({
      success: true,
      message: 'Outline validated. Use /api/presentations/stream-from-outline for SSE streaming',
      cards: cards.map(c => ({
        id: c.id,
        layout: c.layout,
        content: c.content
      }))
    });

  } catch (error) {
    console.error('[OUTLINE] Error validating outline:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

/**
 * Generate presentation outline
 * @private
 */
async function generateOutline(params) {
  const {
    topic,
    cardCount,
    presentationType,
    audience,
    tone
  } = params;

  try {
    // Load outline generation prompt
    const systemPrompt = await promptLoader.load('copywriter/outline-mode.md');

    // Compose user request
    const userRequest = `
Generate a presentation outline with exactly ${cardCount} cards.

**Topic**: ${topic}
**Presentation Type**: ${presentationType}
**Audience**: ${audience}
**Tone**: ${tone}

Please provide:
1. A brief content outline for each card (bullet-point format)
2. A suggested layout for each card based on the content type
3. A clear role for each card (opening, body, transition, climax, closing)

Return the outline as a JSON array of cards following the schema in your system prompt.
`;

    const prompt = `${systemPrompt}\n\n---\n\n${userRequest}`;

    // Generate with LLM
    const response = await llmAdapter.generate({
      prompt,
      maxTokens: 2000,
      temperature: 0.7,
      format: 'json'
    });

    // Parse response
    const outlineData = llmAdapter._extractJSON(response);

    if (!outlineData || !outlineData.cards || !Array.isArray(outlineData.cards)) {
      throw new Error('Invalid outline structure from LLM');
    }

    // Ensure all cards have required fields
    const cards = outlineData.cards.map((card, index) => ({
      id: `card-${index + 1}`,
      content: card.content || `Card ${index + 1}\n• Key point`,
      suggestedLayout: card.suggestedLayout || 'title-bullets-layout',
      role: card.role || 'body',
      rationale: card.rationale || ''
    }));

    return {
      topic,
      presentationType,
      audience,
      tone,
      cardCount: cards.length,
      cards
    };

  } catch (error) {
    console.error('[OUTLINE] Generation failed:', error.message);

    // Fallback to template-based outline
    return generateFallbackOutline(params);
  }
}

/**
 * Generate outline from structure blueprint (Stage 2 of two-stage approach)
 * @private
 */
async function generateOutlineFromStructure(params) {
  const { structure, topic, tone } = params;

  try {
    // Load outline generation prompt
    const systemPrompt = await promptLoader.load('copywriter/outline-mode.md');

    // Build context from structure
    const structureContext = `
**Presentation Structure Information**:
- Title: ${structure.meta?.title || topic}
- Type: ${structure.meta?.type || 'education'}
- Audience: ${structure.meta?.audience || 'general'}
- Goal: ${structure.meta?.goal || 'Inform and engage'}
- Narrative Arc: ${structure.narrative_arc?.opening || 'Hook'} → ${structure.narrative_arc?.development || 'Build'} → ${structure.narrative_arc?.climax || 'Reveal'} → ${structure.narrative_arc?.closing || 'Conclude'}

**Card Structure**:
${structure.cards.map((card, i) => `
Card ${i + 1}:
- Role: ${card.role}
- Purpose: ${card.purpose}
- Content Type: ${card.content_type}
- Key Message: ${card.key_message}
- Supporting Points: ${(card.supporting_points || []).join('; ')}
- Visual Needs: ${card.visual_needs || 'None'}
`).join('\n')}
`;

    // Compose user request
    const userRequest = `
Generate an editable outline based on this presentation structure blueprint.

${structureContext}

**Requirements**:
1. Convert each card's key message and supporting points into bullet-point outline format
2. Suggest appropriate layouts based on content_type and visual_needs
3. Maintain the narrative arc and pedagogical approach from the structure
4. Keep outlines brief and editable (user will refine before final generation)
5. Assign roles exactly as specified in the structure

**Tone**: ${tone}

Return the outline as a JSON array of cards following the schema in your system prompt.
`;

    const prompt = `${systemPrompt}\n\n---\n\n${userRequest}`;

    // Generate with LLM
    const response = await llmAdapter.generate({
      prompt,
      maxTokens: 2000,
      temperature: 0.6, // Lower temperature for more faithful adherence to structure
      format: 'json'
    });

    // Parse response
    const outlineData = llmAdapter._extractJSON(response);

    if (!outlineData || !outlineData.cards || !Array.isArray(outlineData.cards)) {
      throw new Error('Invalid outline structure from LLM');
    }

    // Enrich cards with structure metadata
    const cards = outlineData.cards.map((card, index) => {
      const structureCard = structure.cards[index] || {};

      return {
        id: `card-${index + 1}`,
        content: card.content || `Card ${index + 1}\n• Key point`,
        suggestedLayout: card.suggestedLayout || mapContentTypeToLayout(structureCard.content_type),
        role: card.role || structureCard.role || 'body',
        rationale: card.rationale || '',
        // Include structure metadata for UI display
        structureInfo: {
          purpose: structureCard.purpose,
          contentType: structureCard.content_type,
          pedagogicalNote: structureCard.speaker_notes
        }
      };
    });

    return {
      topic: structure.meta?.title || topic,
      presentationType: structure.meta?.type || 'education',
      audience: structure.meta?.audience || 'general',
      tone,
      cardCount: cards.length,
      cards,
      // Include structure for UI display
      structure: {
        goal: structure.meta?.goal,
        narrativeArc: structure.narrative_arc,
        pedagogicalApproach: structure.meta?.type || 'education'
      }
    };

  } catch (error) {
    console.error('[OUTLINE] Stage 2 generation failed:', error.message);

    // Fallback: Convert structure directly to outline
    return convertStructureToOutline(structure, topic, tone);
  }
}

/**
 * Map content type to suggested layout
 * @private
 */
function mapContentTypeToLayout(contentType) {
  const mapping = {
    'title': 'hero-layout',
    'concept': 'title-bullets-layout',
    'data': 'dashboard-layout',
    'quote': 'hero-overlay-layout',
    'image': 'image-text-layout',
    'comparison': 'two-columns-headings-layout',
    'process': 'sidebar-layout',
    'takeaway': 'title-bullets-layout'
  };

  return mapping[contentType] || 'title-bullets-layout';
}

/**
 * Convert structure to outline (fallback for Stage 2 failure)
 * @private
 */
function convertStructureToOutline(structure, topic, tone) {
  const cards = structure.cards.map((card, index) => ({
    id: `card-${index + 1}`,
    content: `${card.key_message}\n${(card.supporting_points || []).map(p => `• ${p}`).join('\n')}`,
    suggestedLayout: mapContentTypeToLayout(card.content_type),
    role: card.role || 'body',
    rationale: card.purpose || '',
    structureInfo: {
      purpose: card.purpose,
      contentType: card.content_type,
      pedagogicalNote: card.speaker_notes
    }
  }));

  return {
    topic: structure.meta?.title || topic,
    presentationType: structure.meta?.type || 'education',
    audience: structure.meta?.audience || 'general',
    tone,
    cardCount: cards.length,
    cards,
    structure: {
      goal: structure.meta?.goal,
      narrativeArc: structure.narrative_arc,
      pedagogicalApproach: structure.meta?.type || 'education'
    }
  };
}

/**
 * Generate fallback structure when PresentationDesigner fails (Stage 1 fallback)
 * @private
 */
function generateFallbackStructure(params) {
  const { topic, cardCount = 6, presentationType = 'education', audience = 'general' } = params;

  return {
    meta: {
      title: topic,
      type: presentationType,
      audience,
      goal: 'Inform and engage audience',
      duration_estimate: `${Math.ceil(cardCount * 1.5)} minutes`
    },
    narrative_arc: {
      opening: 'Capture attention with hook',
      development: 'Build understanding progressively',
      climax: 'Reveal key insight',
      closing: 'Call to action'
    },
    cards: generateFallbackStructureCards(topic, cardCount),
    coherence: {
      transitions: ['Each card builds on the previous'],
      recurring_themes: ['Main topic throughout'],
      callbacks: 'Reference earlier concepts'
    }
  };
}

/**
 * Generate fallback structure cards
 * @private
 */
function generateFallbackStructureCards(topic, cardCount) {
  const cards = [];

  // Opening
  cards.push({
    card_number: 1,
    role: 'opening',
    purpose: 'Introduce topic and capture attention',
    content_type: 'title',
    key_message: topic,
    supporting_points: ['Presentation overview'],
    visual_needs: 'Bold title treatment',
    speaker_notes: 'Start with enthusiasm'
  });

  // Body cards
  for (let i = 2; i < cardCount; i++) {
    cards.push({
      card_number: i,
      role: 'body',
      purpose: `Present key concept ${i - 1}`,
      content_type: 'concept',
      key_message: `Key Point ${i - 1}`,
      supporting_points: ['Supporting detail', 'Supporting detail', 'Supporting detail'],
      visual_needs: 'Supporting visuals or icons',
      speaker_notes: `Explain concept ${i - 1} clearly`
    });
  }

  // Closing
  if (cardCount > 1) {
    cards.push({
      card_number: cardCount,
      role: 'closing',
      purpose: 'Summarize and provide takeaways',
      content_type: 'takeaway',
      key_message: 'Key Takeaways',
      supporting_points: ['Main insight 1', 'Main insight 2', 'Main insight 3'],
      visual_needs: 'Summary visualization',
      speaker_notes: 'End with clear call to action'
    });
  }

  return cards.slice(0, cardCount);
}

/**
 * Generate fallback outline when LLM fails (single-stage fallback)
 * @private
 */
function generateFallbackOutline(params) {
  const { topic, cardCount, presentationType, audience, tone } = params;

  const cards = [];

  // Opening card
  cards.push({
    id: 'card-1',
    content: `${topic}\nPresentation Overview`,
    suggestedLayout: 'hero-layout',
    role: 'opening',
    rationale: 'Title slide to introduce the topic'
  });

  // Body cards
  for (let i = 2; i < cardCount; i++) {
    cards.push({
      id: `card-${i}`,
      content: `Key Point ${i - 1}\n• Supporting detail\n• Supporting detail\n• Supporting detail`,
      suggestedLayout: 'title-bullets-layout',
      role: 'body',
      rationale: `Content card ${i - 1}`
    });
  }

  // Closing card
  if (cardCount > 1) {
    cards.push({
      id: `card-${cardCount}`,
      content: `Key Takeaways\n• Main insight 1\n• Main insight 2\n• Main insight 3`,
      suggestedLayout: 'title-bullets-layout',
      role: 'closing',
      rationale: 'Summary and takeaways'
    });
  }

  return {
    topic,
    presentationType,
    audience,
    tone,
    cardCount: cards.length,
    cards: cards.slice(0, cardCount)
  };
}

export default router;
