/**
 * TemplateEngine Service
 * Renders HTML templates with layout-specific content and theme support
 */

import Handlebars from 'handlebars';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class TemplateEngine {
  constructor() {
    this.templates = {};
    this.handlebars = Handlebars.create();

    // Register custom helpers
    this.registerHelpers();

    // Load templates
    this.loadTemplates();
  }

  /**
   * Register Handlebars helpers
   */
  registerHelpers() {
    // Increment helper for numbered lists (1-indexed)
    this.handlebars.registerHelper('inc', (value) => {
      return parseInt(value) + 1;
    });

    // Check if value is array
    this.handlebars.registerHelper('isArray', (value) => {
      return Array.isArray(value);
    });

    // Conditional if equals
    this.handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
      return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
    });
  }

  /**
   * Load all template files
   */
  loadTemplates() {
    const templateDir = join(__dirname, '..', 'templates');
    const layouts = [
      // All current layouts
      'hero-overlay',
      'objectives-layout',
      'sidebar-layout',
      'feature-layout',
      'masonry-layout',
      'dashboard-layout',
      'split-layout',
      'image-text-layout',
      'text-image-layout',
      'two-columns-layout',
      'two-columns-headings-layout',
      'hero-layout',
      'three-columns-layout',
      'three-columns-headings-layout',
      'four-columns-layout',
      'title-bullets-layout',
      'title-bullets-image-layout'
    ];

    for (const layout of layouts) {
      try {
        const templatePath = join(templateDir, `${layout}.html`);
        const templateContent = readFileSync(templatePath, 'utf-8');
        this.templates[layout] = this.handlebars.compile(templateContent);
      } catch (error) {
        console.error(`Failed to load template for layout: ${layout}`, error);
      }
    }
  }

  /**
   * Render a card to HTML
   */
  render(card) {
    const template = this.templates[card.layout];
    if (!template) {
      throw new Error(`Template not found for layout: ${card.layout}`);
    }

    // Prepare template data
    const templateData = {
      id: card.id,
      ...card.content
    };

    // Handle array body for split layout
    if (card.layout === 'split' && Array.isArray(card.content.body)) {
      templateData.bodyArray = true;
      templateData.body = card.content.body;
    }

    // Handle image URLs
    if (card.image && typeof card.image === 'string') {
      templateData.imageUrl = card.image;
    } else if (card.image && card.image.url) {
      templateData.imageUrl = card.image.url;
    }

    // Render template
    return template(templateData);
  }

  /**
   * Render multiple cards with container wrapper
   */
  renderCards(cards, options = {}) {
    const {
      containerWidth = '800px',
      theme = 'light',
      includeControls = false
    } = options;

    const renderedCards = cards.map(card => {
      const html = this.render(card);
      return `
        <div class="card-container mb-8" style="width: ${containerWidth}; margin-left: auto; margin-right: auto;">
          ${html}
        </div>
      `;
    }).join('\n');

    return renderedCards;
  }

  /**
   * Generate complete HTML page with cards
   */
  renderPage(cards, options = {}) {
    const {
      title = 'Adaptive Cards Presentation',
      theme = 'light',
      includeControls = true,
      cssPath = '/dist/output.css'
    } = options;

    const cardsHtml = this.renderCards(cards, options);

    return `<!DOCTYPE html>
<html lang="en" data-theme="${theme}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="stylesheet" href="${cssPath}">
  <style>
    .presentation-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    .card-container {
      container-type: inline-size;
      container-name: card;
    }
  </style>
</head>
<body class="bg-base-200 min-h-screen">
  <div class="presentation-container">
    ${includeControls ? this.renderControls(theme) : ''}
    ${cardsHtml}
  </div>
  ${includeControls ? this.renderControlsScript() : ''}
</body>
</html>`;
  }

  /**
   * Render theme controls
   */
  renderControls(currentTheme) {
    const themes = [
      'light', 'dark', 'corporate', 'business', 'cyberpunk',
      'synthwave', 'dracula', 'cupcake', 'pastel', 'valentine',
      'retro', 'halloween', 'forest'
    ];

    const themeOptions = themes.map(theme =>
      `<option value="${theme}" ${theme === currentTheme ? 'selected' : ''}>${theme}</option>`
    ).join('');

    return `
    <div class="bg-base-100 rounded-lg shadow-lg p-6 mb-8">
      <div class="flex items-center gap-4">
        <label class="font-semibold">Theme:</label>
        <select id="theme-select" class="select select-bordered select-primary">
          ${themeOptions}
        </select>
        <label class="font-semibold ml-4">Container Width:</label>
        <input type="range" id="width-slider" min="300" max="1200" value="800"
               class="range range-primary" />
        <span id="width-display" class="badge badge-primary">800px</span>
      </div>
    </div>`;
  }

  /**
   * Render controls JavaScript
   */
  renderControlsScript() {
    return `
    <script>
      // Theme switcher
      const themeSelect = document.getElementById('theme-select');
      if (themeSelect) {
        themeSelect.addEventListener('change', (e) => {
          document.documentElement.setAttribute('data-theme', e.target.value);
        });
      }

      // Width slider
      const widthSlider = document.getElementById('width-slider');
      const widthDisplay = document.getElementById('width-display');
      if (widthSlider) {
        widthSlider.addEventListener('input', (e) => {
          const width = e.target.value + 'px';
          widthDisplay.textContent = width;
          document.querySelectorAll('.card-container').forEach(container => {
            container.style.width = width;
          });
        });
      }
    </script>`;
  }

  /**
   * Render card skeleton (for SSE streaming)
   */
  renderSkeleton(layout, cardId) {
    return `
    <div class="layout-card animate-pulse" data-layout="${layout}" data-card-id="${cardId}">
      <div class="p-8 space-y-4">
        <div class="h-8 bg-base-300 rounded w-3/4"></div>
        <div class="h-4 bg-base-300 rounded w-full"></div>
        <div class="h-4 bg-base-300 rounded w-5/6"></div>
      </div>
    </div>`;
  }

  /**
   * Export cards as JSON
   */
  exportJSON(cards) {
    return JSON.stringify(cards, null, 2);
  }

  /**
   * Export presentation as static HTML bundle (returns zip-ready structure)
   */
  exportBundle(cards, options = {}) {
    const html = this.renderPage(cards, {
      ...options,
      includeControls: false,
      cssPath: './output.css'
    });

    return {
      'index.html': html,
      'readme.txt': 'To use this presentation:\n1. Copy output.css from your project dist folder\n2. Open index.html in a web browser\n3. Use arrow keys or spacebar to navigate'
    };
  }
}

export default TemplateEngine;
