/**
 * Unified Pipeline - Intelligent Content-to-Visual Translation System
 *
 * Automatically analyzes content structure and semantics to render in the most
 * appropriate visual format without requiring manual design decisions.
 *
 * Features:
 * - Content analysis and layout detection
 * - Content normalization (handles various input formats)
 * - Progressive rendering support
 * - Error recovery and graceful degradation
 * - Layout-aware HTML generation
 */

export class UnifiedPipeline {
  constructor(templateEngine = null) {
    this.templateEngine = templateEngine;
    console.log('[UnifiedPipeline] Initialized');
  }

  /**
   * Create a complete card from content
   *
   * @param {string} cardId - Unique card identifier
   * @param {Object} content - Raw content object
   * @param {string} [layoutOverride] - Optional layout override
   * @returns {Object} - { html, layout, normalized }
   */
  createCard(cardId, content, layoutOverride = null) {
    try {
      console.log(`[UnifiedPipeline] Creating card ${cardId}`);

      // Step 1: Normalize content
      const normalized = this.normalizeContent(content);
      console.log(`[UnifiedPipeline] ✓ Content normalized`);

      // Step 2: Validate required fields
      if (!normalized.title) {
        console.warn(`[UnifiedPipeline] Card ${cardId} missing title, using fallback`);
        normalized.title = 'Untitled';
      }

      // Step 3: Detect layout
      const layout = layoutOverride || this.detectLayout(normalized);
      console.log(`[UnifiedPipeline] ✓ Layout detected: ${layout}`);

      // Step 4: Generate HTML
      const html = this._generateHTML(layout, normalized, cardId);
      console.log(`[UnifiedPipeline] ✓ HTML generated`);

      return {
        html,
        layout,
        normalized
      };

    } catch (error) {
      console.error(`[UnifiedPipeline] Error creating card ${cardId}:`, error);

      // Fallback to simple text layout
      return {
        html: this._generateFallbackHTML(cardId, content, error),
        layout: 'hero-layout',
        error: error.message
      };
    }
  }

  /**
   * Normalize content from various formats into standard structure
   *
   * Handles:
   * - items, features → cells
   * - intro → body
   * - data → metrics
   * - Stringified arrays → parsed
   * - Stringified JSON → parsed
   *
   * @param {Object} content - Raw content
   * @returns {Object} - Normalized content
   */
  normalizeContent(content) {
    if (!content || typeof content !== 'object') {
      return { title: 'Invalid Content', body: String(content) };
    }

    const normalized = { ...content };

    try {
      // Normalize title variations
      normalized.title = content.title || content.heading || content.header || '';

      // Normalize subtitle variations
      normalized.subtitle = content.subtitle || content.subheading || null;

      // Normalize body variations
      if (content.intro && !content.body) {
        normalized.body = content.intro;
        delete normalized.intro;
      }

      // Normalize kicker variations
      normalized.kicker = content.kicker || content.label || content.tag || null;

      // Normalize items/features → cells
      if (content.items && !content.cells) {
        normalized.cells = this._normalizeList(content.items);
        delete normalized.items;
      }

      if (content.features && !content.cells) {
        normalized.cells = this._normalizeList(content.features);
        delete normalized.features;
      }

      // Normalize bullets
      if (content.bullets) {
        normalized.bullets = this._normalizeList(content.bullets);
      }

      // Normalize data → metrics
      if (content.data && !content.metrics) {
        normalized.metrics = this._normalizeMetrics(content.data);
        delete normalized.data;
      }

      // Parse stringified arrays
      for (const key of Object.keys(normalized)) {
        if (typeof normalized[key] === 'string') {
          try {
            // Try to parse as JSON array
            if (normalized[key].startsWith('[') && normalized[key].endsWith(']')) {
              const parsed = JSON.parse(normalized[key]);
              if (Array.isArray(parsed)) {
                normalized[key] = parsed;
              }
            }
          } catch (e) {
            // Not JSON, leave as string
          }
        }
      }

      // Normalize image field
      if (content.image) {
        if (typeof content.image === 'string') {
          normalized.imageUrl = content.image;
        } else if (content.image.url) {
          normalized.imageUrl = content.image.url;
        }
      }

      return normalized;

    } catch (error) {
      console.error('[UnifiedPipeline] Normalization error:', error);
      return content; // Return original if normalization fails
    }
  }

  /**
   * Detect optimal layout based on content structure and semantics
   *
   * Rules:
   * - Content with bullets → split-layout
   * - Content with feature list → feature-layout
   * - Content with metrics → dashboard-layout
   * - Content with title + subtitle only → hero-layout
   * - Content with image + title → hero-overlay
   *
   * @param {Object} content - Normalized content
   * @returns {string} - Layout name
   */
  detectLayout(content) {
    try {
      // Rule 1: Dashboard layout for metrics/data
      if (content.metrics && Array.isArray(content.metrics) && content.metrics.length > 0) {
        console.log('[UnifiedPipeline] Layout detection: dashboard-layout (metrics found)');
        return 'dashboard-layout';
      }

      // Rule 2: Feature layout for cells with 3+ items
      if (content.cells && Array.isArray(content.cells) && content.cells.length >= 3) {
        console.log('[UnifiedPipeline] Layout detection: feature-layout (3+ cells)');
        return 'feature-layout';
      }

      // Rule 3: Split layout for bullets or 2 cells
      if (content.bullets && Array.isArray(content.bullets) && content.bullets.length > 0) {
        console.log('[UnifiedPipeline] Layout detection: split-layout (bullets found)');
        return 'split-layout';
      }

      if (content.cells && Array.isArray(content.cells) && content.cells.length === 2) {
        console.log('[UnifiedPipeline] Layout detection: split-layout (2 cells)');
        return 'split-layout';
      }

      // Rule 4: Hero-overlay for image + minimal text
      if (content.imageUrl && content.title && !content.body) {
        console.log('[UnifiedPipeline] Layout detection: hero-overlay (image + title only)');
        return 'hero-overlay';
      }

      // Rule 5: Hero layout for title + subtitle only (presentation slide)
      if (content.title && content.subtitle && !content.body && !content.cells) {
        console.log('[UnifiedPipeline] Layout detection: hero-layout (title + subtitle)');
        return 'hero-layout';
      }

      // Rule 6: Sidebar layout for image + content
      if (content.imageUrl && content.body) {
        console.log('[UnifiedPipeline] Layout detection: sidebar-layout (image + body)');
        return 'sidebar-layout';
      }

      // Default: Split layout (versatile)
      console.log('[UnifiedPipeline] Layout detection: split-layout (default)');
      return 'split-layout';

    } catch (error) {
      console.error('[UnifiedPipeline] Layout detection error:', error);
      return 'split-layout'; // Safe fallback
    }
  }

  /**
   * Generate HTML for a specific layout
   *
   * @private
   * @param {string} layout - Layout name
   * @param {Object} content - Normalized content
   * @param {string} cardId - Card ID
   * @returns {string} - HTML string
   */
  _generateHTML(layout, content, cardId) {
    try {
      // If template engine is available, use it
      if (this.templateEngine && this.templateEngine.templates[layout]) {
        return this.templateEngine.render({
          id: cardId,
          layout,
          content
        });
      }

      // Otherwise, use built-in generators
      switch (layout) {
        case 'hero-layout':
          return this._generateHeroHTML(content, cardId);

        case 'hero-overlay':
          return this._generateHeroOverlayHTML(content, cardId);

        case 'split-layout':
          return this._generateSplitHTML(content, cardId);

        case 'feature-layout':
          return this._generateFeatureHTML(content, cardId);

        case 'dashboard-layout':
          return this._generateDashboardHTML(content, cardId);

        case 'sidebar-layout':
          return this._generateSidebarHTML(content, cardId);

        default:
          console.warn(`[UnifiedPipeline] Unknown layout: ${layout}, using split`);
          return this._generateSplitHTML(content, cardId);
      }

    } catch (error) {
      console.error('[UnifiedPipeline] HTML generation error:', error);
      throw error;
    }
  }

  /**
   * Generate HTML for hero layout
   * @private
   */
  _generateHeroHTML(content, cardId) {
    return `
      <div class="layout-card hero-layout" id="card-${cardId}" data-layout="hero-layout">
        <div class="hero-content">
          ${content.kicker ? `<p class="adaptive-text-base uppercase tracking-wider opacity-70 mb-2">${content.kicker}</p>` : ''}
          <h1 class="hero-title">${content.title}</h1>
          ${content.subtitle ? `<p class="hero-subtitle">${content.subtitle}</p>` : ''}
          ${content.body ? `<p class="hero-description">${content.body}</p>` : ''}
        </div>
        ${content.imageUrl ? `
          <div class="hero-image">
            <img src="${content.imageUrl}" alt="${content.title}" />
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Generate HTML for hero-overlay layout
   * @private
   */
  _generateHeroOverlayHTML(content, cardId) {
    return `
      <div class="layout-card hero-layout overlay" id="card-${cardId}" data-layout="hero-overlay">
        <div class="card-body">
          ${content.imageUrl ? `
            <div class="hero-image">
              <img src="${content.imageUrl}" alt="${content.title}" />
            </div>
          ` : ''}
          <div class="hero-content">
            ${content.kicker ? `<p class="adaptive-text-base uppercase tracking-wider opacity-90 mb-2 text-white">${content.kicker}</p>` : ''}
            <h1 class="hero-title text-white">${content.title}</h1>
            ${content.subtitle ? `<p class="hero-subtitle text-white">${content.subtitle}</p>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Generate HTML for split layout
   * @private
   */
  _generateSplitHTML(content, cardId) {
    const leftContent = content.cells && content.cells[0] ? content.cells[0] : null;
    const rightContent = content.cells && content.cells[1] ? content.cells[1] : null;

    return `
      <div class="layout-card split-layout" id="card-${cardId}" data-layout="split-layout">
        <div class="split-left">
          <h2 class="card-title adaptive-text-2xl mb-4">${content.title}</h2>
          ${content.subtitle ? `<p class="adaptive-text-lg opacity-80 mb-4">${content.subtitle}</p>` : ''}
          ${content.body ? `<p class="adaptive-text-base">${content.body}</p>` : ''}
          ${content.bullets ? this._generateBulletList(content.bullets) : ''}
          ${leftContent ? `
            <div class="mt-4">
              <h3 class="adaptive-text-lg font-semibold">${leftContent.title || leftContent}</h3>
              ${leftContent.body ? `<p class="adaptive-text-sm opacity-70">${leftContent.body}</p>` : ''}
            </div>
          ` : ''}
        </div>
        <div class="split-right">
          ${rightContent ? `
            <h3 class="adaptive-text-lg font-semibold mb-2">${rightContent.title || rightContent}</h3>
            ${rightContent.body ? `<p class="adaptive-text-sm opacity-70">${rightContent.body}</p>` : ''}
          ` : ''}
          ${content.imageUrl && !rightContent ? `
            <img src="${content.imageUrl}" alt="${content.title}" class="rounded-lg w-full" />
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Generate HTML for feature layout
   * @private
   */
  _generateFeatureHTML(content, cardId) {
    const cells = content.cells || [];

    return `
      <div class="layout-card feature-layout" id="card-${cardId}" data-layout="feature-layout">
        <div class="feature-header">
          <h2 class="adaptive-text-3xl font-bold mb-2">${content.title}</h2>
          ${content.subtitle ? `<p class="adaptive-text-lg opacity-80">${content.subtitle}</p>` : ''}
        </div>
        <div class="feature-grid">
          ${cells.map(cell => `
            <div class="feature-item">
              <h3 class="adaptive-text-lg font-semibold mb-2">${cell.title || cell}</h3>
              ${cell.body ? `<p class="adaptive-text-sm opacity-70">${cell.body}</p>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Generate HTML for dashboard layout
   * @private
   */
  _generateDashboardHTML(content, cardId) {
    const metrics = content.metrics || [];

    return `
      <div class="layout-card dashboard-layout" id="card-${cardId}" data-layout="dashboard-layout">
        <div class="dashboard-header">
          <h2 class="adaptive-text-2xl font-bold">${content.title}</h2>
        </div>
        <div class="dashboard-main">
          ${metrics.map(metric => `
            <div class="dashboard-widget">
              <div class="adaptive-text-3xl font-bold mb-1">${metric.value || metric}</div>
              <div class="adaptive-text-sm opacity-70">${metric.label || metric.title || ''}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Generate HTML for sidebar layout
   * @private
   */
  _generateSidebarHTML(content, cardId) {
    return `
      <div class="layout-card sidebar-layout" id="card-${cardId}" data-layout="sidebar-layout">
        ${content.imageUrl ? `
          <img src="${content.imageUrl}" alt="${content.title}" class="sidebar-image" />
        ` : ''}
        <div class="sidebar-content">
          <h2 class="adaptive-text-2xl font-bold mb-3">${content.title}</h2>
          ${content.subtitle ? `<p class="adaptive-text-lg opacity-80 mb-3">${content.subtitle}</p>` : ''}
          ${content.body ? `<p class="adaptive-text-base">${content.body}</p>` : ''}
          ${content.bullets ? this._generateBulletList(content.bullets) : ''}
        </div>
      </div>
    `;
  }

  /**
   * Generate bullet list HTML
   * @private
   */
  _generateBulletList(bullets) {
    if (!Array.isArray(bullets) || bullets.length === 0) return '';

    return `
      <ul class="list-disc list-inside space-y-2 mt-4">
        ${bullets.map(bullet => `
          <li class="adaptive-text-base">${typeof bullet === 'object' ? bullet.text || bullet.title : bullet}</li>
        `).join('')}
      </ul>
    `;
  }

  /**
   * Generate fallback HTML when card creation fails
   * @private
   */
  _generateFallbackHTML(cardId, content, error) {
    return `
      <div class="layout-card" id="card-${cardId}" data-layout="fallback">
        <div class="card-body p-8">
          <h2 class="card-title text-error mb-4">Content Rendering Error</h2>
          <p class="text-sm opacity-70 mb-4">Unable to render content in expected format.</p>
          <div class="alert alert-error mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>${error.message || 'Unknown error'}</span>
          </div>
          <details class="collapse collapse-arrow bg-base-200">
            <summary class="collapse-title text-sm font-medium">Show raw content</summary>
            <div class="collapse-content">
              <pre class="text-xs overflow-auto p-4 bg-base-300 rounded">${JSON.stringify(content, null, 2)}</pre>
            </div>
          </details>
        </div>
      </div>
    `;
  }

  /**
   * Normalize list items to standard format
   * @private
   */
  _normalizeList(items) {
    if (!Array.isArray(items)) return [];

    return items.map(item => {
      if (typeof item === 'string') {
        return { title: item, body: null };
      } else if (typeof item === 'object') {
        return {
          title: item.title || item.name || item.label || '',
          body: item.body || item.description || item.text || null
        };
      }
      return { title: String(item), body: null };
    });
  }

  /**
   * Normalize metrics to standard format
   * @private
   */
  _normalizeMetrics(data) {
    if (Array.isArray(data)) {
      return data.map(metric => {
        if (typeof metric === 'object') {
          return {
            value: metric.value || metric.number || metric.metric || '',
            label: metric.label || metric.title || metric.name || ''
          };
        }
        return { value: String(metric), label: '' };
      });
    }

    if (typeof data === 'object') {
      return Object.entries(data).map(([key, value]) => ({
        value: String(value),
        label: key
      }));
    }

    return [];
  }
}

export default UnifiedPipeline;
