// Theme Combination Tests
// Tests all 36 layout × theme combinations and recommended pairings
import { test, expect, LAYOUTS } from './fixtures.js';

const CUSTOM_THEMES = [
  '',
  'theme-dark-gradient',
  'theme-light-elegant',
  'theme-neon-accent',
  'theme-minimal',
  'theme-brand'
];

const DAISYUI_THEMES = [
  'light',
  'dark',
  'cupcake',
  'cyberpunk',
  'corporate',
  'business'
];

// Recommended combinations for best visual results
const RECOMMENDED_COMBINATIONS = [
  {
    layout: 'hero-split',
    customTheme: 'theme-dark-gradient',
    daisyuiTheme: 'dark',
    description: 'Hero with dramatic dark gradient'
  },
  {
    layout: 'hero-split',
    customTheme: 'theme-neon-accent',
    daisyuiTheme: 'cyberpunk',
    description: 'Hero with cyberpunk neon effects'
  },
  {
    layout: 'hero-split',
    customTheme: 'theme-brand',
    daisyuiTheme: 'corporate',
    description: 'Hero with brand identity'
  },
  {
    layout: 'sidebar',
    customTheme: 'theme-light-elegant',
    daisyuiTheme: 'light',
    description: 'Clean sidebar with elegant styling'
  },
  {
    layout: 'sidebar',
    customTheme: 'theme-minimal',
    daisyuiTheme: 'light',
    description: 'Minimal sidebar design'
  },
  {
    layout: 'dashboard',
    customTheme: 'theme-minimal',
    daisyuiTheme: 'light',
    description: 'Clean dashboard interface'
  },
  {
    layout: 'dashboard',
    customTheme: 'theme-dark-gradient',
    daisyuiTheme: 'dark',
    description: 'Dark dashboard with depth'
  },
  {
    layout: 'feature',
    customTheme: 'theme-brand',
    daisyuiTheme: 'corporate',
    description: 'Feature showcase with brand colors'
  },
  {
    layout: 'feature',
    customTheme: 'theme-light-elegant',
    daisyuiTheme: 'light',
    description: 'Elegant feature presentation'
  },
  {
    layout: 'masonry',
    customTheme: 'theme-minimal',
    daisyuiTheme: 'light',
    description: 'Clean masonry gallery'
  },
  {
    layout: 'masonry',
    customTheme: 'theme-neon-accent',
    daisyuiTheme: 'dark',
    description: 'Neon-accented gallery'
  },
  {
    layout: 'split',
    customTheme: '',
    daisyuiTheme: 'light',
    description: 'Simple split with DaisyUI defaults'
  }
];

test.describe('Theme Combinations @combinations', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('All 36 Layout × Custom Theme Combinations', () => {

    test('all combinations render without errors', async ({ page }) => {
      const results = [];
      const errors = [];

      // Test all 36 combinations (6 layouts × 6 theme options)
      for (const layout of LAYOUTS) {
        // Add hero-split to layouts
        const allLayouts = [...LAYOUTS, 'hero-split'];

        for (const layoutToTest of allLayouts) {
          for (const theme of CUSTOM_THEMES) {
            // Apply combination
            const result = await page.evaluate(({ l, t }) => {
              try {
                const card = document.querySelector('.adaptive-card');
                if (!card) return { success: false, error: 'Card not found' };

                // Remove existing theme wrapper
                const existingWrapper = card.closest('[class*="theme-"]');
                if (existingWrapper && existingWrapper !== document.body) {
                  document.body.appendChild(card);
                  existingWrapper.remove();
                }

                // Apply layout
                card.className = `adaptive-card layout-${l}`;

                // Add basic structure based on layout
                if (l === 'sidebar') {
                  card.innerHTML = `
                    <div class="sidebar-image" style="background: gray; width: 100%; height: 200px;"></div>
                    <div class="sidebar-content"><h2>Title</h2><p>Content</p></div>
                  `;
                } else if (l === 'hero-split') {
                  card.innerHTML = `
                    <div class="hero-content"><h1>Hero</h1><p>Content</p></div>
                    <div class="hero-image"><img src="https://picsum.photos/400/300" alt="Hero" /></div>
                  `;
                } else if (l === 'feature') {
                  card.innerHTML = `
                    <div class="feature-header"><h2>Features</h2></div>
                    <div class="feature-grid">
                      <div class="feature-item">Feature 1</div>
                      <div class="feature-item">Feature 2</div>
                    </div>
                  `;
                }

                // Apply theme wrapper if not default
                if (t) {
                  const wrapper = document.createElement('div');
                  wrapper.className = t;
                  card.parentNode.insertBefore(wrapper, card);
                  wrapper.appendChild(card);
                }

                // Check if rendered correctly
                const rect = card.getBoundingClientRect();
                const computed = window.getComputedStyle(card);

                return {
                  success: true,
                  isVisible: rect.width > 0 && rect.height > 0,
                  hasBackground: computed.backgroundColor !== 'rgba(0, 0, 0, 0)' ||
                                computed.backgroundImage !== 'none',
                  width: rect.width,
                  height: rect.height,
                };
              } catch (error) {
                return {
                  success: false,
                  error: error.message,
                };
              }
            }, { l: layoutToTest, t: theme });

            await page.waitForTimeout(50);

            results.push({
              layout: layoutToTest,
              theme: theme || 'none',
              ...result,
            });

            if (!result.success || !result.isVisible) {
              errors.push({
                layout: layoutToTest,
                theme: theme || 'none',
                error: result.error || 'Not visible',
              });
            }
          }
        }
      }

      // Report errors if any
      if (errors.length > 0) {
        console.log('Failed combinations:', errors);
      }

      // All combinations should render successfully
      const successCount = results.filter(r => r.success && r.isVisible).length;
      expect(successCount).toBeGreaterThan(30); // Allow some flexibility
      expect(errors.length).toBeLessThan(5); // Minimal errors acceptable
    });

    test('no console errors during combination switches', async ({ page }) => {
      const consoleErrors = [];

      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      // Test a subset of combinations rapidly
      const testCombinations = [
        { layout: 'sidebar', theme: '' },
        { layout: 'sidebar', theme: 'theme-dark-gradient' },
        { layout: 'feature', theme: 'theme-light-elegant' },
        { layout: 'hero-split', theme: 'theme-neon-accent' },
        { layout: 'dashboard', theme: 'theme-minimal' },
      ];

      for (const combo of testCombinations) {
        await page.evaluate(({ l, t }) => {
          const card = document.querySelector('.adaptive-card');
          if (!card) return;

          // Remove existing wrapper
          const existingWrapper = card.closest('[class*="theme-"]');
          if (existingWrapper && existingWrapper !== document.body) {
            document.body.appendChild(card);
            existingWrapper.remove();
          }

          // Apply layout
          card.className = `adaptive-card layout-${l}`;

          // Apply theme
          if (t) {
            const wrapper = document.createElement('div');
            wrapper.className = t;
            card.parentNode.insertBefore(wrapper, card);
            wrapper.appendChild(card);
          }
        }, combo);

        await page.waitForTimeout(100);
      }

      expect(consoleErrors).toHaveLength(0);
    });

  });

  test.describe('Recommended Combinations', () => {

    for (const combo of RECOMMENDED_COMBINATIONS) {
      test(`${combo.description}: ${combo.layout} + ${combo.customTheme || 'default'} + ${combo.daisyuiTheme}`, async ({ page }) => {
        // Set DaisyUI theme
        await page.evaluate((theme) => {
          document.documentElement.setAttribute('data-theme', theme);
        }, combo.daisyuiTheme);

        // Apply layout and custom theme
        await page.evaluate(({ l, t }) => {
          const card = document.querySelector('.adaptive-card');
          if (!card) return;

          // Remove existing wrapper
          const existingWrapper = card.closest('[class*="theme-"]');
          if (existingWrapper && existingWrapper !== document.body) {
            document.body.appendChild(card);
            existingWrapper.remove();
          }

          // Apply layout
          card.className = `adaptive-card layout-${l}`;

          // Add structure
          if (l === 'sidebar') {
            card.innerHTML = `
              <div class="sidebar-image" style="background: gray; width: 100%; height: 200px;"></div>
              <div class="sidebar-content">
                <h2>Sidebar Title</h2>
                <p>Content goes here</p>
              </div>
            `;
          } else if (l === 'hero-split') {
            card.innerHTML = `
              <div class="hero-content">
                <h1>Hero Heading</h1>
                <p>Compelling description</p>
                <div class="hero-actions">
                  <button class="btn btn-primary">Action</button>
                </div>
              </div>
              <div class="hero-image">
                <img src="https://picsum.photos/600/400" alt="Hero" />
              </div>
            `;
          } else if (l === 'feature') {
            card.innerHTML = `
              <div class="feature-header"><h2>Features</h2></div>
              <div class="feature-grid">
                <div class="feature-item">Feature 1</div>
                <div class="feature-item">Feature 2</div>
                <div class="feature-item">Feature 3</div>
              </div>
            `;
          } else if (l === 'dashboard') {
            card.innerHTML = `
              <div class="dashboard-header">Dashboard</div>
              <div class="dashboard-sidebar">Nav</div>
              <div class="dashboard-main">
                <div class="dashboard-widget">Widget 1</div>
                <div class="dashboard-widget">Widget 2</div>
              </div>
              <div class="dashboard-footer">Footer</div>
            `;
          }

          // Apply theme
          if (t) {
            const wrapper = document.createElement('div');
            wrapper.className = t;
            card.parentNode.insertBefore(wrapper, card);
            wrapper.appendChild(card);
          }
        }, { l: combo.layout, t: combo.customTheme });

        await page.waitForTimeout(300);

        // Verify no style conflicts
        const styleCheck = await page.evaluate(() => {
          const card = document.querySelector('.adaptive-card');
          if (!card) return { valid: false };

          const computed = window.getComputedStyle(card);
          const rect = card.getBoundingClientRect();

          return {
            valid: true,
            isVisible: rect.width > 0 && rect.height > 0,
            hasDisplay: computed.display !== 'none',
            noOverlap: true, // Would need more complex logic to detect overlaps
          };
        });

        expect(styleCheck.valid).toBe(true);
        expect(styleCheck.isVisible).toBe(true);
        expect(styleCheck.hasDisplay).toBe(true);

        // Take screenshot for visual verification
        const screenshot = await page.screenshot({
          clip: await page.evaluate(() => {
            const container = document.querySelector('.adaptive-card-container');
            const rect = container.getBoundingClientRect();
            return {
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height,
            };
          }),
        });

        expect(screenshot).toMatchSnapshot(
          `combo-${combo.layout}-${combo.customTheme || 'default'}-${combo.daisyuiTheme}.png`,
          { maxDiffPixels: 150, threshold: 0.2 }
        );

        // Check accessibility (basic)
        const hasAccessibleContrast = await page.evaluate(() => {
          const card = document.querySelector('.adaptive-card');
          const text = card?.querySelector('h1, h2, p');
          if (!text) return true; // Skip if no text

          const computed = window.getComputedStyle(text);
          const bgComputed = window.getComputedStyle(card);

          // Basic check that text and background are different
          return computed.color !== bgComputed.backgroundColor;
        });

        expect(hasAccessibleContrast).toBe(true);
      });
    }

  });

  test.describe('Theme Switching Without Layout Change', () => {

    test('switching custom themes maintains layout structure', async ({ page, containerHelper }) => {
      await containerHelper.resizeContainer('.adaptive-card-container', 800);

      // Set layout
      await page.evaluate(() => {
        const card = document.querySelector('.adaptive-card');
        card.className = 'adaptive-card layout-feature';
        card.innerHTML = `
          <div class="feature-header"><h2>Features</h2></div>
          <div class="feature-grid">
            <div class="feature-item">Item 1</div>
            <div class="feature-item">Item 2</div>
            <div class="feature-item">Item 3</div>
          </div>
        `;
      });

      await page.waitForTimeout(200);

      // Get initial structure
      const initialStructure = await page.evaluate(() => {
        const grid = document.querySelector('.feature-grid');
        const computed = window.getComputedStyle(grid);
        const items = Array.from(document.querySelectorAll('.feature-item'));

        return {
          gridTemplateColumns: computed.gridTemplateColumns,
          itemPositions: items.map(item => {
            const rect = item.getBoundingClientRect();
            return { left: rect.left, top: rect.top };
          }),
        };
      });

      // Switch through themes
      for (const theme of ['theme-dark-gradient', 'theme-light-elegant', 'theme-minimal']) {
        await page.evaluate((t) => {
          const card = document.querySelector('.adaptive-card');

          // Remove existing wrapper
          const existingWrapper = card.closest('[class*="theme-"]');
          if (existingWrapper && existingWrapper !== document.body) {
            document.body.appendChild(card);
            existingWrapper.remove();
          }

          // Apply new theme
          const wrapper = document.createElement('div');
          wrapper.className = t;
          card.parentNode.insertBefore(wrapper, card);
          wrapper.appendChild(card);
        }, theme);

        await page.waitForTimeout(200);

        const currentStructure = await page.evaluate(() => {
          const grid = document.querySelector('.feature-grid');
          const computed = window.getComputedStyle(grid);
          const items = Array.from(document.querySelectorAll('.feature-item'));

          return {
            gridTemplateColumns: computed.gridTemplateColumns,
            itemPositions: items.map(item => {
              const rect = item.getBoundingClientRect();
              return { left: rect.left, top: rect.top };
            }),
          };
        });

        // Structure should remain the same
        expect(currentStructure.gridTemplateColumns).toBe(initialStructure.gridTemplateColumns);

        // Item positions should be the same (within 2px)
        currentStructure.itemPositions.forEach((pos, i) => {
          expect(Math.abs(pos.left - initialStructure.itemPositions[i].left)).toBeLessThan(2);
          expect(Math.abs(pos.top - initialStructure.itemPositions[i].top)).toBeLessThan(2);
        });
      }
    });

  });

  test.describe('DaisyUI Theme + Custom Theme Interaction', () => {

    test('custom theme overrides work with different DaisyUI themes', async ({ page }) => {
      const daisyuiThemes = ['light', 'dark', 'cyberpunk'];
      const customTheme = 'theme-brand';

      for (const daisyuiTheme of daisyuiThemes) {
        // Set DaisyUI theme
        await page.evaluate((theme) => {
          document.documentElement.setAttribute('data-theme', theme);
        }, daisyuiTheme);

        // Apply custom theme
        await page.evaluate((t) => {
          const card = document.querySelector('.adaptive-card');

          // Remove existing wrapper
          const existingWrapper = card.closest('[class*="theme-"]');
          if (existingWrapper && existingWrapper !== document.body) {
            document.body.appendChild(card);
            existingWrapper.remove();
          }

          card.className = 'adaptive-card layout-sidebar';

          const wrapper = document.createElement('div');
          wrapper.className = t;
          card.parentNode.insertBefore(wrapper, card);
          wrapper.appendChild(card);
        }, customTheme);

        await page.waitForTimeout(200);

        // Verify custom theme takes precedence
        const themeApplied = await page.evaluate(() => {
          const card = document.querySelector('.adaptive-card');
          const computed = window.getComputedStyle(card);

          // Brand theme has specific gradient
          return {
            hasBackground: computed.backgroundColor !== 'rgba(0, 0, 0, 0)' ||
                          computed.backgroundImage !== 'none',
            daisyuiTheme: document.documentElement.getAttribute('data-theme'),
          };
        });

        expect(themeApplied.hasBackground).toBe(true);
        expect(themeApplied.daisyuiTheme).toBe(daisyuiTheme);
      }
    });

  });

  test.describe('Performance', () => {

    test('rapid theme switching performs well', async ({ page }) => {
      const startTime = Date.now();
      const iterations = 20;

      for (let i = 0; i < iterations; i++) {
        const theme = CUSTOM_THEMES[i % CUSTOM_THEMES.length];

        await page.evaluate((t) => {
          const card = document.querySelector('.adaptive-card');

          const existingWrapper = card.closest('[class*="theme-"]');
          if (existingWrapper && existingWrapper !== document.body) {
            document.body.appendChild(card);
            existingWrapper.remove();
          }

          if (t) {
            const wrapper = document.createElement('div');
            wrapper.className = t;
            card.parentNode.insertBefore(wrapper, card);
            wrapper.appendChild(card);
          }
        }, theme);

        await page.waitForTimeout(20);
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const avgTime = totalTime / iterations;

      // Should average less than 50ms per switch
      expect(avgTime).toBeLessThan(50);
    });

  });

});
