/**
 * Presentation generation routes
 */

import express from 'express';
import { Card } from '../models/Card.js';
import ContentGenerator from '../services/ContentGenerator.js';
import ThemeService from '../services/ThemeService.js';
import TemplateEngine from '../services/TemplateEngine.js';
import { imageGenerationService } from '../services/ImageGenerationService.js';

const router = express.Router();

// Initialize services
const contentGenerator = new ContentGenerator();
const themeService = new ThemeService();
const templateEngine = new TemplateEngine();

/**
 * POST /api/presentations/generate
 * Generate a complete presentation for a topic
 */
router.post('/generate', (req, res) => {
  try {
    const {
      topic,
      cardCount = 6,
      style = 'professional',
      includeImages = false,
      provider = 'placeholder',
      layouts,
      theme
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
    let presentationData;
    try {
      presentationData = contentGenerator.generatePresentation({
        topic,
        cardCount,
        style,
        includeImages,
        layouts
      });
    } catch (error) {
      return res.status(400).json({
        error: 'Bad Request',
        message: error.message
      });
    }

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
        theme: presentationTheme,
        image: cardData.image || null,
        placeholders: cardData.placeholders || null
      });

      // Generate images if requested (Phase 2)
      if (includeImages) {
        const imageResult = imageGenerationService.generateImageAsync(card, {
          provider: provider || 'gemini',
          aspectRatio: '16:9',
          style
        });
        card.image = imageResult.image;
      }

      return card.toJSON();
    });

    // Return presentation
    res.json({
      cards,
      topic: presentationData.topic,
      theme: presentationTheme,
      metadata: {
        cardCount: cards.length,
        style,
        includeImages
      }
    });

  } catch (error) {
    console.error('Error in /api/presentations/generate:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

/**
 * POST /api/presentations/render
 * Render a presentation to HTML
 */
router.post('/render', (req, res) => {
  try {
    const { cards, options = {} } = req.body;

    if (!cards || !Array.isArray(cards)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Field "cards" is required and must be an array'
      });
    }

    // Render cards
    const html = templateEngine.renderCards(cards, options);

    res.json({
      html,
      cardCount: cards.length
    });

  } catch (error) {
    console.error('Error in /api/presentations/render:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

/**
 * POST /api/presentations/export
 * Export presentation in various formats
 */
router.post('/export', (req, res) => {
  try {
    const { cards, format = 'json', options = {} } = req.body;

    if (!cards || !Array.isArray(cards)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Field "cards" is required and must be an array'
      });
    }

    switch (format) {
      case 'json':
        const json = templateEngine.exportJSON(cards);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename="presentation.json"');
        res.send(json);
        break;

      case 'html':
        const html = templateEngine.renderPage(cards, {
          ...options,
          includeControls: options.includeControls !== false
        });
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Content-Disposition', 'attachment; filename="presentation.html"');
        res.send(html);
        break;

      case 'bundle':
        const bundle = templateEngine.exportBundle(cards, options);
        res.json({
          files: bundle,
          instructions: 'Download these files and include output.css from your project'
        });
        break;

      default:
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid format. Must be one of: json, html, bundle'
        });
    }

  } catch (error) {
    console.error('Error in /api/presentations/export:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

/**
 * GET /api/presentations/preview/:topic
 * Quick preview generation for a topic
 */
router.get('/preview/:topic', (req, res) => {
  try {
    const { topic } = req.params;
    const { theme = 'light', cardCount = 6 } = req.query;

    // Generate presentation
    const presentationData = contentGenerator.generatePresentation({
      topic,
      cardCount: parseInt(cardCount) || 6,
      style: 'professional',
      includeImages: false
    });

    // Get theme
    const presentationTheme = themeService.getTheme(theme);

    // Create Card objects
    const cards = presentationData.cards.map(cardData => {
      return new Card({
        type: cardData.type,
        layout: cardData.layout,
        content: cardData.content,
        theme: presentationTheme
      }).toJSON();
    });

    // Render as HTML page
    const html = templateEngine.renderPage(cards, {
      title: `${topic} - Preview`,
      theme,
      includeControls: true
    });

    res.send(html);

  } catch (error) {
    console.error('Error in /api/presentations/preview:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head><title>Error</title></head>
        <body>
          <h1>Error generating preview</h1>
          <p>${error.message}</p>
        </body>
      </html>
    `);
  }
});

export default router;
