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
    this.image = image;
    this.placeholders = placeholders;
    this.metadata = metadata;
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
    const validLayouts = ['split', 'numbered-list', 'grid', 'hero', 'hero-overlay', 'content-bullets'];
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
