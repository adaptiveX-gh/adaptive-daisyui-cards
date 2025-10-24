/**
 * PlaceholderService - Generate deterministic geometric and pattern placeholders
 * Provides instant fallback images while real images are being generated
 */

export class PlaceholderService {
  constructor() {
    this.patterns = ['geometric', 'pattern', 'solid'];
  }

  /**
   * Smart placeholder selection based on theme and context
   *
   * @param {Object} theme - Theme object with colors
   * @param {string} aspectRatio - Aspect ratio (e.g., '16:9')
   * @param {string} contentPrompt - Optional content hint for deterministic selection
   * @returns {Object} - Placeholder specification
   */
  selectPlaceholder(theme, aspectRatio = '16:9', contentPrompt = '') {
    // Hash the content prompt to deterministically select pattern type
    const hash = this.simpleHash(contentPrompt);
    const patternIndex = hash % 3;
    const type = this.patterns[patternIndex];

    return {
      type,
      color: 'based-on-theme',
      loadingState: true,
      aspectRatio,
      svg: this.generate(type, { theme, aspectRatio, contentPrompt })
    };
  }

  /**
   * Generate placeholder based on type
   *
   * @param {string} type - 'geometric', 'pattern', or 'solid'
   * @param {Object} options - Generation options
   * @returns {string} - SVG string
   */
  generate(type, options = {}) {
    switch (type) {
      case 'geometric':
        return this.generateGeometric(options);
      case 'pattern':
        return this.generatePattern(options);
      case 'solid':
        return this.generateSolid(options);
      default:
        return this.generateSolid(options);
    }
  }

  /**
   * Generate geometric placeholder with abstract shapes
   *
   * @param {Object} options
   * @returns {string} - SVG string
   */
  generateGeometric(options = {}) {
    const { theme = {}, aspectRatio = '16:9', contentPrompt = '' } = options;
    const [width, height] = this.parseAspectRatio(aspectRatio);
    const colors = this.getThemeColors(theme);
    const hash = this.simpleHash(contentPrompt);

    // Select geometric pattern based on hash
    const patterns = [
      this.generateTriangles,
      this.generateCircles,
      this.generatePolygons,
      this.generateDiagonalStripes
    ];
    const patternGenerator = patterns[hash % patterns.length];

    return patternGenerator.call(this, width, height, colors, hash);
  }

  /**
   * Generate repeating pattern placeholder
   *
   * @param {Object} options
   * @returns {string} - SVG string
   */
  generatePattern(options = {}) {
    const { theme = {}, aspectRatio = '16:9', contentPrompt = '' } = options;
    const [width, height] = this.parseAspectRatio(aspectRatio);
    const colors = this.getThemeColors(theme);
    const hash = this.simpleHash(contentPrompt);

    // Select pattern based on hash
    const patterns = [
      this.generateDots,
      this.generateLines,
      this.generateWaves,
      this.generateGrid
    ];
    const patternGenerator = patterns[hash % patterns.length];

    return patternGenerator.call(this, width, height, colors, hash);
  }

  /**
   * Generate solid gradient placeholder
   *
   * @param {Object} options
   * @returns {string} - SVG string
   */
  generateSolid(options = {}) {
    const { theme = {}, aspectRatio = '16:9' } = options;
    const [width, height] = this.parseAspectRatio(aspectRatio);
    const colors = this.getThemeColors(theme);

    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:0.8" />
            <stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:0.6" />
          </linearGradient>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#grad1)" />
      </svg>
    `.trim();
  }

  // Geometric Pattern Generators

  generateTriangles(width, height, colors, hash) {
    const numTriangles = 8 + (hash % 8);
    let triangles = '';

    for (let i = 0; i < numTriangles; i++) {
      const seed = hash + i;
      const x = (seed * 73) % width;
      const y = (seed * 151) % height;
      const size = 50 + (seed % 150);
      const color = colors.all[seed % colors.all.length];
      const opacity = 0.1 + ((seed % 40) / 100);

      triangles += `
        <polygon points="${x},${y} ${x + size},${y} ${x + size/2},${y - size}"
                 fill="${color}" opacity="${opacity}" />
      `;
    }

    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height}" fill="${colors.background}" />
        ${triangles}
      </svg>
    `.trim();
  }

  generateCircles(width, height, colors, hash) {
    const numCircles = 10 + (hash % 10);
    let circles = '';

    for (let i = 0; i < numCircles; i++) {
      const seed = hash + i;
      const cx = (seed * 67) % width;
      const cy = (seed * 139) % height;
      const r = 30 + (seed % 120);
      const color = colors.all[seed % colors.all.length];
      const opacity = 0.08 + ((seed % 30) / 100);

      circles += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" opacity="${opacity}" />`;
    }

    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height}" fill="${colors.background}" />
        ${circles}
      </svg>
    `.trim();
  }

  generatePolygons(width, height, colors, hash) {
    const numPolygons = 6 + (hash % 6);
    let polygons = '';

    for (let i = 0; i < numPolygons; i++) {
      const seed = hash + i;
      const points = this.generatePolygonPoints(width, height, seed);
      const color = colors.all[seed % colors.all.length];
      const opacity = 0.12 + ((seed % 35) / 100);

      polygons += `<polygon points="${points}" fill="${color}" opacity="${opacity}" />`;
    }

    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height}" fill="${colors.background}" />
        ${polygons}
      </svg>
    `.trim();
  }

  generateDiagonalStripes(width, height, colors, hash) {
    const stripeWidth = 20 + (hash % 40);
    let stripes = '';
    let offset = 0;

    for (let i = 0; i < Math.ceil((width + height) / stripeWidth) * 2; i++) {
      const color = colors.all[i % colors.all.length];
      const opacity = 0.1 + ((i % 30) / 100);

      stripes += `
        <line x1="${offset}" y1="0" x2="${offset - height}" y2="${height}"
              stroke="${color}" stroke-width="${stripeWidth}" opacity="${opacity}" />
      `;
      offset += stripeWidth * 2;
    }

    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height}" fill="${colors.background}" />
        ${stripes}
      </svg>
    `.trim();
  }

  // Pattern Generators

  generateDots(width, height, colors, hash) {
    const spacing = 30 + (hash % 30);
    const radius = 3 + (hash % 8);
    let dots = '';

    for (let x = spacing; x < width; x += spacing) {
      for (let y = spacing; y < height; y += spacing) {
        const seed = x + y + hash;
        const color = colors.all[seed % colors.all.length];
        const opacity = 0.15 + ((seed % 35) / 100);

        dots += `<circle cx="${x}" cy="${y}" r="${radius}" fill="${color}" opacity="${opacity}" />`;
      }
    }

    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height}" fill="${colors.background}" />
        ${dots}
      </svg>
    `.trim();
  }

  generateLines(width, height, colors, hash) {
    const spacing = 15 + (hash % 25);
    let lines = '';

    for (let i = 0; i < Math.ceil(height / spacing); i++) {
      const y = i * spacing;
      const color = colors.all[i % colors.all.length];
      const opacity = 0.12 + ((i % 30) / 100);

      lines += `<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="${color}" stroke-width="2" opacity="${opacity}" />`;
    }

    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height}" fill="${colors.background}" />
        ${lines}
      </svg>
    `.trim();
  }

  generateWaves(width, height, colors, hash) {
    const amplitude = 20 + (hash % 30);
    const frequency = 0.01 + ((hash % 20) / 1000);
    let waves = '';

    for (let i = 0; i < 5; i++) {
      const yOffset = (height / 6) * (i + 1);
      const color = colors.all[i % colors.all.length];
      const opacity = 0.15 + ((i % 30) / 100);

      let path = `M 0 ${yOffset}`;
      for (let x = 0; x <= width; x += 5) {
        const y = yOffset + Math.sin(x * frequency + i) * amplitude;
        path += ` L ${x} ${y}`;
      }

      waves += `<path d="${path}" stroke="${color}" stroke-width="3" fill="none" opacity="${opacity}" />`;
    }

    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height}" fill="${colors.background}" />
        ${waves}
      </svg>
    `.trim();
  }

  generateGrid(width, height, colors, hash) {
    const spacing = 40 + (hash % 40);
    let grid = '';

    // Vertical lines
    for (let x = spacing; x < width; x += spacing) {
      grid += `<line x1="${x}" y1="0" x2="${x}" y2="${height}" stroke="${colors.primary}" stroke-width="1" opacity="0.15" />`;
    }

    // Horizontal lines
    for (let y = spacing; y < height; y += spacing) {
      grid += `<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="${colors.primary}" stroke-width="1" opacity="0.15" />`;
    }

    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height}" fill="${colors.background}" />
        ${grid}
      </svg>
    `.trim();
  }

  // Helper Methods

  parseAspectRatio(ratio) {
    const ratioMap = {
      '16:9': [1600, 900],
      '9:16': [900, 1600],
      '4:3': [1200, 900],
      '3:4': [900, 1200],
      '1:1': [1000, 1000]
    };
    return ratioMap[ratio] || [1600, 900];
  }

  getThemeColors(theme) {
    const defaultColors = {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      accent: '#f59e0b',
      background: '#f3f4f6',
      text: '#1f2937'
    };

    const colors = theme.colors || defaultColors;

    return {
      primary: colors.primary || defaultColors.primary,
      secondary: colors.secondary || defaultColors.secondary,
      accent: colors.accent || defaultColors.accent,
      background: colors.background || defaultColors.background,
      text: colors.text || defaultColors.text,
      all: [
        colors.primary || defaultColors.primary,
        colors.secondary || defaultColors.secondary,
        colors.accent || defaultColors.accent
      ]
    };
  }

  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  generatePolygonPoints(width, height, seed) {
    const numPoints = 5 + (seed % 3); // 5-7 points
    const centerX = (seed * 83) % width;
    const centerY = (seed * 127) % height;
    const radius = 60 + (seed % 80);

    let points = [];
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * 2 * Math.PI;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      points.push(`${x},${y}`);
    }

    return points.join(' ');
  }
}

export default PlaceholderService;
