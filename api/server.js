/**
 * Adaptive Cards Platform API Server
 * Phase 1: Core card generation and rendering
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cardsRouter from './routes/cards.js';
import presentationsRouter from './routes/presentations.js';
import imagesRouter from './routes/images.js';
import streamingRouter from './routes/streaming.js';
import outlineRouter from './routes/outline.js';
import ThemeService from './services/ThemeService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files - serve compiled CSS and test pages
const projectRoot = join(__dirname, '..');
app.use('/dist', express.static(join(projectRoot, 'dist')));
app.use('/tests', express.static(join(projectRoot, 'tests')));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '0.3.0',
    phase: 3,
    features: [
      'card-generation',
      'image-generation',
      'placeholder-system',
      'sse-streaming',
      'progressive-assembly'
    ],
    timestamp: new Date().toISOString()
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Adaptive Cards Platform API',
    version: '0.3.0',
    phase: 3,
    description: 'API-first card generation platform for responsive presentations with SSE streaming',
    endpoints: {
      cards: {
        'POST /api/cards/generate-content': 'Generate content for a single card',
        'POST /api/cards/render': 'Render a card to HTML',
        'GET /api/cards/layouts': 'List available layouts',
        'GET /api/cards/topics': 'List available topics (Phase 1)'
      },
      presentations: {
        'POST /api/presentations/generate': 'Generate a complete presentation',
        'POST /api/presentations/render': 'Render presentation to HTML',
        'POST /api/presentations/export': 'Export presentation (json/html/bundle)',
        'GET /api/presentations/preview/:topic': 'Quick preview for a topic'
      },
      streaming: {
        'POST /api/cards/stream': 'Stream single card generation (SSE)',
        'POST /api/presentations/stream': 'Stream presentation generation (SSE)',
        'POST /api/presentations/stream-from-outline': 'Stream from user-edited outline (SSE)',
        'GET /api/stream/demo': 'Demo SSE streaming with delays'
      },
      outline: {
        'POST /api/presentation/generate-outline': 'Generate editable outline',
        'POST /api/presentation/generate-from-outline': 'Validate outline (redirects to SSE)'
      },
      themes: {
        'GET /api/themes': 'List available themes',
        'GET /api/themes/:name': 'Get theme details'
      },
      images: {
        'GET /api/images/:cardId/status': 'Get image generation status',
        'POST /api/images/regenerate': 'Regenerate image with different provider',
        'DELETE /api/images/:cardId': 'Cancel image generation',
        'GET /api/images/providers': 'Get provider statuses',
        'GET /api/images/stats': 'Get image generation statistics'
      }
    },
    documentation: 'See docs/API-SPEC.md for full specification'
  });
});

// Mount routes
app.use('/api/cards', cardsRouter);
app.use('/api/presentations', presentationsRouter);
app.use('/api/images', imagesRouter);
app.use('/api/presentation', outlineRouter);

// Mount streaming routes (Phase 3)
app.use('/api', streamingRouter);

// Theme routes
const themeService = new ThemeService();

app.get('/api/themes', (req, res) => {
  const themes = themeService.getAllThemes();
  res.json({
    themes: themes.map(name => ({
      name,
      ...themeService.getTheme(name)
    }))
  });
});

app.get('/api/themes/:name', (req, res) => {
  try {
    const theme = themeService.getTheme(req.params.name);
    res.json(theme);
  } catch (error) {
    res.status(404).json({
      error: 'Not Found',
      message: `Theme not found: ${req.params.name}`
    });
  }
});

// Root route - redirect to API info
app.get('/', (req, res) => {
  res.redirect('/api');
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route not found: ${req.method} ${req.path}`,
    availableEndpoints: '/api'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║   Adaptive Cards Platform API - Phase 3                   ║
║   Version: 0.3.0 (SSE Streaming Architecture)             ║
╟────────────────────────────────────────────────────────────╢
║   Server running on: http://localhost:${PORT}                ║
║   API documentation: http://localhost:${PORT}/api             ║
║   Health check: http://localhost:${PORT}/health               ║
╟────────────────────────────────────────────────────────────╢
║   Core Endpoints:                                          ║
║   • POST /api/cards/generate-content                       ║
║   • POST /api/presentations/generate                       ║
║   • GET  /api/presentations/preview/:topic                 ║
║   • GET  /api/themes                                       ║
╟────────────────────────────────────────────────────────────╢
║   SSE Streaming (NEW - Phase 3):                           ║
║   • POST /api/cards/stream                                 ║
║   • POST /api/presentations/stream                         ║
║   • GET  /api/stream/demo                                  ║
╟────────────────────────────────────────────────────────────╢
║   Image Generation:                                        ║
║   • GET  /api/images/:cardId/status                        ║
║   • POST /api/images/regenerate                            ║
║   • GET  /api/images/providers                             ║
╚════════════════════════════════════════════════════════════╝
  `);
});

export default app;
