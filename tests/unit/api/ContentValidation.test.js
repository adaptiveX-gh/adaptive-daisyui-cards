/**
 * Content Validation Layer Tests
 *
 * Tests the layoutSchemas validation functionality to ensure it correctly
 * validates content structure against layout requirements.
 */

import { describe, it, expect } from 'vitest';

/**
 * Mock implementation of layoutSchemas for testing
 * This mirrors the implementation in streaming-progressive.html
 */
const layoutSchemas = {
  'two-columns-layout': {
    requiredSections: ['title', 'columns'],
    optionalSections: ['subtitle'],
    columnStructure: {
      required: ['heading', 'items'],
      optional: ['description'],
      count: 2
    },
    validate(content) {
      const errors = [];

      // Validate required sections
      if (!content.title) errors.push('Missing title section');
      if (!content.columns || !Array.isArray(content.columns)) {
        errors.push('Missing or invalid columns array');
        return { valid: false, errors };
      }

      // Validate column count
      if (content.columns.length !== this.columnStructure.count) {
        errors.push(`Expected ${this.columnStructure.count} columns, got ${content.columns.length}`);
      }

      // Validate each column
      content.columns.forEach((col, i) => {
        if (!col.heading && !col.title) {
          errors.push(`Column ${i + 1}: Missing heading/title`);
        }
        if (!col.items && !col.bullets) {
          errors.push(`Column ${i + 1}: Missing items/bullets array`);
        }
      });

      return { valid: errors.length === 0, errors, warnings: [] };
    }
  },

  'three-columns-layout': {
    requiredSections: ['title', 'columns'],
    optionalSections: ['subtitle'],
    columnStructure: {
      required: ['heading', 'items'],
      optional: ['description'],
      count: 3
    },
    validate(content) {
      const errors = [];

      if (!content.title) errors.push('Missing title section');
      if (!content.columns || !Array.isArray(content.columns)) {
        errors.push('Missing or invalid columns array');
        return { valid: false, errors };
      }

      if (content.columns.length !== this.columnStructure.count) {
        errors.push(`Expected ${this.columnStructure.count} columns, got ${content.columns.length}`);
      }

      content.columns.forEach((col, i) => {
        if (!col.heading && !col.title) {
          errors.push(`Column ${i + 1}: Missing heading/title`);
        }
        if (!col.items && !col.bullets) {
          errors.push(`Column ${i + 1}: Missing items/bullets array`);
        }
      });

      return { valid: errors.length === 0, errors, warnings: [] };
    }
  },

  'four-columns-layout': {
    requiredSections: ['title', 'columns'],
    optionalSections: ['subtitle'],
    columnStructure: {
      required: ['heading', 'items'],
      optional: ['description'],
      count: 4
    },
    validate(content) {
      const errors = [];

      if (!content.title) errors.push('Missing title section');
      if (!content.columns || !Array.isArray(content.columns)) {
        errors.push('Missing or invalid columns array');
        return { valid: false, errors };
      }

      if (content.columns.length !== this.columnStructure.count) {
        errors.push(`Expected ${this.columnStructure.count} columns, got ${content.columns.length}`);
      }

      content.columns.forEach((col, i) => {
        if (!col.heading && !col.title) {
          errors.push(`Column ${i + 1}: Missing heading/title`);
        }
        if (!col.items && !col.bullets) {
          errors.push(`Column ${i + 1}: Missing items/bullets array`);
        }
      });

      return { valid: errors.length === 0, errors, warnings: [] };
    }
  },

  'title-bullets-layout': {
    requiredSections: ['title', 'bullets'],
    optionalSections: ['subtitle'],
    validate(content) {
      const errors = [];

      if (!content.title) errors.push('Missing title section');
      if (!content.bullets && !content.items) {
        errors.push('Missing bullets/items array');
      }

      return { valid: errors.length === 0, errors, warnings: [] };
    }
  },

  _default: {
    validate(content) {
      return {
        valid: true,
        errors: [],
        warnings: ['No validation schema defined for this layout']
      };
    }
  }
};

function validateLayoutContent(layout, content) {
  const schema = layoutSchemas[layout] || layoutSchemas._default;
  return schema.validate(content);
}

describe('Content Validation Layer', () => {
  describe('Two Columns Layout', () => {
    it('should validate correct two-column content', () => {
      const validContent = {
        title: 'Test Title',
        subtitle: 'Test Subtitle',
        columns: [
          {
            heading: 'Column 1',
            items: ['Item 1', 'Item 2']
          },
          {
            heading: 'Column 2',
            items: ['Item 3', 'Item 4']
          }
        ]
      };

      const result = validateLayoutContent('two-columns-layout', validContent);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail when title is missing', () => {
      const invalidContent = {
        columns: [
          { heading: 'Col 1', items: ['A'] },
          { heading: 'Col 2', items: ['B'] }
        ]
      };

      const result = validateLayoutContent('two-columns-layout', invalidContent);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing title section');
    });

    it('should fail when columns array is missing', () => {
      const invalidContent = {
        title: 'Test Title'
      };

      const result = validateLayoutContent('two-columns-layout', invalidContent);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing or invalid columns array');
    });

    it('should fail when wrong number of columns', () => {
      const invalidContent = {
        title: 'Test Title',
        columns: [
          { heading: 'Only One Column', items: ['Item 1'] }
        ]
      };

      const result = validateLayoutContent('two-columns-layout', invalidContent);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Expected 2 columns, got 1');
    });

    it('should fail when column is missing heading', () => {
      const invalidContent = {
        title: 'Test Title',
        columns: [
          { heading: 'Col 1', items: ['A'] },
          { items: ['B'] } // Missing heading
        ]
      };

      const result = validateLayoutContent('two-columns-layout', invalidContent);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Column 2: Missing heading/title');
    });

    it('should fail when column is missing items', () => {
      const invalidContent = {
        title: 'Test Title',
        columns: [
          { heading: 'Col 1', items: ['A'] },
          { heading: 'Col 2' } // Missing items
        ]
      };

      const result = validateLayoutContent('two-columns-layout', invalidContent);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Column 2: Missing items/bullets array');
    });

    it('should accept bullets instead of items', () => {
      const validContent = {
        title: 'Test Title',
        columns: [
          { heading: 'Col 1', bullets: ['A'] },
          { heading: 'Col 2', bullets: ['B'] }
        ]
      };

      const result = validateLayoutContent('two-columns-layout', validContent);

      expect(result.valid).toBe(true);
    });
  });

  describe('Three Columns Layout', () => {
    it('should validate correct three-column content', () => {
      const validContent = {
        title: 'Three Column Test',
        columns: [
          { heading: 'Col 1', items: ['A'] },
          { heading: 'Col 2', items: ['B'] },
          { heading: 'Col 3', items: ['C'] }
        ]
      };

      const result = validateLayoutContent('three-columns-layout', validContent);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail with wrong column count', () => {
      const invalidContent = {
        title: 'Test',
        columns: [
          { heading: 'Col 1', items: ['A'] },
          { heading: 'Col 2', items: ['B'] }
        ]
      };

      const result = validateLayoutContent('three-columns-layout', invalidContent);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Expected 3 columns, got 2');
    });
  });

  describe('Four Columns Layout', () => {
    it('should validate correct four-column content', () => {
      const validContent = {
        title: 'Four Column Test',
        columns: [
          { heading: 'Q1', items: ['A'] },
          { heading: 'Q2', items: ['B'] },
          { heading: 'Q3', items: ['C'] },
          { heading: 'Q4', items: ['D'] }
        ]
      };

      const result = validateLayoutContent('four-columns-layout', validContent);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail with wrong column count', () => {
      const invalidContent = {
        title: 'Test',
        columns: [
          { heading: 'Col 1', items: ['A'] },
          { heading: 'Col 2', items: ['B'] },
          { heading: 'Col 3', items: ['C'] }
        ]
      };

      const result = validateLayoutContent('four-columns-layout', invalidContent);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Expected 4 columns, got 3');
    });
  });

  describe('Title Bullets Layout', () => {
    it('should validate correct title-bullets content', () => {
      const validContent = {
        title: 'Bullet List',
        bullets: ['Point 1', 'Point 2', 'Point 3']
      };

      const result = validateLayoutContent('title-bullets-layout', validContent);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept items instead of bullets', () => {
      const validContent = {
        title: 'Item List',
        items: ['Item 1', 'Item 2']
      };

      const result = validateLayoutContent('title-bullets-layout', validContent);

      expect(result.valid).toBe(true);
    });

    it('should fail when bullets/items missing', () => {
      const invalidContent = {
        title: 'No Bullets'
      };

      const result = validateLayoutContent('title-bullets-layout', invalidContent);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing bullets/items array');
    });
  });

  describe('Default Schema', () => {
    it('should pass validation for unknown layouts', () => {
      const anyContent = {
        randomField: 'value'
      };

      const result = validateLayoutContent('unknown-layout', anyContent);

      expect(result.valid).toBe(true);
      expect(result.warnings).toContain('No validation schema defined for this layout');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty columns array', () => {
      const invalidContent = {
        title: 'Test',
        columns: []
      };

      const result = validateLayoutContent('two-columns-layout', invalidContent);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Expected 2 columns, got 0');
    });

    it('should handle null columns', () => {
      const invalidContent = {
        title: 'Test',
        columns: null
      };

      const result = validateLayoutContent('two-columns-layout', invalidContent);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing or invalid columns array');
    });

    it('should allow subtitle as optional field', () => {
      const validContent = {
        title: 'Test',
        subtitle: 'Optional Subtitle',
        columns: [
          { heading: 'Col 1', items: ['A'] },
          { heading: 'Col 2', items: ['B'] }
        ]
      };

      const result = validateLayoutContent('two-columns-layout', validContent);

      expect(result.valid).toBe(true);
    });

    it('should validate multiple missing fields', () => {
      const invalidContent = {
        columns: [
          { items: ['A'] }, // Missing heading
          { heading: 'Col 2' } // Missing items
        ]
      };

      const result = validateLayoutContent('two-columns-layout', invalidContent);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing title section');
      expect(result.errors).toContain('Column 1: Missing heading/title');
      expect(result.errors).toContain('Column 2: Missing items/bullets array');
    });
  });

  describe('Alternative Field Names', () => {
    it('should accept title instead of heading in columns', () => {
      const validContent = {
        title: 'Test',
        columns: [
          { title: 'Col 1', items: ['A'] },
          { title: 'Col 2', items: ['B'] }
        ]
      };

      const result = validateLayoutContent('two-columns-layout', validContent);

      expect(result.valid).toBe(true);
    });

    it('should accept mixed heading and title fields', () => {
      const validContent = {
        title: 'Test',
        columns: [
          { heading: 'Col 1', items: ['A'] },
          { title: 'Col 2', items: ['B'] }
        ]
      };

      const result = validateLayoutContent('two-columns-layout', validContent);

      expect(result.valid).toBe(true);
    });
  });
});
