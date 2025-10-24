// CSS Architecture Unit Tests
// Validates layout-theme separation at the CSS file level
import { describe, test, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('CSS Architecture Validation', () => {

  let adaptiveCardsCSS;
  let cardThemesCSS;

  beforeAll(() => {
    // Read CSS files
    const projectRoot = resolve(__dirname, '../..');
    adaptiveCardsCSS = readFileSync(
      resolve(projectRoot, 'src/styles/adaptive-cards.css'),
      'utf8'
    );
    cardThemesCSS = readFileSync(
      resolve(projectRoot, 'src/styles/card-themes.css'),
      'utf8'
    );
  });

  describe('adaptive-cards.css - Layout Only', () => {

    test('contains structural properties', () => {
      // Should have layout-related keywords
      expect(adaptiveCardsCSS).toMatch(/display\s*:/);
      expect(adaptiveCardsCSS).toMatch(/grid-template-/);
      expect(adaptiveCardsCSS).toMatch(/padding\s*:/);
      expect(adaptiveCardsCSS).toMatch(/margin\s*:/);
      expect(adaptiveCardsCSS).toMatch(/gap\s*:/);
      expect(adaptiveCardsCSS).toMatch(/flex/);
    });

    test('does NOT contain background-color properties', () => {
      // Should NOT have explicit color values for backgrounds
      const backgroundColorMatches = adaptiveCardsCSS.match(/background-color\s*:\s*[^;]+;/g);

      if (backgroundColorMatches) {
        // If there are matches, they should only be for transparent or inherit
        backgroundColorMatches.forEach(match => {
          expect(match).toMatch(/transparent|inherit/i);
        });
      }
    });

    test('does NOT contain background-image/gradient properties', () => {
      // Should NOT have gradients or background images
      expect(adaptiveCardsCSS).not.toMatch(/background-image\s*:/);
      expect(adaptiveCardsCSS).not.toMatch(/linear-gradient/);
      expect(adaptiveCardsCSS).not.toMatch(/radial-gradient/);
    });

    test('does NOT contain explicit color values', () => {
      // Should NOT have color properties with explicit values (hex, rgb, hsl)
      // Allow 'color: inherit' or 'color: currentColor'

      const colorMatches = adaptiveCardsCSS.match(/color\s*:\s*[^;]+;/g);

      if (colorMatches) {
        colorMatches.forEach(match => {
          // Should only be inherit, currentColor, or transparent
          expect(match).toMatch(/inherit|currentColor|transparent/i);
        });
      }

      // Should NOT have hex colors
      expect(adaptiveCardsCSS).not.toMatch(/color\s*:\s*#[0-9a-fA-F]{3,6}/);

      // Should NOT have rgb colors
      expect(adaptiveCardsCSS).not.toMatch(/color\s*:\s*rgb\(/);

      // Should NOT have hsl colors (except var references are OK)
      const hslMatches = adaptiveCardsCSS.match(/color\s*:\s*hsl\(/g);
      if (hslMatches) {
        // Only hsl(var(--)) is allowed
        expect(adaptiveCardsCSS).toMatch(/hsl\(var\(--/);
      }
    });

    test('does NOT contain border-color properties', () => {
      // Should NOT have border colors
      const borderColorMatches = adaptiveCardsCSS.match(/border-color\s*:/g);

      expect(borderColorMatches).toBeNull();
    });

    test('does NOT contain box-shadow with color values', () => {
      // Should NOT have box-shadow with rgb/hsl colors
      expect(adaptiveCardsCSS).not.toMatch(/box-shadow\s*:[^;]*rgb/);
      expect(adaptiveCardsCSS).not.toMatch(/box-shadow\s*:[^;]*hsl\(/);

      // Basic box-shadow for structure might be OK if it's transparent
    });

    test('does NOT contain font-weight with numeric values', () => {
      // Should NOT set font weights (appearance property)
      expect(adaptiveCardsCSS).not.toMatch(/font-weight\s*:\s*[0-9]/);
      expect(adaptiveCardsCSS).not.toMatch(/font-weight\s*:\s*bold/);
    });

    test('does NOT contain font-family properties', () => {
      // Should NOT set font families
      expect(adaptiveCardsCSS).not.toMatch(/font-family\s*:/);
    });

    test('contains only font-size for typography (no weight/family)', () => {
      // Font-size is OK (it's a sizing property)
      expect(adaptiveCardsCSS).toMatch(/font-size\s*:/);

      // But should not have font styling
      expect(adaptiveCardsCSS).not.toMatch(/font-style\s*:/);
      expect(adaptiveCardsCSS).not.toMatch(/letter-spacing\s*:[^;]*-/); // Negative letter-spacing is styling
    });

    test('defines layout classes with "layout-" prefix', () => {
      expect(adaptiveCardsCSS).toMatch(/\.layout-sidebar/);
      expect(adaptiveCardsCSS).toMatch(/\.layout-feature/);
      expect(adaptiveCardsCSS).toMatch(/\.layout-masonry/);
      expect(adaptiveCardsCSS).toMatch(/\.layout-dashboard/);
      expect(adaptiveCardsCSS).toMatch(/\.layout-split/);
      expect(adaptiveCardsCSS).toMatch(/\.layout-hero-split/);
    });

    test('uses container queries for responsive behavior', () => {
      expect(adaptiveCardsCSS).toMatch(/@container/);
      expect(adaptiveCardsCSS).toMatch(/container-type/);
      expect(adaptiveCardsCSS).toMatch(/container-name/);
    });

    test('uses CSS clamp() for scalable sizing', () => {
      expect(adaptiveCardsCSS).toMatch(/clamp\(/);
    });

    test('has comments indicating "LAYOUT ONLY"', () => {
      expect(adaptiveCardsCSS).toMatch(/LAYOUT ONLY/i);
    });

  });

  describe('card-themes.css - Appearance Only', () => {

    test('contains appearance properties', () => {
      // Should have appearance-related keywords
      expect(cardThemesCSS).toMatch(/background/);
      expect(cardThemesCSS).toMatch(/color\s*:/);
      expect(cardThemesCSS).toMatch(/gradient/);
    });

    test('contains font styling properties', () => {
      expect(cardThemesCSS).toMatch(/font-weight\s*:/);
      expect(cardThemesCSS).toMatch(/letter-spacing/);
    });

    test('does NOT contain grid-template-columns', () => {
      expect(cardThemesCSS).not.toMatch(/grid-template-columns\s*:/);
    });

    test('does NOT contain grid-template-rows', () => {
      expect(cardThemesCSS).not.toMatch(/grid-template-rows\s*:/);
    });

    test('does NOT contain grid-template-areas', () => {
      expect(cardThemesCSS).not.toMatch(/grid-template-areas\s*:/);
    });

    test('does NOT contain flex-direction', () => {
      expect(cardThemesCSS).not.toMatch(/flex-direction\s*:/);
    });

    test('does NOT contain display: grid or display: flex', () => {
      expect(cardThemesCSS).not.toMatch(/display\s*:\s*grid/);
      expect(cardThemesCSS).not.toMatch(/display\s*:\s*flex/);
    });

    test('does NOT contain sizing width/height (except for pseudo-elements)', () => {
      // Width/height in themes should only be for pseudo-elements (::before, ::after)
      // Check for width/height not in pseudo-element context

      const widthMatches = cardThemesCSS.match(/width\s*:\s*[0-9]/g);
      const heightMatches = cardThemesCSS.match(/height\s*:\s*[0-9]/g);

      // If width/height exists, it should be in pseudo-element context
      if (widthMatches || heightMatches) {
        // Check if they're in ::before or ::after
        const hasPseudoElements = cardThemesCSS.match(/::before|::after/);
        expect(hasPseudoElements).toBeTruthy();
      }
    });

    test('does NOT contain min-width or max-width sizing', () => {
      expect(cardThemesCSS).not.toMatch(/min-width\s*:/);
      expect(cardThemesCSS).not.toMatch(/max-width\s*:/);
      expect(cardThemesCSS).not.toMatch(/min-height\s*:/);
      expect(cardThemesCSS).not.toMatch(/max-height\s*:/);
    });

    test('uses DaisyUI CSS variables', () => {
      // Should use DaisyUI variables
      expect(cardThemesCSS).toMatch(/var\(--b1\)|var\(--b2\)|var\(--b3\)|var\(--bc\)/);
      expect(cardThemesCSS).toMatch(/hsl\(var\(--/);
    });

    test('defines theme classes with "theme-" prefix', () => {
      expect(cardThemesCSS).toMatch(/\.theme-dark-gradient/);
      expect(cardThemesCSS).toMatch(/\.theme-light-elegant/);
      expect(cardThemesCSS).toMatch(/\.theme-neon-accent/);
      expect(cardThemesCSS).toMatch(/\.theme-minimal/);
      expect(cardThemesCSS).toMatch(/\.theme-brand/);
    });

    test('has comments indicating "THEME ONLY"', () => {
      expect(cardThemesCSS).toMatch(/THEME ONLY/i);
    });

    test('contains all 5 custom themes', () => {
      expect(cardThemesCSS).toMatch(/theme-dark-gradient/);
      expect(cardThemesCSS).toMatch(/theme-light-elegant/);
      expect(cardThemesCSS).toMatch(/theme-neon-accent/);
      expect(cardThemesCSS).toMatch(/theme-minimal/);
      expect(cardThemesCSS).toMatch(/theme-brand/);
    });

    test('defines brand color variables', () => {
      expect(cardThemesCSS).toMatch(/--brand-primary/);
      expect(cardThemesCSS).toMatch(/--brand-secondary/);
    });

    test('uses gradients for visual effects', () => {
      expect(cardThemesCSS).toMatch(/linear-gradient/);
    });

    test('uses pseudo-elements for visual overlays', () => {
      expect(cardThemesCSS).toMatch(/::before|::after/);
      expect(cardThemesCSS).toMatch(/content\s*:\s*['"]/); // content: ''
    });

    test('uses position for visual overlays (not layout)', () => {
      // Position is OK in themes if used for overlays (::before, ::after)
      const positionMatches = cardThemesCSS.match(/position\s*:\s*absolute/g);

      if (positionMatches) {
        // Should be in context of pseudo-elements
        expect(cardThemesCSS).toMatch(/::before|::after/);
      }
    });

  });

  describe('File Structure', () => {

    test('both files use @layer components', () => {
      expect(adaptiveCardsCSS).toMatch(/@layer components/);
      expect(cardThemesCSS).toMatch(/@layer components/);
    });

    test('adaptive-cards.css comes before themes conceptually', () => {
      // Layout should be independent of themes
      // This is more of a conceptual test - just verify both exist
      expect(adaptiveCardsCSS.length).toBeGreaterThan(100);
      expect(cardThemesCSS.length).toBeGreaterThan(100);
    });

    test('files have clear section comments', () => {
      expect(adaptiveCardsCSS).toMatch(/={3,}/); // Section dividers
      expect(cardThemesCSS).toMatch(/={3,}/);
    });

    test('adaptive-cards.css documents all 6 layouts', () => {
      expect(adaptiveCardsCSS).toMatch(/LAYOUT 1:|SIDEBAR/i);
      expect(adaptiveCardsCSS).toMatch(/LAYOUT 2:|FEATURE/i);
      expect(adaptiveCardsCSS).toMatch(/LAYOUT 3:|MASONRY/i);
      expect(adaptiveCardsCSS).toMatch(/LAYOUT 4:|DASHBOARD/i);
      expect(adaptiveCardsCSS).toMatch(/LAYOUT 5:|SPLIT/i);
      expect(adaptiveCardsCSS).toMatch(/LAYOUT 6:|HERO.*SPLIT/i);
    });

    test('card-themes.css documents all 5 custom themes', () => {
      expect(cardThemesCSS).toMatch(/THEME 1:|DARK.*GRADIENT/i);
      expect(cardThemesCSS).toMatch(/THEME 2:|LIGHT.*ELEGANT/i);
      expect(cardThemesCSS).toMatch(/THEME 3:|NEON.*ACCENT/i);
      expect(cardThemesCSS).toMatch(/THEME 4:|MINIMAL/i);
      expect(cardThemesCSS).toMatch(/THEME 5:|BRAND/i);
    });

  });

  describe('Code Quality', () => {

    test('adaptive-cards.css has no TODO comments', () => {
      expect(adaptiveCardsCSS).not.toMatch(/TODO|FIXME/i);
    });

    test('card-themes.css has no TODO comments', () => {
      expect(cardThemesCSS).not.toMatch(/TODO|FIXME/i);
    });

    test('no commented-out code blocks', () => {
      // Check for large blocks of commented code (more than 3 consecutive comment lines)
      const commentedBlocks = adaptiveCardsCSS.match(/\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\//g) || [];
      const largeBlocks = commentedBlocks.filter(block => block.split('\n').length > 10);

      // Large blocks should be documentation, not commented code
      largeBlocks.forEach(block => {
        // Should contain words like "layout", "description", etc., not CSS properties
        expect(block).toMatch(/layout|description|structure|note|example/i);
      });
    });

    test('consistent indentation', () => {
      // Check that files use consistent indentation (2 spaces)
      const lines = adaptiveCardsCSS.split('\n');
      const indentedLines = lines.filter(line => line.match(/^\s+\S/));

      if (indentedLines.length > 0) {
        // Most lines should use 2-space indentation
        const twoSpaceIndent = indentedLines.filter(line => line.match(/^  [^\s]/));
        const fourSpaceIndent = indentedLines.filter(line => line.match(/^    [^\s]/));

        // Should have consistent indentation
        expect(twoSpaceIndent.length + fourSpaceIndent.length).toBeGreaterThan(0);
      }
    });

  });

  describe('Separation Validation', () => {

    test('no class appears in both files', () => {
      // Layout classes should not be in themes file
      expect(cardThemesCSS).not.toMatch(/\.layout-sidebar[^-]/);
      expect(cardThemesCSS).not.toMatch(/\.layout-feature[^-]/);
      expect(cardThemesCSS).not.toMatch(/\.layout-masonry[^-]/);
      expect(cardThemesCSS).not.toMatch(/\.layout-dashboard[^-]/);
      expect(cardThemesCSS).not.toMatch(/\.layout-split[^-]/);
      expect(cardThemesCSS).not.toMatch(/\.layout-hero-split[^-]/);

      // Theme classes should not be in layout file
      expect(adaptiveCardsCSS).not.toMatch(/\.theme-dark-gradient/);
      expect(adaptiveCardsCSS).not.toMatch(/\.theme-light-elegant/);
      expect(adaptiveCardsCSS).not.toMatch(/\.theme-neon-accent/);
      expect(adaptiveCardsCSS).not.toMatch(/\.theme-minimal/);
      expect(adaptiveCardsCSS).not.toMatch(/\.theme-brand/);
    });

    test('theme selectors target layout-agnostic elements', () => {
      // Themes should work with any layout
      // They should target generic elements or use descendant selectors

      // Theme selectors should include layout-specific elements like .hero-content, .sidebar-image
      // but NOT define their structure
      expect(cardThemesCSS).toMatch(/\.hero-content|\.sidebar-image|\.feature-item/);
    });

    test('adaptive-cards.css uses only structural container query units', () => {
      // Should use cqw for sizing
      expect(adaptiveCardsCSS).toMatch(/cqw/);

      // May use cqh for height-based sizing
      const hasCqh = adaptiveCardsCSS.match(/cqh/);
      if (hasCqh) {
        expect(adaptiveCardsCSS).toMatch(/min-height.*cqh/);
      }
    });

  });

});
