/**
 * Streaming routes - SSE endpoints for progressive card generation
 * Phase 3: Streaming Architecture
 */

import express from 'express';
import crypto from 'crypto';
import { Card } from '../models/Card.js';
import ContentGenerator from '../services/ContentGenerator.js';
import { LLMContentGenerator } from '../services/LLMContentGenerator.js';
import ThemeService from '../services/ThemeService.js';
import TemplateEngine from '../services/TemplateEngine.js';
import { imageGenerationService } from '../services/ImageGenerationService.js';
import { streamingService } from '../services/StreamingService.js';
import { sseMiddleware } from '../middleware/sseSetup.js';

const router = express.Router();

// Initialize services
const contentGenerator = new ContentGenerator();
const llmContentGenerator = new LLMContentGenerator({ mockMode: true }); // Phase 4: Smart mode generator
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

    // Stream stages asynchronously
    // Don't await here - let it run in background while connection stays open
    streamCard(clientId, card, includeImages).catch(error => {
      console.error('Error during streaming:', error);
      streamingService.emitError(clientId, 'streaming', error);
    });

    // Keep connection alive - wait for client to disconnect
    await new Promise((resolve) => {
      req.on('close', resolve);
    });

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

  // Note: Response is kept open for SSE
});

/**
 * POST /api/presentations/stream
 * Stream a complete presentation generation (4-8 cards)
 */
router.post('/presentations/stream', sseMiddleware, async (req, res) => {
  const clientId = generateClientId();
  const startTime = Date.now();

  console.log('[ROUTE] ===== NEW CLIENT CONNECTED =====');
  console.log('[ROUTE] Client ID:', clientId);
  console.log('[ROUTE] Response state:', {
    writable: res.writable,
    finished: res.finished,
    headersSent: res.headersSent
  });

  try {
    const {
      topic,
      cardCount = 6,
      style = 'professional',
      includeImages = false,
      provider = 'gemini',
      layouts,
      theme,
      streamDelay,
      // Phase 4: Smart mode parameters
      mode = 'fast', // 'fast' | 'smart'
      presentationType = 'education', // pitch | education | report | workshop | story
      audience = 'general',
      tone = 'professional' // professional | creative | minimal | inspirational
    } = req.body;

    console.log('[ROUTE] Request params:', {
      topic, cardCount, style, includeImages, streamDelay,
      mode, presentationType, audience, tone
    });

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

    console.log(`[ROUTE] Generating presentation content (mode: ${mode})...`);

    let cards;
    let presentationTheme;

    // Branch based on mode
    if (mode === 'smart') {
      // Phase 4: Smart mode with LLM
      console.log('[ROUTE] 🎯 Using SMART MODE (LLM-powered generation)');

      try {
        // Generate with LLM
        const presentation = await llmContentGenerator.generatePresentation({
          topic,
          cardCount,
          presentationType,
          audience,
          tone
        });

        console.log('[ROUTE] ✓ LLM generation complete');

        // Get theme
        presentationTheme = theme
          ? themeService.normalizeTheme(theme)
          : themeService.getThemeByStyle(style);

        // Convert LLM cards to Card objects
        cards = presentation.cards.map(cardData => {
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

      } catch (error) {
        console.error('[ROUTE] ✗ Smart mode failed, falling back to fast mode:', error.message);

        // Fallback to fast mode
        const presentationData = contentGenerator.generatePresentation({
          topic,
          cardCount,
          style,
          includeImages: false,
          layouts
        });

        presentationTheme = theme
          ? themeService.normalizeTheme(theme)
          : themeService.getThemeByStyle(style);

        cards = presentationData.cards.map(cardData => {
          const card = new Card({
            type: cardData.type,
            layout: cardData.layout,
            content: cardData.content,
            theme: presentationTheme
          });

          // Generate images if requested (fallback path)
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
      }

    } else {
      // Phase 3: Fast mode (template-based)
      console.log('[ROUTE] ⚡ Using FAST MODE (template-based generation)');

      const presentationData = contentGenerator.generatePresentation({
        topic,
        cardCount,
        style,
        includeImages: false, // We'll handle images via streaming
        layouts
      });

      // Get theme
      presentationTheme = theme
        ? themeService.normalizeTheme(theme)
        : themeService.getThemeByStyle(style);

      // Create Card objects
      cards = presentationData.cards.map(cardData => {
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
    }

    console.log('[ROUTE] Generated', cards.length, 'cards');

    // Add client to streaming service
    console.log('[ROUTE] Adding client to streaming service...');
    streamingService.addClient(res, clientId, {
      cards: cards.map(c => c.id),
      topic,
      cardCount: cards.length,
      startedAt: new Date().toISOString()
    });
    console.log('[ROUTE] Client added to streaming service');

    // Apply custom stage delay if provided
    if (streamDelay !== undefined) {
      streamingService.config.stageDelay = parseInt(streamDelay) || 0;
    }

    // Track connection state
    let connectionClosed = false;

    // Setup cleanup on disconnect
    console.log('[ROUTE] Setting up disconnect handlers...');
    req.on('close', () => {
      connectionClosed = true;
      const duration = Date.now() - startTime;
      console.log(`[ROUTE] ⚠️ Request close event fired for ${clientId}`);
      console.log(`[ROUTE] Connection duration: ${duration}ms`);
      streamingService.removeClient(clientId);
    });

    req.on('error', (error) => {
      console.error('[ROUTE] ✗ Request error for', clientId, error);
    });

    res.on('finish', () => {
      console.log('[ROUTE] Response finish event for', clientId);
    });

    res.on('close', () => {
      console.log('[ROUTE] Response close event for', clientId);
    });

    // Setup image generation listener
    if (includeImages) {
      setupImageListener(clientId, cards);
    }

    // Stream all stages asynchronously
    // Don't await here - let it run in background while connection stays open
    console.log('[ROUTE] Starting streamPresentation (non-blocking)...');
    streamPresentation(clientId, cards, includeImages).catch(error => {
      console.error('[ROUTE] ✗ Error during streaming:', error);
      streamingService.emitError(clientId, 'streaming', error);
    });
    console.log('[ROUTE] streamPresentation started in background');

    // Keep connection alive - wait for client to disconnect
    // The connection is kept open by heartbeats and the SSE middleware
    // This just prevents the route handler from ending prematurely
    console.log('[ROUTE] Waiting for client disconnect (Promise pending)...');
    await new Promise((resolve) => {
      const closeHandler = () => {
        console.log('[ROUTE] Promise resolved - connection closing');
        resolve();
      };
      req.on('close', closeHandler);

      // Safety timeout (10 minutes)
      setTimeout(() => {
        if (!connectionClosed) {
          console.log('[ROUTE] ⏱️ Safety timeout reached for', clientId);
          resolve();
        }
      }, 600000);
    });

    console.log('[ROUTE] Exiting route handler for', clientId);

  } catch (error) {
    console.error('[ROUTE] ✗ Error in /api/presentations/stream:', error);
    console.error('[ROUTE] Error stack:', error.stack);

    if (streamingService.connectionStore.get(clientId)) {
      streamingService.emitError(clientId, 'generation', error);
    } else {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }

  // Note: Response is kept open for SSE, not ended here
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

    // Stream with delays asynchronously
    streamPresentation(clientId, demoCards, false)
      .then(() => {
        // Restore original delay after streaming completes
        streamingService.config.stageDelay = originalDelay;
      })
      .catch(error => {
        console.error('Error during demo streaming:', error);
        streamingService.emitError(clientId, 'demo', error);
        streamingService.config.stageDelay = originalDelay;
      });

    // Keep connection alive - wait for client to disconnect
    await new Promise((resolve) => {
      req.on('close', resolve);
    });

  } catch (error) {
    console.error('Error in /api/stream/demo:', error);
    streamingService.emitError(clientId, 'demo', error);
  }

  // Note: Response is kept open for SSE
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
  console.log('[STREAM-PRES] ===== STARTING FOR', clientId, '=====');
  console.log('[STREAM-PRES] Cards:', cards.length, 'Include images:', includeImages);

  try {
    // Stage 1: Skeleton
    console.log('[STREAM-PRES] Stage 1: Emitting skeleton...');
    streamingService.emitProgress(clientId, 'skeleton', 10, 'Generating card structure');
    await streamingService.emitSkeleton(clientId, cards);
    console.log('[STREAM-PRES] ✓ Skeleton emitted successfully');

    // Add small delay to test timing
    console.log('[STREAM-PRES] Waiting 500ms before content...');
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('[STREAM-PRES] Delay complete, starting content emission');

    // Stage 2: Content (for each card)
    console.log('[STREAM-PRES] Stage 2: Emitting content for', cards.length, 'cards...');
    streamingService.emitProgress(clientId, 'content', 30, 'Generating content');
    for (let i = 0; i < cards.length; i++) {
      console.log(`[STREAM-PRES] Emitting content for card ${i + 1}/${cards.length} (${cards[i].id})`);
      await streamingService.emitCardContent(clientId, cards[i]);
      console.log(`[STREAM-PRES] ✓ Card ${i + 1} content emitted`);
    }
    console.log('[STREAM-PRES] ✓ All content emitted');

    // Stage 3: Styles (for each card)
    console.log('[STREAM-PRES] Stage 3: Emitting styles for', cards.length, 'cards...');
    streamingService.emitProgress(clientId, 'style', 60, 'Applying styles');
    for (let i = 0; i < cards.length; i++) {
      console.log(`[STREAM-PRES] Emitting styles for card ${i + 1}/${cards.length}`);
      await streamingService.emitStyle(clientId, cards[i]);
    }
    console.log('[STREAM-PRES] ✓ All styles emitted');

    // Stage 4: Placeholders (if images requested)
    if (includeImages) {
      console.log('[STREAM-PRES] Stage 4: Emitting placeholders...');
      streamingService.emitProgress(clientId, 'placeholder', 80, 'Loading image placeholders');

      // Emit placeholders for ALL cards when images are enabled
      // This shows the loading state immediately while images generate
      for (const card of cards) {
        console.log(`[STREAM-PRES] Emitting placeholder for card ${card.id}`);
        await streamingService.emitPlaceholder(clientId, card);
      }

      streamingService.emitProgress(clientId, 'image', 90, 'Generating images (this may take a moment)');
      console.log('[STREAM-PRES] ✓ Placeholders emitted for', cards.length, 'cards');
    }

    // Emit completion
    console.log('[STREAM-PRES] Emitting completion event...');
    streamingService.emitComplete(clientId, {
      cardCount: cards.length,
      stages: includeImages ? 5 : 3,
      includeImages
    });
    console.log('[STREAM-PRES] ✓✓✓ STREAMING COMPLETE FOR', clientId, '✓✓✓');

  } catch (error) {
    console.error('[STREAM-PRES] ✗ Error for', clientId, ':', error);
    console.error('[STREAM-PRES] Error stack:', error.stack);
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
