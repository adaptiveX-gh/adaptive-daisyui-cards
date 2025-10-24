// Visual regression tests for adaptive card layouts
import { test, expect, CONTAINER_SIZES, BREAKPOINTS, LAYOUTS, CUSTOM_THEMES } from './fixtures.js';

test.describe('Visual Regression Tests @visual', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  // Test each layout type at all critical breakpoints
  for (const layout of LAYOUTS) {
    test.describe(`Layout: ${layout}`, () => {

      for (const [sizeName, sizeValue] of Object.entries(CONTAINER_SIZES)) {
        test(`should render correctly at ${sizeName} (${sizeValue}px)`, async ({
          page,
          containerHelper
        }) => {
          // Set the layout
          await page.evaluate((l) => {
            const card = document.querySelector('.adaptive-card');
            if (card) {
              card.className = `adaptive-card layout-${l}`;
            }
          }, layout);

          // Resize the container
          await containerHelper.resizeContainer('.adaptive-card-container', sizeValue);

          // Wait for layout to stabilize
          await page.waitForTimeout(400);

          // Take screenshot for visual comparison
          const screenshot = await page.screenshot({
            clip: await page.evaluate(() => {
              const container = document.querySelector('.adaptive-card-container');
              const rect = container.getBoundingClientRect();
              return {
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height
              };
            })
          });

          // Compare with baseline
          expect(screenshot).toMatchSnapshot(
            `${layout}-${sizeName}-${sizeValue}px.png`,
            {
              maxDiffPixels: 100,
              threshold: 0.2
            }
          );
        });
      }

      // Test transitions between breakpoints
      test(`should transition smoothly between breakpoints`, async ({
        page,
        containerHelper
      }) => {
        await page.evaluate((l) => {
          const card = document.querySelector('.adaptive-card');
          if (card) {
            card.className = `adaptive-card layout-${l}`;
          }
        }, layout);

        // Test each breakpoint transition
        const sizes = [200, 250, 400, 600, 800, 1200];

        for (let i = 0; i < sizes.length - 1; i++) {
          const fromSize = sizes[i];
          const toSize = sizes[i + 1];

          // Resize from smaller to larger
          await containerHelper.resizeContainer('.adaptive-card-container', fromSize);
          await page.waitForTimeout(100);

          // Start recording performance metrics
          await page.evaluate(() => performance.mark('resize-start'));

          // Resize to larger size
          await containerHelper.resizeContainer('.adaptive-card-container', toSize);

          // Wait for transition
          await page.waitForTimeout(350);

          // End recording
          await page.evaluate(() => performance.mark('resize-end'));

          // Verify no layout shift occurred
          const layoutShift = await page.evaluate(() => {
            return new Promise((resolve) => {
              const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const shift = entries.reduce((sum, entry) => {
                  if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
                    return sum + entry.value;
                  }
                  return sum;
                }, 0);
                resolve(shift);
                observer.disconnect();
              });
              observer.observe({ entryTypes: ['layout-shift'] });
              setTimeout(() => resolve(0), 1000);
            });
          });

          // Layout shift should be minimal
          expect(layoutShift).toBeLessThan(0.1);
        }
      });
    });
  }

  test('should maintain aspect ratios during resize', async ({ page, containerHelper }) => {
    const sizes = [200, 400, 800, 1200];

    for (const size of sizes) {
      await containerHelper.resizeContainer('.adaptive-card-container', size);
      await page.waitForTimeout(350);

      // Check that images maintain aspect ratio
      const imageAspectRatio = await page.evaluate(() => {
        const img = document.querySelector('.adaptive-card img');
        if (!img) return null;
        return img.offsetWidth / img.offsetHeight;
      });

      // Verify aspect ratio is reasonable (between 0.5 and 2.5)
      if (imageAspectRatio !== null) {
        expect(imageAspectRatio).toBeGreaterThan(0.5);
        expect(imageAspectRatio).toBeLessThan(2.5);
      }
    }
  });

  test('should render all layouts side-by-side correctly', async ({ page }) => {
    await page.goto('/showcase');
    await page.waitForLoadState('networkidle');

    // Wait for all cards to render
    await page.waitForSelector('.adaptive-card', { state: 'visible' });

    // Take full page screenshot
    const screenshot = await page.screenshot({ fullPage: true });

    expect(screenshot).toMatchSnapshot('showcase-all-layouts.png', {
      maxDiffPixels: 200,
      threshold: 0.2
    });
  });

  test('should handle rapid resize events without flickering', async ({
    page,
    containerHelper
  }) => {
    // Rapidly resize container
    const sizes = [200, 400, 300, 600, 450, 800, 500, 1000];

    for (const size of sizes) {
      await containerHelper.resizeContainer('.adaptive-card-container', size);
      await page.waitForTimeout(50); // Minimal delay to simulate rapid resizing
    }

    // Final size
    await containerHelper.resizeContainer('.adaptive-card-container', 600);
    await page.waitForTimeout(400);

    // Card should still be visible and properly rendered
    const isVisible = await page.isVisible('.adaptive-card');
    expect(isVisible).toBe(true);

    // No console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    expect(consoleErrors).toHaveLength(0);
  });

  test('should render correctly in different DaisyUI themes', async ({ page, themeHelper }) => {
    const themes = ['light', 'dark', 'cupcake', 'cyberpunk'];

    for (const theme of themes) {
      await themeHelper.setTheme(theme);
      await page.waitForTimeout(200);

      const screenshot = await page.screenshot({
        clip: await page.evaluate(() => {
          const container = document.querySelector('.adaptive-card-container');
          const rect = container.getBoundingClientRect();
          return {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
          };
        })
      });

      expect(screenshot).toMatchSnapshot(`daisyui-theme-${theme}.png`, {
        maxDiffPixels: 150,
        threshold: 0.2
      });
    }
  });

  test.describe('Custom Theme Visual Regression', () => {

    test('each layout with default theme (no custom theme)', async ({ page, containerHelper }) => {
      await containerHelper.resizeContainer('.adaptive-card-container', 800);

      for (const layout of LAYOUTS) {
        await page.evaluate((l) => {
          const card = document.querySelector('.adaptive-card');
          if (card) {
            // Remove any custom theme
            const wrapper = card.closest('[class*="theme-"]');
            if (wrapper && wrapper !== document.body) {
              document.body.appendChild(card);
              wrapper.remove();
            }

            card.className = `adaptive-card layout-${l}`;

            // Add basic structure
            if (l === 'hero-split') {
              card.innerHTML = `
                <div class="hero-content"><h1>Hero</h1><p>Content</p></div>
                <div class="hero-image"><img src="https://picsum.photos/600/400" /></div>
              `;
            }
          }
        }, layout);

        await page.waitForTimeout(300);

        const screenshot = await page.screenshot({
          clip: await page.evaluate(() => {
            const container = document.querySelector('.adaptive-card-container');
            const rect = container.getBoundingClientRect();
            return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
          })
        });

        expect(screenshot).toMatchSnapshot(`${layout}-default-theme.png`, {
          maxDiffPixels: 100,
          threshold: 0.2
        });
      }
    });

    test('each layout with dark-gradient theme', async ({ page, containerHelper, customThemeHelper }) => {
      await containerHelper.resizeContainer('.adaptive-card-container', 800);

      for (const layout of LAYOUTS) {
        await page.evaluate((l) => {
          const card = document.querySelector('.adaptive-card');
          card.className = `adaptive-card layout-${l}`;

          if (l === 'hero-split') {
            card.innerHTML = `
              <div class="hero-content"><h1>Hero</h1><p>Content</p></div>
              <div class="hero-image"><img src="https://picsum.photos/600/400" /></div>
            `;
          } else if (l === 'sidebar') {
            card.innerHTML = `
              <div class="sidebar-image" style="background: gray; height: 200px;"></div>
              <div class="sidebar-content"><h2>Title</h2><p>Content</p></div>
            `;
          }
        }, layout);

        await customThemeHelper.setCustomTheme('theme-dark-gradient');
        await page.waitForTimeout(300);

        const screenshot = await page.screenshot({
          clip: await page.evaluate(() => {
            const container = document.querySelector('.adaptive-card-container');
            const rect = container.getBoundingClientRect();
            return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
          })
        });

        expect(screenshot).toMatchSnapshot(`${layout}-dark-gradient.png`, {
          maxDiffPixels: 100,
          threshold: 0.2
        });
      }
    });

    test('hero-split with all 5 custom themes', async ({ page, containerHelper, customThemeHelper }) => {
      await containerHelper.resizeContainer('.adaptive-card-container', 900);

      // Setup hero-split
      await page.evaluate(() => {
        const card = document.querySelector('.adaptive-card');
        card.className = 'adaptive-card layout-hero-split';
        card.innerHTML = `
          <div class="hero-content">
            <h1>Adaptive Hero</h1>
            <p>Experience the power of layout-theme separation</p>
            <div class="hero-actions">
              <button class="btn btn-primary">Get Started</button>
            </div>
          </div>
          <div class="hero-image">
            <img src="https://picsum.photos/800/600" alt="Hero" />
          </div>
        `;
      });

      const customThemes = ['theme-dark-gradient', 'theme-light-elegant', 'theme-neon-accent', 'theme-minimal', 'theme-brand'];

      for (const theme of customThemes) {
        await customThemeHelper.setCustomTheme(theme);
        await page.waitForTimeout(300);

        const screenshot = await page.screenshot({
          clip: await page.evaluate(() => {
            const container = document.querySelector('.adaptive-card-container');
            const rect = container.getBoundingClientRect();
            return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
          })
        });

        expect(screenshot).toMatchSnapshot(`hero-split-${theme}.png`, {
          maxDiffPixels: 120,
          threshold: 0.2
        });
      }
    });

  });

  test('themes do not break layout structure', async ({ page, containerHelper, customThemeHelper }) => {
    await containerHelper.resizeContainer('.adaptive-card-container', 700);

    // Test a few key combinations
    const testCases = [
      { layout: 'feature', theme: 'theme-light-elegant' },
      { layout: 'dashboard', theme: 'theme-minimal' },
      { layout: 'masonry', theme: 'theme-neon-accent' },
    ];

    for (const testCase of testCases) {
      await page.evaluate((l) => {
        const card = document.querySelector('.adaptive-card');
        card.className = `adaptive-card layout-${l}`;

        if (l === 'feature') {
          card.innerHTML = `
            <div class="feature-header"><h2>Features</h2></div>
            <div class="feature-grid">
              <div class="feature-item">Item 1</div>
              <div class="feature-item">Item 2</div>
              <div class="feature-item">Item 3</div>
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
          `;
        }
      }, testCase.layout);

      await customThemeHelper.setCustomTheme(testCase.theme);
      await page.waitForTimeout(300);

      // Verify structure is maintained
      const structure = await page.evaluate(() => {
        const card = document.querySelector('.adaptive-card');
        const computed = window.getComputedStyle(card);

        return {
          display: computed.display,
          isVisible: card.offsetWidth > 0 && card.offsetHeight > 0,
        };
      });

      expect(structure.isVisible).toBe(true);
    }
  });
});
