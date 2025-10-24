/**
 * Streaming routes - SSE endpoints for progressive card generation
 * Phase 3: Streaming Architecture
 */

import express from 'express';
import crypto from 'crypto';
import { Card } from '../models/Card.js';
import ContentGenerator from '../services/ContentGenerator.js';
import ThemeService from '../services/ThemeService.js';
import TemplateEngine from '../services/TemplateEngine.js';
import { imageGenerationService } from '../services/ImageGenerationService.js';
import { streamingService } from '../services/StreamingService.js';
import { sseMiddleware } from '../middleware/sseSetup.js';

const router = express.Router();

// Initialize services
const contentGenerator = new ContentGenerator();
const themeService = new ThemeService();
const templateEngine = new TemplateEngine();

/**
 * Generate unique client ID
 */
function generateClientId() {
  return `client_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
}

/**
 * POST /api/cards/stream
 * Stream a single card generation with all stages
 */
router.post('/cards/stream', sseMiddleware, async (req, res) => {
  const clientId = generateClientId();

  try {
    const {
      topic,
      layoutType = 'split',
      style = 'professional',
      includeImages = false,
      provider = 'gemini',
      theme
    } = req.body;

    // Validate required fields
    if (!topic) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Field "topic" is required'
      });
    }

    // Generate card content
    const cardData = contentGenerator.generateCardContent({
      topic,
      layoutType,
      style
    });

    // Get theme
    const cardTheme = theme
      ? themeService.normalizeTheme(theme)
      : themeService.getThemeByStyle(style);

    // Create Card object
    const card = new Card({
      type: cardData.type,
      layout: cardData.layout,
      content: cardData.content,
      theme: cardTheme
    });

    // Generate image if requested
    if (includeImages) {
      const imageResult = imageGenerationService.generateImageAsync(card, {
        provider,
        aspectRatio: '16:9',
        style
      });
      card.image = imageResult.image;
    }

    // Add client to streaming service
    streamingService.addClient(res, clientId, {
      cards: [card.id],
      topic,
      startedAt: new Date().toISOString()
    });

    // Setup cleanup on disconnect
    req.on('close', () => {
      streamingService.removeClient(clientId);
    });

    // Stream stages
    await streamCard(clientId, card, includeImages);

  } catch (error) {
    console.error('Error in /api/cards/stream:', error);

    if (streamingService.connectionStore.get(clientId)) {
      streamingService.emitError(clientId, 'generation', error);
    } else {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }
});

/**
 * POST /api/presentations/stream
 * Stream a complete presentation generation (4-8 cards)
 */
router.post('/presentations/stream', sseMiddleware, async (req, res) => {
  const clientId = generateClientId();

  try {
    const {
      topic,
      cardCount = 6,
      style = 'professional',
      includeImages = false,
      provider = 'gemini',
      layouts,
      theme,
      streamDelay
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

    // Generate presentation
    const presentationData = contentGenerator.generatePresentation({
      topic,
      cardCount,
      style,
      includeImages: false, // We'll handle images via streaming
      layouts
    });

    // Get theme
    const presentationTheme = theme
      ? themeService.normalizeTheme(theme)
      : themeService.getThemeByStyle(style);

    // Create Card objects
    const cards = presentationData.cards.map(cardData => {
      const card = new Card({
        type: cardData.type,
        layout: cardData.layout,
        content: cardData.content,
        theme: presentationTheme
      });

      // Generate images if requested
      if (includeImages) {
        const imageResult = imageGenerationService.generateImageAsync(card, {
          provider,
          aspectRatio: '16:9',
          style
        });
        card.image = imageResult.image;
      }

      return card;
    });

    // Add client to streaming service
    streamingService.addClient(res, clientId, {
      cards: cards.map(c => c.id),
      topic,
      cardCount: cards.length,
      startedAt: new Date().toISOString()
    });

    // Apply custom stage delay if provided
    if (streamDelay !== undefined) {
      streamingService.config.stageDelay = parseInt(streamDelay) || 0;
    }

    // Setup cleanup on disconnect
    req.on('close', () => {
      streamingService.removeClient(clientId);
    });

    // Setup image generation listener
    if (includeImages) {
      setupImageListener(clientId, cards);
    }

    // Stream all stages
    await streamPresentation(clientId, cards, includeImages);

  } catch (error) {
    console.error('Error in /api/presentations/stream:', error);

    if (streamingService.connectionStore.get(clientId)) {
      streamingService.emitError(clientId, 'generation', error);
    } else {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }
});

/**
 * GET /api/stream/demo
 * Demo endpoint with simulated delays for testing
 */
router.get('/stream/demo', sseMiddleware, async (req, res) => {
  const clientId = generateClientId();

  try {
    const { delay = 500 } = req.query;

    // Create demo cards
    const demoCards = [
      new Card({
        type: 'title',
        layout: 'hero',
        content: {
          title: 'SSE Streaming Demo',
          subtitle: 'Progressive Card Assembly'
        },
        theme: themeService.getTheme('light')
      }),
      new Card({
        type: 'content',
        layout: 'split',
        content: {
          title: 'Stage-Based Pipeline',
          body: 'Watch as each stage appears progressively'
        },
        theme: themeService.getTheme('light')
      })
    ];

    // Add client
    streamingService.addClient(res, clientId, {
      cards: demoCards.map(c => c.id),
      demo: true
    });

    // Setup cleanup
    req.on('close', () => {
      streamingService.removeClient(clientId);
    });

    // Override stage delay for demo
    const originalDelay = streamingService.config.stageDelay;
    streamingService.config.stageDelay = parseInt(delay);

    // Stream with delays
    await streamPresentation(clientId, demoCards, false);

    // Restore original delay
    streamingService.config.stageDelay = originalDelay;

  } catch (error) {
    console.error('Error in /api/stream/demo:', error);
    streamingService.emitError(clientId, 'demo', error);
  }
});

/**
 * Stream a single card through all stages
 *
 * @param {string} clientId - Client identifier
 * @param {Card} card - Card object
 * @param {boolean} includeImages - Whether to include image stages
 */
async function streamCard(clientId, card, includeImages = false) {
  try {
    // Stage 1: Skeleton
    await streamingService.emitSkeleton(clientId, [card]);

    // Stage 2: Content
    await streamingService.emitCardContent(clientId, card);

    // Stage 3: Style
    await streamingService.emitStyle(clientId, card);

    // Stage 4: Placeholder (if images requested)
    if (includeImages && card.image) {
      await streamingService.emitPlaceholder(clientId, card);

      // Setup listener for image completion
      setupImageListener(clientId, [card]);
    }

    // Emit completion
    streamingService.emitComplete(clientId, {
      cardId: card.id,
      stages: includeImages ? 5 : 3
    });

  } catch (error) {
    streamingService.emitError(clientId, 'streaming', error);
  }
}

/**
 * Stream a presentation through all stages
 *
 * @param {string} clientId - Client identifier
 * @param {Array<Card>} cards - Array of Card objects
 * @param {boolean} includeImages - Whether to include image stages
 */
async function streamPresentation(clientId, cards, includeImages = false) {
  try {
    // Stage 1: Skeleton
    streamingService.emitProgress(clientId, 'skeleton', 10, 'Generating card structure');
    await streamingService.emitSkeleton(clientId, cards);

    // Stage 2: Content (for each card)
    streamingService.emitProgress(clientId, 'content', 30, 'Generating content');
    for (const card of cards) {
      await streamingService.emitCardContent(clientId, card);
    }

    // Stage 3: Styles (for each card)
    streamingService.emitProgress(clientId, 'style', 60, 'Applying styles');
    for (const card of cards) {
      await streamingService.emitStyle(clientId, card);
    }

    // Stage 4: Placeholders (if images requested)
    if (includeImages) {
      streamingService.emitProgress(clientId, 'placeholder', 80, 'Loading image placeholders');
      for (const card of cards) {
        if (card.image) {
          await streamingService.emitPlaceholder(clientId, card);
        }
      }
      streamingService.emitProgress(clientId, 'image', 90, 'Generating images (this may take a moment)');
    }

    // Emit completion
    streamingService.emitComplete(clientId, {
      cardCount: cards.length,
      stages: includeImages ? 5 : 3,
      includeImages
    });

  } catch (error) {
    streamingService.emitError(clientId, 'streaming', error);
  }
}

/**
 * Setup listener for image generation events
 *
 * @param {string} clientId - Client identifier
 * @param {Array<Card>} cards - Array of Card objects
 */
function setupImageListener(clientId, cards) {
  const cardIds = new Set(cards.map(c => c.id));

  // Listen for image completion
  const onImageComplete = ({ cardId, result }) => {
    // Check if this image is for one of our cards
    if (cardIds.has(cardId)) {
      // Check if client is still connected
      if (streamingService.connectionStore.isActive(clientId)) {
        streamingService.emitImage(clientId, cardId, result);
      }
    }
  };

  // Listen for image failure
  const onImageFailed = ({ cardId, error }) => {
    if (cardIds.has(cardId)) {
      if (streamingService.connectionStore.isActive(clientId)) {
        streamingService.emitError(clientId, 'image', {
          message: `Image generation failed for card ${cardId}`,
          ...error,
          cardId
        });
      }
    }
  };

  // Attach listeners
  imageGenerationService.on('image:complete', onImageComplete);
  imageGenerationService.on('image:failed', onImageFailed);

  // Cleanup listeners on disconnect
  const connection = streamingService.connectionStore.get(clientId);
  if (connection) {
    connection.res.on('close', () => {
      imageGenerationService.off('image:complete', onImageComplete);
      imageGenerationService.off('image:failed', onImageFailed);
    });
  }
}

export default router;
