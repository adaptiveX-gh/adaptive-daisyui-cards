/**
 * SharedComponentManager
 * Manages shared headers and footers across all cards (symbol pattern)
 * Updates all instances when content changes
 */

class SharedComponentManager {
  constructor() {
    this.config = {
      showHeaders: false,
      showFooters: false,
      header: {
        title: "Presentation Title",
        imageUrl: "https://via.placeholder.com/50x50?text=Logo",
        backgroundColor: "base-100"
      },
      footer: {
        copyrightText: "© 2025 Your Company",
        imageUrl: "https://via.placeholder.com/40x40?text=Logo",
        backgroundColor: "base-100"
      }
    };

    this.storageKey = 'presentation-shared-components';
    this.loadFromStorage();
  }

  /**
   * Update header configuration and re-render all headers
   * @param {Object} newConfig - New header configuration
   */
  updateHeader(newConfig) {
    this.config.header = { ...this.config.header, ...newConfig };
    this.saveToStorage();
    this.renderAllHeaders();
  }

  /**
   * Update footer configuration and re-render all footers
   * @param {Object} newConfig - New footer configuration
   */
  updateFooter(newConfig) {
    this.config.footer = { ...this.config.footer, ...newConfig };
    this.saveToStorage();
    this.renderAllFooters();
  }

  /**
   * Toggle header visibility on all cards
   * @param {boolean} show - Whether to show headers
   */
  toggleHeaders(show) {
    this.config.showHeaders = show;
    this.saveToStorage();

    const headerContainers = document.querySelectorAll('.shared-header-container');
    headerContainers.forEach(container => {
      if (show) {
        container.style.display = 'block';
        this.renderHeader(container);
      } else {
        container.style.display = 'none';
      }
    });
  }

  /**
   * Toggle footer visibility on all cards
   * @param {boolean} show - Whether to show footers
   */
  toggleFooters(show) {
    this.config.showFooters = show;
    this.saveToStorage();

    const footerContainers = document.querySelectorAll('.shared-footer-container');
    footerContainers.forEach(container => {
      if (show) {
        container.style.display = 'block';
        this.renderFooter(container);
      } else {
        container.style.display = 'none';
      }
    });
  }

  /**
   * Render header HTML using DaisyUI navbar component
   * @returns {string} HTML string for header
   */
  renderHeaderHTML() {
    const { title, imageUrl, backgroundColor } = this.config.header;
    const bgClass = `bg-${backgroundColor}`;

    return `
      <div class="navbar ${bgClass} border-b border-base-300">
        <div class="navbar-start">
          <span class="text-lg font-semibold">${this.escapeHtml(title)}</span>
        </div>
        <div class="navbar-end">
          ${imageUrl ? `<img src="${this.escapeHtml(imageUrl)}" alt="Logo" style="max-height: 40px; border-radius: 4px;" onerror="this.style.display='none'" />` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Render footer HTML using DaisyUI footer component
   * @returns {string} HTML string for footer
   */
  renderFooterHTML() {
    const copyrightText = this.escapeHtml(this.config.footer.copyrightText);
    const imageUrl = this.escapeHtml(this.config.footer.imageUrl || '');
    const backgroundColor = this.config.footer.backgroundColor || 'base-100';

    // Build image HTML if imageUrl exists
    const imageHTML = imageUrl ?
      `<img src="${imageUrl}" alt="Logo" style="max-height: 30px; border-radius: 4px;" onerror="this.style.display='none'" />`
      : '';

    return `
      <footer class="footer p-4 bg-${backgroundColor} text-base-content border-t border-base-300">
        <div class="footer-start">
          ${imageHTML}
        </div>
        <div class="footer-center flex-grow text-center">
          <p class="text-sm">${copyrightText}</p>
        </div>
        <div class="footer-end">
          <!-- Right side empty for now, can add elements later -->
        </div>
      </footer>
    `;
  }

  /**
   * Render a single header container
   * @param {HTMLElement} container - The header container element
   */
  renderHeader(container) {
    container.innerHTML = this.renderHeaderHTML();
  }

  /**
   * Render a single footer container
   * @param {HTMLElement} container - The footer container element
   */
  renderFooter(container) {
    container.innerHTML = this.renderFooterHTML();
  }

  /**
   * Render all header instances
   */
  renderAllHeaders() {
    const headerContainers = document.querySelectorAll('.shared-header-container');
    headerContainers.forEach(container => {
      if (this.config.showHeaders) {
        this.renderHeader(container);
      }
    });
  }

  /**
   * Render all footer instances
   */
  renderAllFooters() {
    const footerContainers = document.querySelectorAll('.shared-footer-container');
    footerContainers.forEach(container => {
      if (this.config.showFooters) {
        this.renderFooter(container);
      }
    });
  }

  /**
   * Save configuration to localStorage
   */
  saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.config));
    } catch (error) {
      console.error('Failed to save shared components to storage:', error);
    }
  }

  /**
   * Load configuration from localStorage
   */
  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.config = { ...this.config, ...parsed };
      }
    } catch (error) {
      console.error('Failed to load shared components from storage:', error);
    }
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Initialize shared components on all cards
   */
  initialize() {
    // Set initial visibility
    const headerContainers = document.querySelectorAll('.shared-header-container');
    const footerContainers = document.querySelectorAll('.shared-footer-container');

    headerContainers.forEach(container => {
      container.style.display = this.config.showHeaders ? 'block' : 'none';
      if (this.config.showHeaders) {
        this.renderHeader(container);
      }
    });

    footerContainers.forEach(container => {
      container.style.display = this.config.showFooters ? 'block' : 'none';
      if (this.config.showFooters) {
        this.renderFooter(container);
      }
    });
  }
}

export default SharedComponentManager;
