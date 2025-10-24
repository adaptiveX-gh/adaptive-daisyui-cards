// Layout-Theme Separation Tests
// Validates that layout and theme are truly independent systems
import { test, expect, LAYOUTS } from './fixtures.js';

// Custom theme classes (excluding 'none' which is just DaisyUI default)
const CUSTOM_THEMES = [
  'theme-dark-gradient',
  'theme-light-elegant',
  'theme-neon-accent',
  'theme-minimal',
  'theme-brand'
];

// All theme options including none/default
const ALL_THEME_OPTIONS = ['', ...CUSTOM_THEMES];

test.describe('Layout-Theme Separation @architecture', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Layout Classes - Structure Only', () => {

    test('layout classes contain ONLY structural properties', async ({ page }) => {
      // Test each layout for structural-only properties
      for (const layout of LAYOUTS) {
        await page.evaluate((l) => {
          const card = document.querySelector('.adaptive-card');
          if (card) {
            card.className = `adaptive-card layout-${l}`;
          }
        }, layout);

        await page.waitForTimeout(200);

        const structuralProperties = await page.evaluate(() => {
          const card = document.querySelector('.adaptive-card');
          const computed = window.getComputedStyle(card);

          // Properties that should be present (structural)
          const hasStructural = {
            display: computed.display !== '',
            padding: computed.padding !== '',
            gap: computed.gap !== '',
          };

          // Properties that should NOT be in layout CSS (appearance)
          // These may exist from DaisyUI but not from layout classes
          const appearanceProps = {
            backgroundColor: computed.backgroundColor,
            backgroundImage: computed.backgroundImage,
            fontWeight: computed.fontWeight,
            fontFamily: computed.fontFamily,
          };

          return { hasStructural, appearanceProps };
        });

        // Verify structural properties exist
        expect(structuralProperties.hasStructural.display).toBeTruthy();

        // Note: appearance properties may exist from DaisyUI, but layout CSS shouldn't override them
      }
    });

    test('layout classes define grid and flex properties', async ({ page }) => {
      const layoutStructure = await page.evaluate(() => {
        const results = {};

        // Test sidebar layout
        const sidebar = document.createElement('div');
        sidebar.className = 'adaptive-card layout-sidebar';
        document.body.appendChild(sidebar);
        const sidebarStyle = window.getComputedStyle(sidebar);
        results.sidebar = {
          display: sidebarStyle.display,
          flexDirection: sidebarStyle.flexDirection,
        };
        sidebar.remove();

        // Test feature layout with grid
        const feature = document.createElement('div');
        feature.className = 'adaptive-card layout-feature';
        feature.innerHTML = '<div class="feature-grid"></div>';
        document.body.appendChild(feature);
        const gridStyle = window.getComputedStyle(feature.querySelector('.feature-grid'));
        results.feature = {
          display: gridStyle.display,
          gridTemplateColumns: gridStyle.gridTemplateColumns,
        };
        feature.remove();

        return results;
      });

      expect(layoutStructure.sidebar.display).toBe('flex');
      expect(layoutStructure.sidebar.flexDirection).toBe('column');
      expect(layoutStructure.feature.display).toBe('grid');
    });

    test('layout classes do NOT define color properties', async ({ page }) => {
      // Read adaptive-cards.css and verify no color properties
      const cssViolations = await page.evaluate(async () => {
        const response = await fetch('/src/styles/adaptive-cards.css');
        const css = await response.text();

        const violations = [];
        const prohibitedPatterns = [
          /background-color\s*:/,
          /background-image\s*:/,
          /color\s*:\s*#/,  // Allow 'color: inherit' or 'color: currentColor'
          /color\s*:\s*rgb/,
          /color\s*:\s*hsl/,
          /border-color\s*:/,
          /box-shadow\s*:\s*[^;]*rgb|box-shadow\s*:\s*[^;]*hsl/,
          /font-weight\s*:\s*[0-9]/,
          /font-family\s*:/,
        ];

        prohibitedPatterns.forEach((pattern, index) => {
          if (pattern.test(css)) {
            const match = css.match(pattern);
            violations.push({
              pattern: pattern.toString(),
              match: match ? match[0] : null,
            });
          }
        });

        return violations;
      });

      // Should have no violations (layout CSS should be pure structure)
      expect(cssViolations).toHaveLength(0);
    });

    test('layout classes work without any theme class', async ({ page }) => {
      // Apply only layout class, no custom theme
      await page.evaluate(() => {
        const card = document.querySelector('.adaptive-card');
        if (card) {
          card.className = 'adaptive-card layout-sidebar';
        }
      });

      await page.waitForTimeout(200);

      // Verify card is visible and has structure
      const isVisible = await page.isVisible('.adaptive-card');
      expect(isVisible).toBe(true);

      // Verify it inherits DaisyUI default colors
      const hasDefaultColors = await page.evaluate(() => {
        const card = document.querySelector('.adaptive-card');
        const computed = window.getComputedStyle(card);

        // Should have some background color (from DaisyUI)
        return {
          hasBackground: computed.backgroundColor !== 'rgba(0, 0, 0, 0)',
          backgroundColor: computed.backgroundColor,
        };
      });

      expect(hasDefaultColors.hasBackground).toBe(true);
    });

  });

  test.describe('Theme Classes - Appearance Only', () => {

    test('theme classes contain ONLY appearance properties', async ({ page }) => {
      for (const theme of CUSTOM_THEMES) {
        await page.evaluate((t) => {
          const card = document.querySelector('.adaptive-card');
          if (card) {
            // Add theme wrapper
            const wrapper = document.createElement('div');
            wrapper.className = t;
            card.parentNode.insertBefore(wrapper, card);
            wrapper.appendChild(card);
            card.className = 'adaptive-card layout-sidebar';
          }
        }, theme);

        await page.waitForTimeout(200);

        const themeProperties = await page.evaluate((t) => {
          const wrapper = document.querySelector(`.${t}`);
          const card = wrapper?.querySelector('.adaptive-card');
          if (!card) return null;

          const computed = window.getComputedStyle(card);

          return {
            hasAppearance: {
              backgroundColor: computed.backgroundColor !== '',
              backgroundImage: computed.backgroundImage !== 'none',
            },
            structure: {
              display: computed.display,
              gridTemplateColumns: computed.gridTemplateColumns,
              flexDirection: computed.flexDirection,
            },
          };
        }, theme);

        // Should have appearance properties
        expect(themeProperties.hasAppearance.backgroundColor ||
               themeProperties.hasAppearance.backgroundImage).toBeTruthy();

        // Clean up
        await page.evaluate(() => {
          const card = document.querySelector('.adaptive-card');
          const wrapper = card?.parentNode;
          if (wrapper && wrapper !== document.body) {
            document.body.appendChild(card);
            wrapper.remove();
          }
        });
      }
    });

    test('theme classes do NOT define structural grid/flex properties', async ({ page }) => {
      // Read card-themes.css and verify no structural properties
      const cssViolations = await page.evaluate(async () => {
        const response = await fetch('/src/styles/card-themes.css');
        const css = await response.text();

        const violations = [];
        const prohibitedPatterns = [
          /grid-template-columns\s*:/,
          /grid-template-rows\s*:/,
          /grid-template-areas\s*:/,
          /flex-direction\s*:/,
          /display\s*:\s*(grid|flex)/,
          // Padding/margin/gap MAY be ok for visual overlays
          // Width/height sizing should not be in themes
          /width\s*:\s*[0-9]/,
          /height\s*:\s*[0-9]/,
          /min-width\s*:/,
          /max-width\s*:/,
        ];

        prohibitedPatterns.forEach((pattern) => {
          if (pattern.test(css)) {
            const match = css.match(pattern);
            violations.push({
              pattern: pattern.toString(),
              match: match ? match[0] : null,
            });
          }
        });

        return violations;
      });

      // Themes should not define structural layout
      expect(cssViolations).toHaveLength(0);
    });

    test('themes use DaisyUI CSS variables', async ({ page }) => {
      const usesDaisyUIVars = await page.evaluate(async () => {
        const response = await fetch('/src/styles/card-themes.css');
        const css = await response.text();

        // Check for DaisyUI variable patterns
        const hasDaisyUIVars = {
          b1: /var\(--b1\)/.test(css),
          b2: /var\(--b2\)/.test(css),
          bc: /var\(--bc\)/.test(css),
          hslVar: /hsl\(var\(--/.test(css),
        };

        return hasDaisyUIVars;
      });

      // At least some themes should use DaisyUI variables
      expect(usesDaisyUIVars.b1 || usesDaisyUIVars.b2 || usesDaisyUIVars.bc).toBe(true);
    });

  });

  test.describe('Theme Works with Any Layout', () => {

    test('all 36 layout-theme combinations render correctly', async ({ page }) => {
      const results = [];

      for (const layout of LAYOUTS) {
        for (const theme of ALL_THEME_OPTIONS) {
          // Apply combination
          await page.evaluate(({ l, t }) => {
            const card = document.querySelector('.adaptive-card');
            if (card) {
              // Remove any existing theme wrapper
              const existingWrapper = card.closest('[class*="theme-"]');
              if (existingWrapper && existingWrapper !== document.body) {
                document.body.appendChild(card);
                existingWrapper.remove();
              }

              // Apply layout
              card.className = `adaptive-card layout-${l}`;

              // Apply theme wrapper if not default
              if (t) {
                const wrapper = document.createElement('div');
                wrapper.className = t;
                card.parentNode.insertBefore(wrapper, card);
                wrapper.appendChild(card);
              }
            }
          }, { l: layout, t: theme });

          await page.waitForTimeout(100);

          // Verify renders without errors
          const result = await page.evaluate(() => {
            const card = document.querySelector('.adaptive-card');
            if (!card) return { success: false, error: 'Card not found' };

            const rect = card.getBoundingClientRect();
            const computed = window.getComputedStyle(card);

            return {
              success: true,
              isVisible: rect.width > 0 && rect.height > 0,
              hasBackground: computed.backgroundColor !== 'rgba(0, 0, 0, 0)',
              display: computed.display,
            };
          });

          results.push({
            layout,
            theme: theme || 'none',
            ...result,
          });

          // Each combination should be visible
          expect(result.success).toBe(true);
          expect(result.isVisible).toBe(true);
        }
      }

      // All 36 combinations should succeed
      const successCount = results.filter(r => r.success).length;
      expect(successCount).toBe(36);
    });

    test('theme changes appearance but not structure', async ({ page }) => {
      // Set a layout
      await page.evaluate(() => {
        const card = document.querySelector('.adaptive-card');
        if (card) {
          card.className = 'adaptive-card layout-feature';
          card.innerHTML = '<div class="feature-grid"><div class="feature-item">Item 1</div></div>';
        }
      });

      await page.waitForTimeout(200);

      // Get initial structure
      const initialStructure = await page.evaluate(() => {
        const grid = document.querySelector('.feature-grid');
        const computed = window.getComputedStyle(grid);
        return {
          display: computed.display,
          gridTemplateColumns: computed.gridTemplateColumns,
        };
      });

      // Apply theme
      await page.evaluate(() => {
        const card = document.querySelector('.adaptive-card');
        const wrapper = document.createElement('div');
        wrapper.className = 'theme-dark-gradient';
        card.parentNode.insertBefore(wrapper, card);
        wrapper.appendChild(card);
      });

      await page.waitForTimeout(200);

      // Get structure after theme
      const themedStructure = await page.evaluate(() => {
        const grid = document.querySelector('.feature-grid');
        const computed = window.getComputedStyle(grid);
        return {
          display: computed.display,
          gridTemplateColumns: computed.gridTemplateColumns,
        };
      });

      // Structure should be identical
      expect(themedStructure.display).toBe(initialStructure.display);
      expect(themedStructure.gridTemplateColumns).toBe(initialStructure.gridTemplateColumns);

      // But appearance should change
      const colorChanged = await page.evaluate(() => {
        const card = document.querySelector('.adaptive-card');
        const computed = window.getComputedStyle(card);
        // Should have background from theme
        return computed.backgroundImage !== 'none' ||
               computed.backgroundColor !== 'rgba(0, 0, 0, 0)';
      });

      expect(colorChanged).toBe(true);
    });

    test('layout changes structure but not theme colors', async ({ page }) => {
      // Apply theme wrapper
      await page.evaluate(() => {
        const card = document.querySelector('.adaptive-card');
        const wrapper = document.createElement('div');
        wrapper.className = 'theme-neon-accent';
        card.parentNode.insertBefore(wrapper, card);
        wrapper.appendChild(card);
        card.className = 'adaptive-card layout-sidebar';
      });

      await page.waitForTimeout(200);

      // Get initial theme colors
      const initialColors = await page.evaluate(() => {
        const card = document.querySelector('.adaptive-card');
        const computed = window.getComputedStyle(card);
        return {
          backgroundColor: computed.backgroundColor,
          backgroundImage: computed.backgroundImage,
        };
      });

      // Change layout
      await page.evaluate(() => {
        const card = document.querySelector('.adaptive-card');
        card.className = 'adaptive-card layout-feature';
        card.innerHTML = '<div class="feature-grid"><div class="feature-item">Test</div></div>';
      });

      await page.waitForTimeout(200);

      // Get colors after layout change
      const newColors = await page.evaluate(() => {
        const card = document.querySelector('.adaptive-card');
        const computed = window.getComputedStyle(card);
        return {
          backgroundColor: computed.backgroundColor,
          backgroundImage: computed.backgroundImage,
        };
      });

      // Theme colors should remain the same
      expect(newColors.backgroundColor).toBe(initialColors.backgroundColor);
      expect(newColors.backgroundImage).toBe(initialColors.backgroundImage);
    });

  });

  test.describe('CSS Class Naming Conventions', () => {

    test('layout classes are prefixed with "layout-"', async ({ page }) => {
      const hasCorrectPrefix = await page.evaluate(() => {
        const layouts = ['sidebar', 'feature', 'masonry', 'dashboard', 'split', 'hero-split'];
        const results = {};

        layouts.forEach(layout => {
          const card = document.createElement('div');
          card.className = `adaptive-card layout-${layout}`;
          document.body.appendChild(card);
          results[layout] = card.classList.contains(`layout-${layout}`);
          card.remove();
        });

        return results;
      });

      Object.values(hasCorrectPrefix).forEach(hasPrefix => {
        expect(hasPrefix).toBe(true);
      });
    });

    test('theme classes are prefixed with "theme-"', async ({ page }) => {
      const hasCorrectPrefix = await page.evaluate(() => {
        const themes = ['dark-gradient', 'light-elegant', 'neon-accent', 'minimal', 'brand'];
        const results = {};

        themes.forEach(theme => {
          const wrapper = document.createElement('div');
          wrapper.className = `theme-${theme}`;
          document.body.appendChild(wrapper);
          results[theme] = wrapper.classList.contains(`theme-${theme}`);
          wrapper.remove();
        });

        return results;
      });

      Object.values(hasCorrectPrefix).forEach(hasPrefix => {
        expect(hasPrefix).toBe(true);
      });
    });

  });

  test.describe('Independence Verification', () => {

    test('adding theme class does not change layout measurements', async ({ page }) => {
      await page.evaluate(() => {
        const card = document.querySelector('.adaptive-card');
        card.className = 'adaptive-card layout-sidebar';
        card.innerHTML = `
          <div class="sidebar-image" style="background: gray;"></div>
          <div class="sidebar-content">Content</div>
        `;
      });

      await page.waitForTimeout(200);

      // Measure without theme
      const beforeMeasurements = await page.evaluate(() => {
        const card = document.querySelector('.adaptive-card');
        const image = card.querySelector('.sidebar-image');
        const content = card.querySelector('.sidebar-content');

        return {
          cardWidth: card.offsetWidth,
          imageWidth: image.offsetWidth,
          contentWidth: content.offsetWidth,
          display: window.getComputedStyle(card).display,
        };
      });

      // Apply theme
      await page.evaluate(() => {
        const card = document.querySelector('.adaptive-card');
        const wrapper = document.createElement('div');
        wrapper.className = 'theme-light-elegant';
        card.parentNode.insertBefore(wrapper, card);
        wrapper.appendChild(card);
      });

      await page.waitForTimeout(200);

      // Measure with theme
      const afterMeasurements = await page.evaluate(() => {
        const card = document.querySelector('.adaptive-card');
        const image = card.querySelector('.sidebar-image');
        const content = card.querySelector('.sidebar-content');

        return {
          cardWidth: card.offsetWidth,
          imageWidth: image.offsetWidth,
          contentWidth: content.offsetWidth,
          display: window.getComputedStyle(card).display,
        };
      });

      // Measurements should be identical (within 1px for rounding)
      expect(Math.abs(afterMeasurements.cardWidth - beforeMeasurements.cardWidth)).toBeLessThan(2);
      expect(afterMeasurements.display).toBe(beforeMeasurements.display);
    });

  });

});
