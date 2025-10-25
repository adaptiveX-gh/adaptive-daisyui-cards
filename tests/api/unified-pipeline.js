/**
 * Unified Pipeline - Browser-Compatible Version
 *
 * Intelligent Content-to-Visual Translation System for client-side use
 * This is a browser-compatible version without Node.js dependencies
 */

class UnifiedPipeline {
  constructor() {
    console.log('[UnifiedPipeline] Browser version initialized');
  }

  /**
   * Create a complete card from content
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

      return {
        html: this._generateFallbackHTML(cardId, content, error),
        layout: 'hero-layout',
        error: error.message
      };
    }
  }

  /**
   * Normalize content from various formats
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

      // Normalize columns (leftColumn/rightColumn or col1/col2 → columns array)
      if (content.leftColumn && content.rightColumn) {
        normalized.columns = [content.leftColumn, content.rightColumn];
        delete normalized.leftColumn;
        delete normalized.rightColumn;
      } else if (content.col1 && content.col2) {
        normalized.columns = [content.col1, content.col2];
        delete normalized.col1;
        delete normalized.col2;
      }

      // Ensure columns are properly structured
      if (normalized.columns && Array.isArray(normalized.columns)) {
        normalized.columns = normalized.columns.map(col => {
          if (typeof col === 'string') {
            return { text: col };
          } else if (typeof col === 'object') {
            return {
              text: col.text || col.content || col.body || null,
              bullets: col.bullets || null,
              imageUrl: col.imageUrl || col.image || null,
              title: col.title || col.heading || null
            };
          }
          return col;
        });
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
      return content;
    }
  }

  /**
   * Detect optimal layout based on content structure
   */
  detectLayout(content) {
    try {
      // Rule 1: Dashboard layout for metrics/data
      if (content.metrics && Array.isArray(content.metrics) && content.metrics.length > 0) {
        console.log('[UnifiedPipeline] Layout: dashboard-layout (metrics)');
        return 'dashboard-layout';
      }

      // Rule 2: Feature layout for cells with 3+ items
      if (content.cells && Array.isArray(content.cells) && content.cells.length >= 3) {
        console.log('[UnifiedPipeline] Layout: feature-layout (3+ cells)');
        return 'feature-layout';
      }

      // Rule 3: Image-text layout for image + body text (but not bullets)
      if (content.imageUrl && content.body && !content.bullets && !content.cells) {
        console.log('[UnifiedPipeline] Layout: image-text-layout (image + body)');
        return 'image-text-layout';
      }

      // Rule 3.5: Text-image layout for text content + image (with bullets or cells)
      if (content.imageUrl && (content.bullets || content.cells) && !content.body) {
        console.log('[UnifiedPipeline] Layout: text-image-layout (bullets/cells + image)');
        return 'text-image-layout';
      }

      // Rule 3.6: Four columns layout for columns array with 4 items
      if (content.columns && Array.isArray(content.columns) && content.columns.length === 4) {
        console.log('[UnifiedPipeline] Layout: four-columns-layout (4 columns)');
        return 'four-columns-layout';
      }

      // Rule 3.7: Three-columns-headings layout for columns array with 3 items AND column headings
      if (content.columns && Array.isArray(content.columns) && content.columns.length === 3) {
        const hasColumnHeadings = content.columns.some(col =>
          col && (col.heading || col.title || col.columnHeading || col.columnTitle || col.label)
        );
        if (hasColumnHeadings) {
          console.log('[UnifiedPipeline] Layout: three-columns-headings-layout (3 columns with headings)');
          return 'three-columns-headings-layout';
        }
        console.log('[UnifiedPipeline] Layout: three-columns-layout (3 columns without headings)');
        return 'three-columns-layout';
      }

      // Rule 3.8: Two-columns-headings layout for columns array with 2 items AND column headings
      if (content.columns && Array.isArray(content.columns) && content.columns.length === 2) {
        const hasColumnHeadings = content.columns.some(col =>
          col && (col.heading || col.title || col.columnHeading || col.columnTitle || col.label)
        );
        if (hasColumnHeadings) {
          console.log('[UnifiedPipeline] Layout: two-columns-headings-layout (columns with headings)');
          return 'two-columns-headings-layout';
        }
        console.log('[UnifiedPipeline] Layout: two-columns-layout (columns array without headings)');
        return 'two-columns-layout';
      }

      if ((content.leftColumn || content.col1) && (content.rightColumn || content.col2)) {
        console.log('[UnifiedPipeline] Layout: two-columns-layout (leftColumn + rightColumn)');
        return 'two-columns-layout';
      }

      // Rule 3.9: Title-bullets-image layout for bullets + image
      if (content.bullets && Array.isArray(content.bullets) && content.bullets.length > 0 && content.imageUrl) {
        console.log('[UnifiedPipeline] Layout: title-bullets-image-layout (bullets + image)');
        return 'title-bullets-image-layout';
      }

      // Rule 3.10: Title-bullets layout for bullets only (no image, no columns)
      if (content.bullets && Array.isArray(content.bullets) && content.bullets.length > 0 && !content.imageUrl) {
        console.log('[UnifiedPipeline] Layout: title-bullets-layout (bullets only)');
        return 'title-bullets-layout';
      }

      // Rule 4: Split layout for 2 cells
      if (content.cells && Array.isArray(content.cells) && content.cells.length === 2) {
        console.log('[UnifiedPipeline] Layout: split-layout (2 cells)');
        return 'split-layout';
      }

      // Rule 5: Hero-overlay for image + minimal text
      if (content.imageUrl && content.title && !content.body) {
        console.log('[UnifiedPipeline] Layout: hero-overlay (image + title)');
        return 'hero-overlay';
      }

      // Rule 6: Hero layout for title + subtitle only
      if (content.title && content.subtitle && !content.body && !content.cells) {
        console.log('[UnifiedPipeline] Layout: hero-layout (title + subtitle)');
        return 'hero-layout';
      }

      // Rule 7: Sidebar layout for image + content (fallback)
      if (content.imageUrl && content.body) {
        console.log('[UnifiedPipeline] Layout: sidebar-layout (image + body fallback)');
        return 'sidebar-layout';
      }

      // Default: Split layout
      console.log('[UnifiedPipeline] Layout: split-layout (default)');
      return 'split-layout';

    } catch (error) {
      console.error('[UnifiedPipeline] Layout detection error:', error);
      return 'split-layout';
    }
  }

  /**
   * Generate HTML for a specific layout
   * @private
   */
  _generateHTML(layout, content, cardId) {
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
      case 'image-text-layout':
        return this._generateImageTextHTML(content, cardId);
      case 'text-image-layout':
        return this._generateTextImageHTML(content, cardId);
      case 'two-columns-layout':
        return this._generateTwoColumnsHTML(cardId, content);
      case 'two-columns-headings-layout':
        return this._generateTwoColumnsHeadingsHTML(cardId, content);
      case 'three-columns-layout':
        return this._generateThreeColumnsHTML(cardId, content);
      case 'three-columns-headings-layout':
        return this._generateThreeColumnsHeadingsHTML(cardId, content);
      case 'four-columns-layout':
        return this._generateFourColumnsHTML(cardId, content);
      case 'title-bullets-layout':
        return this._generateTitleBulletsHTML(cardId, content);
      case 'title-bullets-image-layout':
        return this._generateTitleBulletsImageHTML(cardId, content);
      default:
        return this._generateSplitHTML(content, cardId);
    }
  }

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

  _generateImageTextHTML(content, cardId) {
    return `
      <div class="layout-card image-text-layout" id="card-${cardId}" data-layout="image-text-layout">
        <div class="image-section">
          ${content.imageUrl ? `
            <img src="${content.imageUrl}" alt="${content.title}" />
          ` : `
            <div class="bg-base-300 w-full h-full flex items-center justify-center">
              <span class="text-base-content/30">Image</span>
            </div>
          `}
        </div>
        <div class="text-section">
          <h2 class="adaptive-text-2xl font-bold mb-3">${content.title}</h2>
          ${content.subtitle ? `<p class="adaptive-text-lg opacity-80 mb-3">${content.subtitle}</p>` : ''}
          ${content.body ? `<p class="adaptive-text-base opacity-80 mb-4">${content.body}</p>` : ''}
          ${content.bullets ? this._generateBulletList(content.bullets) : ''}
          ${content.cells && content.cells.length > 0 ? `
            <div class="space-y-2 mt-4">
              ${content.cells.map(cell => `
                <div class="flex items-start gap-2">
                  <span class="text-primary mt-1">✓</span>
                  <span class="adaptive-text-sm">${typeof cell === 'object' ? cell.title || cell.body : cell}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  _generateTextImageHTML(content, cardId) {
    return `
      <div class="layout-card text-image-layout" id="card-${cardId}" data-layout="text-image-layout">
        <div class="text-section">
          <h2 class="adaptive-text-2xl font-bold mb-3">${content.title}</h2>
          ${content.subtitle ? `<p class="adaptive-text-lg opacity-80 mb-4">${content.subtitle}</p>` : ''}
          ${content.body ? `<p class="adaptive-text-base opacity-80 mb-4">${content.body}</p>` : ''}
          ${content.bullets && content.bullets.length > 0 ? `
            <ul class="space-y-3 mb-4">
              ${content.bullets.map(bullet => `
                <li class="flex items-start gap-2">
                  <span class="text-primary mt-1">✓</span>
                  <span class="adaptive-text-base">${typeof bullet === 'object' ? bullet.text || bullet.title : bullet}</span>
                </li>
              `).join('')}
            </ul>
          ` : ''}
          ${content.cells && content.cells.length > 0 ? `
            <div class="space-y-3 mb-4">
              ${content.cells.map(cell => `
                <div class="flex items-start gap-2">
                  <span class="text-primary mt-1">✓</span>
                  <span class="adaptive-text-base">${typeof cell === 'object' ? cell.title || cell.body : cell}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}
          ${content.action ? `
            <div class="card-actions">
              <button class="btn btn-primary adaptive-text-sm">${content.action}</button>
            </div>
          ` : ''}
        </div>
        <div class="image-section">
          ${content.imageUrl ? `
            <img src="${content.imageUrl}" alt="${content.title}" />
          ` : `
            <div class="bg-base-300 w-full h-full flex items-center justify-center rounded-lg">
              <span class="text-base-content/30">Image</span>
            </div>
          `}
        </div>
      </div>
    `;
  }

  _generateTwoColumnsHTML(cardId, content) {
    const columns = content.columns || [];
    const leftCol = columns[0] || {};
    const rightCol = columns[1] || {};

    const renderColumn = (col) => {
      let html = '';

      // Column title
      if (col.title) {
        html += `<h3 class="adaptive-text-xl font-bold">${col.title}</h3>`;
      }

      // Column text
      if (col.text) {
        html += `<p class="adaptive-text-base opacity-80">${col.text}</p>`;
      }

      // Column bullets
      if (col.bullets && Array.isArray(col.bullets) && col.bullets.length > 0) {
        html += '<ul>';
        col.bullets.forEach(bullet => {
          const bulletText = typeof bullet === 'object' ? bullet.text || bullet.title || bullet : bullet;
          html += `<li class="adaptive-text-sm">${bulletText}</li>`;
        });
        html += '</ul>';
      }

      // Column image
      if (col.imageUrl) {
        html += `<img src="${col.imageUrl}" alt="${col.title || 'Column image'}" />`;
      }

      return html;
    };

    return `
      <div class="layout-card two-columns-layout" id="card-${cardId}" data-layout="two-columns-layout">
        <div class="two-columns-header">
          <h2 class="adaptive-text-2xl font-bold">${content.title}</h2>
          ${content.subtitle ? `<p class="adaptive-text-base opacity-70">${content.subtitle}</p>` : ''}
        </div>
        <div class="two-columns-container" data-layout-container="two-columns">
          <div class="column">
            ${renderColumn(leftCol)}
          </div>
          <div class="column">
            ${renderColumn(rightCol)}
          </div>
        </div>
      </div>
    `;
  }

  _generateTwoColumnsHeadingsHTML(cardId, content) {
    const columns = content.columns || [];
    const leftCol = columns[0] || {};
    const rightCol = columns[1] || {};

    // Normalize column heading property
    const normalizeHeading = (col) => {
      return col.heading || col.title || col.columnHeading || col.columnTitle || col.label || '';
    };

    const renderColumn = (col) => {
      let html = '';

      // Column heading
      const heading = normalizeHeading(col);
      if (heading) {
        html += `<h3 class="column-heading">${heading}</h3>`;
      }

      // Column content wrapper
      html += '<div class="column-content">';

      // Column text
      if (col.text || col.body || col.description) {
        const text = col.text || col.body || col.description;
        html += `<p class="adaptive-text-base opacity-80">${text}</p>`;
      }

      // Column bullets
      if (col.bullets && Array.isArray(col.bullets) && col.bullets.length > 0) {
        html += '<ul>';
        col.bullets.forEach(bullet => {
          const bulletText = typeof bullet === 'object' ? bullet.text || bullet.title || bullet : bullet;
          html += `<li class="adaptive-text-sm">${bulletText}</li>`;
        });
        html += '</ul>';
      }

      // Column image
      if (col.imageUrl || col.image) {
        const imageUrl = col.imageUrl || col.image;
        html += `<img src="${imageUrl}" alt="${heading || 'Column image'}" />`;
      }

      html += '</div>'; // close column-content

      return html;
    };

    return `
      <div class="layout-card two-columns-headings-layout" id="card-${cardId}" data-layout="two-columns-headings-layout">
        <div class="two-columns-header">
          <h2 class="adaptive-text-2xl font-bold">${content.title}</h2>
          ${content.subtitle ? `<p class="adaptive-text-base opacity-70">${content.subtitle}</p>` : ''}
        </div>
        <div class="two-columns-container" data-layout-container="two-columns-headings">
          <div class="column">
            ${renderColumn(leftCol)}
          </div>
          <div class="column">
            ${renderColumn(rightCol)}
          </div>
        </div>
      </div>
    `;
  }

  _generateThreeColumnsHTML(cardId, content) {
    const columns = content.columns || [];

    const renderColumn = (col) => {
      let html = '';

      // Column title
      if (col.title) {
        html += `<h3 class="adaptive-text-xl font-bold">${col.title}</h3>`;
      }

      // Column text
      if (col.text) {
        html += `<p class="adaptive-text-base opacity-80">${col.text}</p>`;
      }

      // Column bullets
      if (col.bullets && Array.isArray(col.bullets) && col.bullets.length > 0) {
        html += '<ul>';
        col.bullets.forEach(bullet => {
          const bulletText = typeof bullet === 'object' ? bullet.text || bullet.title || bullet : bullet;
          html += `<li class="adaptive-text-sm">${bulletText}</li>`;
        });
        html += '</ul>';
      }

      // Column image
      if (col.imageUrl) {
        html += `<img src="${col.imageUrl}" alt="${col.title || 'Column image'}" />`;
      }

      return html;
    };

    return `
      <div class="layout-card three-columns-layout" id="card-${cardId}" data-layout="three-columns-layout">
        <div class="three-columns-header">
          <h2 class="adaptive-text-2xl font-bold">${content.title}</h2>
          ${content.subtitle ? `<p class="adaptive-text-base opacity-70">${content.subtitle}</p>` : ''}
        </div>
        <div class="three-columns-container" data-layout-container="three-columns">
          ${columns.map(col => `<div class="column">${renderColumn(col)}</div>`).join('')}
        </div>
      </div>
    `;
  }

  _generateThreeColumnsHeadingsHTML(cardId, content) {
    const columns = content.columns || [];

    // Normalize column heading property
    const normalizeHeading = (col) => {
      return col.heading || col.title || col.columnHeading || col.columnTitle || col.label || '';
    };

    const renderColumn = (col) => {
      let html = '';

      // Column heading
      const heading = normalizeHeading(col);
      if (heading) {
        html += `<h3 class="column-heading">${heading}</h3>`;
      }

      // Column content wrapper
      html += '<div class="column-content">';

      // Column text
      if (col.text || col.body || col.description) {
        const text = col.text || col.body || col.description;
        html += `<p class="adaptive-text-base opacity-80">${text}</p>`;
      }

      // Column bullets
      if (col.bullets && Array.isArray(col.bullets) && col.bullets.length > 0) {
        html += '<ul>';
        col.bullets.forEach(bullet => {
          const bulletText = typeof bullet === 'object' ? bullet.text || bullet.title || bullet : bullet;
          html += `<li class="adaptive-text-sm">${bulletText}</li>`;
        });
        html += '</ul>';
      }

      // Column image
      if (col.imageUrl || col.image) {
        const imageUrl = col.imageUrl || col.image;
        html += `<img src="${imageUrl}" alt="${heading || 'Column image'}" />`;
      }

      html += '</div>'; // close column-content

      return html;
    };

    return `
      <div class="layout-card three-columns-headings-layout" id="card-${cardId}" data-layout="three-columns-headings-layout">
        <div class="three-columns-header">
          <h2 class="adaptive-text-2xl font-bold">${content.title}</h2>
          ${content.subtitle ? `<p class="adaptive-text-base opacity-70">${content.subtitle}</p>` : ''}
        </div>
        <div class="three-columns-container" data-layout-container="three-columns-headings">
          ${columns.map(col => `<div class="column">${renderColumn(col)}</div>`).join('')}
        </div>
      </div>
    `;
  }

  _generateFourColumnsHTML(cardId, content) {
    const columns = content.columns || [];

    const renderColumn = (col) => {
      let html = '';

      // Column title
      if (col.title) {
        html += `<h3 class="adaptive-text-xl font-bold">${col.title}</h3>`;
      }

      // Column text
      if (col.text) {
        html += `<p class="adaptive-text-base opacity-80">${col.text}</p>`;
      }

      // Column bullets
      if (col.bullets && Array.isArray(col.bullets) && col.bullets.length > 0) {
        html += '<ul>';
        col.bullets.forEach(bullet => {
          const bulletText = typeof bullet === 'object' ? bullet.text || bullet.title || bullet : bullet;
          html += `<li class="adaptive-text-sm">${bulletText}</li>`;
        });
        html += '</ul>';
      }

      // Column image
      if (col.imageUrl) {
        html += `<img src="${col.imageUrl}" alt="${col.title || 'Column image'}" />`;
      }

      return html;
    };

    return `
      <div class="layout-card four-columns-layout" id="card-${cardId}" data-layout="four-columns-layout">
        <div class="four-columns-header">
          <h2 class="adaptive-text-2xl font-bold">${content.title}</h2>
          ${content.subtitle ? `<p class="adaptive-text-base opacity-70">${content.subtitle}</p>` : ''}
        </div>
        <div class="four-columns-container" data-layout-container="four-columns">
          ${columns.map(col => `<div class="column">${renderColumn(col)}</div>`).join('')}
        </div>
      </div>
    `;
  }

  _generateTitleBulletsHTML(cardId, content) {
    const bullets = content.bullets || [];

    return `
      <div class="layout-card title-bullets-layout" id="card-${cardId}" data-layout="title-bullets-layout">
        <div class="title-bullets-header">
          <h2 class="adaptive-text-3xl font-bold">${content.title}</h2>
          ${content.subtitle ? `<p class="adaptive-text-lg opacity-70">${content.subtitle}</p>` : ''}
        </div>
        <div class="bullets-container">
          <ul>
            ${bullets.map(bullet => {
              const bulletText = typeof bullet === 'object' ? bullet.text || bullet.title || bullet : bullet;
              return `<li>${bulletText}</li>`;
            }).join('')}
          </ul>
        </div>
      </div>
    `;
  }

  _generateTitleBulletsImageHTML(cardId, content) {
    const bullets = content.bullets || [];

    return `
      <div class="layout-card title-bullets-image-layout" id="card-${cardId}" data-layout="title-bullets-image-layout">
        <div class="title-bullets-header">
          <h2 class="adaptive-text-2xl font-bold">${content.title}</h2>
          ${content.subtitle ? `<p class="adaptive-text-base opacity-70">${content.subtitle}</p>` : ''}
        </div>
        <div class="content-container">
          <div class="bullets-section">
            <ul>
              ${bullets.map(bullet => {
                const bulletText = typeof bullet === 'object' ? bullet.text || bullet.title || bullet : bullet;
                return `<li class="adaptive-text-base">${bulletText}</li>`;
              }).join('')}
            </ul>
          </div>
          <div class="image-section">
            ${content.imageUrl ? `
              <img src="${content.imageUrl}" alt="${content.title}" />
            ` : `
              <div class="bg-base-300 w-full h-full flex items-center justify-center rounded-lg">
                <span class="text-base-content/30">Image</span>
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  }

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

  _generateFallbackHTML(cardId, content, error) {
    return `
      <div class="layout-card" id="card-${cardId}" data-layout="fallback">
        <div class="card-body p-8">
          <h2 class="card-title text-error mb-4">Content Rendering Error</h2>
          <p class="text-sm opacity-70 mb-4">Unable to render content in expected format.</p>
          <div class="alert alert-error mb-4">
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

// Export for browser use
if (typeof window !== 'undefined') {
  window.UnifiedPipeline = UnifiedPipeline;
}
