/**
 * Image Generation Routes
 * Phase 2: Image generation endpoints
 */

import express from 'express';
import { imageGenerationService } from '../services/ImageGenerationService.js';

const router = express.Router();

/**
 * GET /api/images/:cardId/status
 * Get image generation status for a card
 */
router.get('/:cardId/status', (req, res) => {
  try {
    const { cardId } = req.params;
    const status = imageGenerationService.getImageStatus(cardId);

    if (!status) {
      return res.status(404).json({
        error: 'Not Found',
        message: `No image generation found for card: ${cardId}`
      });
    }

    res.json(status);
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

/**
 * POST /api/images/regenerate
 * Regenerate image with different provider
 */
router.post('/regenerate', async (req, res) => {
  try {
    const { cardId, provider = 'gemini' } = req.body;

    if (!cardId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'cardId is required'
      });
    }

    const status = await imageGenerationService.regenerateImage(cardId, provider);

    res.json({
      message: 'Image regeneration started',
      status
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

/**
 * DELETE /api/images/:cardId
 * Cancel image generation
 */
router.delete('/:cardId', (req, res) => {
  try {
    const { cardId } = req.params;
    const cancelled = imageGenerationService.cancelGeneration(cardId);

    if (!cancelled) {
      return res.status(404).json({
        error: 'Not Found',
        message: `No image generation found for card: ${cardId}`
      });
    }

    res.json({
      message: 'Image generation cancelled',
      cardId
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

/**
 * GET /api/images/providers
 * Get status of all image providers
 */
router.get('/providers', (req, res) => {
  try {
    const statuses = imageGenerationService.getProviderStatuses();
    res.json({
      providers: statuses
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

/**
 * POST /api/images/test/:provider
 * Test provider connection
 */
router.post('/test/:provider', async (req, res) => {
  try {
    const { provider } = req.params;
    const result = await imageGenerationService.testProvider(provider);

    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

/**
 * GET /api/images/stats
 * Get image generation statistics
 */
router.get('/stats', (req, res) => {
  try {
    const stats = imageGenerationService.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

export default router;
