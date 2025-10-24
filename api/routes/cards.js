/**
 * Card generation routes
 */

import express from 'express';
import { Card } from '../models/Card.js';
import { validateContent } from '../models/schemas.js';
import ContentGenerator from '../services/ContentGenerator.js';
import ThemeService from '../services/ThemeService.js';
import TemplateEngine from '../services/TemplateEngine.js';

const router = express.Router();

// Initialize services
const contentGenerator = new ContentGenerator();
const themeService = new ThemeService();
const templateEngine = new TemplateEngine();

/**
 * POST /api/cards/generate-content
 * Generate content for a single card
 */
router.post('/generate-content', (req, res) => {
  try {
    const { topic, layoutType, tone, contentSections, style, theme } = req.body;

    // Validate required fields
    if (!topic) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Field "topic" is required'
      });
    }

    if (!layoutType) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Field "layoutType" is required'
      });
    }

    // Validate layout type
    const validLayouts = ['split', 'numbered-list', 'grid', 'hero', 'hero-overlay', 'content-bullets'];
    if (!validLayouts.includes(layoutType)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: `Invalid layoutType. Must be one of: ${validLayouts.join(', ')}`
      });
    }

    // Generate content
    let cardData;
    try {
      cardData = contentGenerator.generateCardContent({
        topic,
        layoutType,
        tone,
        contentSections,
        style
      });
    } catch (error) {
      return res.status(400).json({
        error: 'Bad Request',
        message: error.message
      });
    }

    // Validate content against schema
    const validation = validateContent(cardData.layout, cardData.content);
    if (!validation.valid) {
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Generated content failed validation',
        details: validation.errors
      });
    }

    // Get theme
    const cardTheme = theme
      ? themeService.normalizeTheme(theme)
      : themeService.getThemeByStyle(style || 'professional');

    // Create card
    const card = new Card({
      type: cardData.type,
      layout: cardData.layout,
      content: cardData.content,
      theme: cardTheme
    });

    // Validate card
    const cardValidation = card.validate();
    if (!cardValidation.valid) {
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Card validation failed',
        details: cardValidation.errors
      });
    }

    // Return card
    res.json({
      card: card.toJSON()
    });

  } catch (error) {
    console.error('Error in /api/cards/generate-content:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

/**
 * POST /api/cards/render
 * Render a card to HTML
 */
router.post('/render', (req, res) => {
  try {
    const { card } = req.body;

    if (!card) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Field "card" is required'
      });
    }

    // Render card
    const html = templateEngine.render(card);

    res.json({
      html,
      cardId: card.id
    });

  } catch (error) {
    console.error('Error in /api/cards/render:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

/**
 * GET /api/cards/layouts
 * Get list of available layouts
 */
router.get('/layouts', (req, res) => {
  res.json({
    layouts: [
      {
        name: 'split',
        description: 'Text content on left/right with image section',
        useCases: ['Feature highlights', 'Method explanations', 'Process descriptions']
      },
      {
        name: 'numbered-list',
        description: 'Ordered list with large numbers',
        useCases: ['Objectives', 'Steps', 'Key points', 'Takeaways']
      },
      {
        name: 'grid',
        description: '2x2 grid of content cells',
        useCases: ['Process overview', 'Feature comparison', 'Quadrants']
      },
      {
        name: 'hero',
        description: 'Large title with side-by-side image',
        useCases: ['Title slides', 'Section headers', 'Calls-to-action']
      },
      {
        name: 'hero-overlay',
        description: 'Large title overlaid on full-bleed image',
        useCases: ['Opening slides', 'Dramatic statements', 'Brand presentations']
      },
      {
        name: 'content-bullets',
        description: 'Title with bulleted list',
        useCases: ['Benefits', 'Features', 'Summary points']
      }
    ]
  });
});

/**
 * GET /api/cards/topics
 * Get list of available topics (Phase 1)
 */
router.get('/topics', (req, res) => {
  try {
    const topics = contentGenerator.getAvailableTopics();
    res.json({
      topics: topics.map(topic => ({
        name: topic,
        sections: contentGenerator.getTopicSections(topic)
      }))
    });
  } catch (error) {
    console.error('Error in /api/cards/topics:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

export default router;
