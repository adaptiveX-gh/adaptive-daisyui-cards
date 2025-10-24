/**
 * Prompt Enhancer Utility
 * Enhances image generation prompts for better results
 */

/**
 * Style-specific enhancements
 */
const STYLE_ENHANCEMENTS = {
  'professional-presentation': {
    prefix: 'Professional presentation slide background image,',
    descriptors: ['clean', 'minimal', 'corporate aesthetic', 'modern design'],
    suffix: 'subtle, not distracting, suitable for text overlay, high quality'
  },
  'abstract': {
    prefix: 'Abstract artistic image,',
    descriptors: ['geometric shapes', 'flowing forms', 'contemporary art style', 'creative'],
    suffix: 'visually striking, modern aesthetic, high quality'
  },
  'minimalist': {
    prefix: 'Minimalist design image,',
    descriptors: ['simple', 'clean lines', 'negative space', 'refined'],
    suffix: 'elegant, understated, high quality'
  },
  'illustrative': {
    prefix: 'Illustrative graphic image,',
    descriptors: ['hand-drawn style', 'artistic', 'creative illustration', 'engaging'],
    suffix: 'colorful, expressive, high quality'
  }
};

/**
 * Theme-based enhancements
 */
const THEME_ENHANCEMENTS = {
  cyberpunk: 'neon colors, futuristic, tech-noir aesthetic, digital',
  pastel: 'soft colors, gentle gradients, minimalist, calming',
  retro: 'vintage, nostalgic, warm tones, classic design',
  professional: 'clean, corporate, modern, business aesthetic',
  dark: 'dark mode, high contrast, sophisticated, dramatic',
  light: 'bright, airy, open, clean aesthetic',
  forest: 'nature-inspired, organic, green tones, natural',
  ocean: 'blue tones, fluid, calm, aquatic aesthetic'
};

/**
 * Content-aware enhancements based on keywords
 */
const CONTENT_KEYWORDS = {
  ai: ['neural networks', 'artificial intelligence visualization', 'futuristic tech'],
  data: ['data visualization', 'analytics', 'information graphics'],
  business: ['corporate setting', 'professional environment', 'business context'],
  technology: ['tech aesthetic', 'digital', 'innovative'],
  science: ['scientific visualization', 'research aesthetic', 'analytical'],
  creative: ['artistic', 'imaginative', 'creative composition'],
  education: ['learning environment', 'educational context', 'clear communication'],
  team: ['collaborative', 'people-focused', 'teamwork visualization']
};

/**
 * Enhance a prompt for image generation
 *
 * @param {string} prompt - Base prompt
 * @param {string} style - Style preset
 * @param {string} theme - Theme name
 * @param {Object} options - Additional options
 * @returns {string} - Enhanced prompt
 */
export function enhancePrompt(prompt, style = 'professional-presentation', theme = 'professional', options = {}) {
  if (!prompt || typeof prompt !== 'string') {
    throw new Error('Prompt is required and must be a string');
  }

  const enhancement = STYLE_ENHANCEMENTS[style] || STYLE_ENHANCEMENTS['professional-presentation'];
  const parts = [];

  // Add style prefix
  parts.push(enhancement.prefix);

  // Add original prompt
  parts.push(prompt.trim());

  // Add style descriptors (1-2 random ones for variety)
  const selectedDescriptors = enhancement.descriptors.slice(0, 2);
  if (selectedDescriptors.length > 0) {
    parts.push(selectedDescriptors.join(', '));
  }

  // Add theme enhancement
  const themeEnhancement = THEME_ENHANCEMENTS[theme];
  if (themeEnhancement) {
    parts.push(themeEnhancement);
  }

  // Add content-aware enhancements
  const contentEnhancements = extractContentEnhancements(prompt);
  if (contentEnhancements.length > 0) {
    parts.push(contentEnhancements.slice(0, 2).join(', '));
  }

  // Add specific requirements for presentations
  if (options.forTextOverlay !== false) {
    parts.push('clean background for text overlay');
  }

  // Add style suffix
  parts.push(enhancement.suffix);

  // Join with commas and clean up
  return parts
    .filter(Boolean)
    .join(', ')
    .replace(/,\s*,/g, ',') // Remove double commas
    .replace(/\s+/g, ' ')   // Normalize whitespace
    .trim();
}

/**
 * Extract content-aware enhancements based on keywords in prompt
 */
function extractContentEnhancements(prompt) {
  const lowerPrompt = prompt.toLowerCase();
  const enhancements = [];

  for (const [keyword, keywords] of Object.entries(CONTENT_KEYWORDS)) {
    if (lowerPrompt.includes(keyword)) {
      enhancements.push(...keywords.slice(0, 1));
    }
  }

  return enhancements;
}

/**
 * Generate image prompt from card content
 * Creates contextual prompts based on card type and content
 *
 * @param {Object} card - Card object
 * @returns {string} - Generated prompt
 */
export function generateImagePromptFromCard(card) {
  const { type, layout, content } = card;

  // If card has explicit image prompt, use it
  if (content.imagePrompt) {
    return content.imagePrompt;
  }

  // Generate prompt based on card type and content
  switch (type) {
    case 'title':
    case 'hero':
      return generateHeroPrompt(content);

    case 'objectives':
    case 'numbered-list':
      return generateObjectivesPrompt(content);

    case 'grid':
      return generateGridPrompt(content);

    case 'content-bullets':
      return generateContentPrompt(content);

    default:
      return generateGenericPrompt(content);
  }
}

function generateHeroPrompt(content) {
  const title = content.title || content.kicker || 'presentation';
  return `Abstract hero image for ${title}`;
}

function generateObjectivesPrompt(content) {
  const intro = content.intro || 'objectives';
  return `Minimalist background representing ${intro}`;
}

function generateGridPrompt(content) {
  const title = content.title || 'information';
  return `Clean grid pattern background for ${title}`;
}

function generateContentPrompt(content) {
  const title = content.title || 'content';
  return `Professional background for ${title}`;
}

function generateGenericPrompt(content) {
  const title = content.title || content.heading || 'presentation slide';
  return `Professional presentation background for ${title}`;
}

/**
 * Sanitize prompt for security
 * Removes potentially harmful or inappropriate content
 *
 * @param {string} prompt - Prompt to sanitize
 * @returns {string} - Sanitized prompt
 */
export function sanitizePrompt(prompt) {
  if (!prompt || typeof prompt !== 'string') {
    return '';
  }

  // Limit length
  let sanitized = prompt.slice(0, 500);

  // Remove special characters that could cause issues
  sanitized = sanitized.replace(/[<>{}]/g, '');

  // Remove excessive punctuation
  sanitized = sanitized.replace(/([!?.]){3,}/g, '$1$1');

  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();

  return sanitized;
}

/**
 * Validate prompt
 *
 * @param {string} prompt - Prompt to validate
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export function validatePrompt(prompt) {
  const errors = [];

  if (!prompt || typeof prompt !== 'string') {
    errors.push('Prompt is required and must be a string');
  }

  if (prompt && prompt.length < 3) {
    errors.push('Prompt must be at least 3 characters');
  }

  if (prompt && prompt.length > 500) {
    errors.push('Prompt must be 500 characters or less');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export default {
  enhancePrompt,
  generateImagePromptFromCard,
  sanitizePrompt,
  validatePrompt
};
