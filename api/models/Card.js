/**
 * Card Model - Core data structure for adaptive cards
 */

import { v4 as uuidv4 } from 'uuid';

export class Card {
  constructor({
    type,
    layout,
    content,
    theme,
    image = null,
    placeholders = null,
    metadata = {}
  }) {
    this.id = uuidv4();
    this.type = type;
    this.layout = layout;
    this.content = content;
    this.theme = theme;
    this.image = this.normalizeImage(image);
    this.placeholders = placeholders;
    this.metadata = metadata;
  }

  /**
   * Normalize image field to proper structure
   */
  normalizeImage(image) {
    if (!image) {
      return null;
    }

    // If image is a string (URL), convert to object
    if (typeof image === 'string') {
      return {
        status: 'ready',
        url: image,
        provider: 'external',
        placeholder: null,
        error: null,
        generatedAt: new Date().toISOString()
      };
    }

    // If image is already an object, ensure all fields exist
    return {
      status: image.status || 'ready',
      url: image.url || null,
      provider: image.provider || 'unknown',
      placeholder: image.placeholder || null,
      error: image.error || null,
      generatedAt: image.generatedAt || new Date().toISOString()
    };
  }

  /**
   * Validate card data against schema
   */
  validate() {
    const errors = [];

    if (!this.type || typeof this.type !== 'string') {
      errors.push('Card type is required and must be a string');
    }

    if (!this.layout || !this.isValidLayout(this.layout)) {
      errors.push('Layout must be one of: split, numbered-list, grid, hero, hero-overlay, content-bullets');
    }

    if (!this.content || typeof this.content !== 'object') {
      errors.push('Content is required and must be an object');
    }

    if (!this.theme || typeof this.theme !== 'object') {
      errors.push('Theme is required and must be an object');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  isValidLayout(layout) {
    const validLayouts = [
      // Original layouts
      // New layouts from index.html
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
      'hero-overlay-layout',
      'three-columns-layout',
      'three-columns-headings-layout',
      'four-columns-layout',
      'title-bullets-layout',
      'title-bullets-image-layout'
    ];
    return validLayouts.includes(layout);
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      layout: this.layout,
      content: this.content,
      theme: this.theme,
      image: this.image,
      placeholders: this.placeholders,
      metadata: this.metadata
    };
  }
}

export default Card;
