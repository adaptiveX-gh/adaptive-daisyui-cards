/**
 * Layout-specific content schemas
 * Defines the structure for each card layout type
 */

export const LAYOUT_SCHEMAS = {
  split: {
    title: { type: 'string', required: true },
    body: { type: ['string', 'array'], required: true },
    imagePrompt: { type: 'string', required: false }
  },

  'numbered-list': {
    intro: { type: 'string', required: false },
    items: { type: 'array', required: true, minItems: 1, maxItems: 10 }
  },

  grid: {
    title: { type: 'string', required: false },
    cells: {
      type: 'array',
      required: true,
      minItems: 4,
      maxItems: 4,
      itemSchema: {
        title: { type: 'string', required: false },
        body: { type: 'string', required: false }
      }
    }
  },

  hero: {
    title: { type: 'string', required: true },
    subtitle: { type: 'string', required: false },
    kicker: { type: 'string', required: false },
    cta: {
      type: 'object',
      required: false,
      properties: {
        label: { type: 'string', required: true },
        href: { type: 'string', required: false }
      }
    },
    imagePrompt: { type: 'string', required: false }
  },

  'hero-overlay': {
    title: { type: 'string', required: true },
    subtitle: { type: 'string', required: false },
    kicker: { type: 'string', required: false },
    cta: {
      type: 'object',
      required: false,
      properties: {
        label: { type: 'string', required: true },
        href: { type: 'string', required: false }
      }
    },
    imagePrompt: { type: 'string', required: false }
  },

  'content-bullets': {
    title: { type: 'string', required: true },
    bullets: { type: 'array', required: true, minItems: 1, maxItems: 8 },
    footnote: { type: 'string', required: false }
  }
};

/**
 * Validate content against layout schema
 */
export function validateContent(layout, content) {
  const schema = LAYOUT_SCHEMAS[layout];
  if (!schema) {
    return { valid: false, errors: [`Unknown layout: ${layout}`] };
  }

  const errors = [];

  for (const [field, rules] of Object.entries(schema)) {
    const value = content[field];

    // Check required fields
    if (rules.required && (value === undefined || value === null)) {
      errors.push(`Field '${field}' is required for layout '${layout}'`);
      continue;
    }

    // Skip validation if field is optional and not provided
    if (!rules.required && (value === undefined || value === null)) {
      continue;
    }

    // Type validation
    const expectedTypes = Array.isArray(rules.type) ? rules.type : [rules.type];
    const actualType = Array.isArray(value) ? 'array' : typeof value;

    if (!expectedTypes.includes(actualType)) {
      errors.push(`Field '${field}' must be of type ${expectedTypes.join(' or ')}, got ${actualType}`);
    }

    // Array validation
    if (actualType === 'array' && rules.minItems && value.length < rules.minItems) {
      errors.push(`Field '${field}' must have at least ${rules.minItems} items`);
    }

    if (actualType === 'array' && rules.maxItems && value.length > rules.maxItems) {
      errors.push(`Field '${field}' must have at most ${rules.maxItems} items`);
    }

    // Array item schema validation
    if (actualType === 'array' && rules.itemSchema) {
      value.forEach((item, index) => {
        for (const [itemField, itemRules] of Object.entries(rules.itemSchema)) {
          const itemValue = item[itemField];
          if (itemRules.required && (itemValue === undefined || itemValue === null)) {
            errors.push(`Item ${index} in '${field}' is missing required field '${itemField}'`);
          }
        }
      });
    }

    // Object property validation
    if (actualType === 'object' && rules.properties) {
      for (const [prop, propRules] of Object.entries(rules.properties)) {
        const propValue = value[prop];
        if (propRules.required && (propValue === undefined || propValue === null)) {
          errors.push(`Field '${field}.${prop}' is required`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Theme schema
 */
export const THEME_SCHEMA = {
  name: { type: 'string', required: true },
  colors: {
    type: 'object',
    required: false,
    properties: {
      primary: { type: 'string' },
      secondary: { type: 'string' },
      accent: { type: 'string' },
      bg: { type: 'string' },
      text: { type: 'string' }
    }
  },
  scale: { type: 'string', required: false }
};

/**
 * Placeholder schema
 */
export const PLACEHOLDER_SCHEMA = {
  type: {
    type: 'string',
    required: true,
    enum: ['geometric', 'pattern', 'solid']
  },
  color: { type: 'string', required: true },
  loadingState: { type: 'boolean', required: false },
  expectedDuration: { type: 'number', required: false },
  aspectRatio: { type: 'string', required: false }
};

export default {
  LAYOUT_SCHEMAS,
  THEME_SCHEMA,
  PLACEHOLDER_SCHEMA,
  validateContent
};
