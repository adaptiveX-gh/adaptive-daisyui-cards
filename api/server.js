/**
 * Adaptive Cards Platform API Server
 * Phase 1: Core card generation and rendering
 */

import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cardsRouter from './routes/cards.js';
import presentationsRouter from './routes/presentations.js';
import ThemeService from './services/ThemeService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files - serve compiled CSS
const projectRoot = join(__dirname, '..');
app.use('/dist', express.static(join(projectRoot, 'dist')));

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
    version: '0.1.0',
    phase: 1,
    timestamp: new Date().toISOString()
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Adaptive Cards Platform API',
    version: '0.1.0',
    phase: 1,
    description: 'API-first card generation platform for responsive presentations',
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
      themes: {
        'GET /api/themes': 'List available themes',
        'GET /api/themes/:name': 'Get theme details'
      }
    },
    documentation: 'See docs/API-SPEC.md for full specification'
  });
});

// Mount routes
app.use('/api/cards', cardsRouter);
app.use('/api/presentations', presentationsRouter);

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
║   Adaptive Cards Platform API - Phase 1                   ║
║   Version: 0.1.0                                           ║
╟────────────────────────────────────────────────────────────╢
║   Server running on: http://localhost:${PORT}                ║
║   API documentation: http://localhost:${PORT}/api             ║
║   Health check: http://localhost:${PORT}/health               ║
╟────────────────────────────────────────────────────────────╢
║   Available Endpoints:                                     ║
║   • POST /api/cards/generate-content                       ║
║   • POST /api/presentations/generate                       ║
║   • GET  /api/presentations/preview/:topic                 ║
║   • GET  /api/themes                                       ║
╚════════════════════════════════════════════════════════════╝
  `);
});

export default app;
