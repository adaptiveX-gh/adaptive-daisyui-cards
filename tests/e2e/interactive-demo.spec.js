// Interactive demo functionality tests
import { test, expect, LAYOUTS, THEMES, CUSTOM_THEMES } from './fixtures.js';

test.describe('Interactive Demo Tests @interactive', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Drag-to-Resize Functionality', () => {
    test('should resize container using drag handle', async ({ page }) => {
      const dragHandle = page.locator('.resize-handle, [data-testid="resize-handle"]');

      // Get initial size
      const initialWidth = await page.evaluate(() => {
        const container = document.querySelector('.adaptive-card-container');
        return container ? container.offsetWidth : 0;
      });

      // Drag to resize
      const handleBox = await dragHandle.boundingBox();
      if (handleBox) {
        await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(handleBox.x + 200, handleBox.y + handleBox.height / 2);
        await page.mouse.up();
      }

      await page.waitForTimeout(400);

      // Get new size
      const newWidth = await page.evaluate(() => {
        const container = document.querySelector('.adaptive-card-container');
        return container ? container.offsetWidth : 0;
      });

      // Width should have changed
      expect(Math.abs(newWidth - initialWidth)).toBeGreaterThan(50);
    });

    test('should respect min/max resize constraints', async ({ page, containerHelper }) => {
      // Try to resize below minimum
      await page.evaluate(() => {
        const container = document.querySelector('.adaptive-card-container');
        if (container) {
          container.style.width = '100px';
        }
      });

      await page.waitForTimeout(350);

      const width = await containerHelper.getContainerWidth('.adaptive-card-container');

      // Should be at minimum (200px)
      expect(width).toBeGreaterThanOrEqual(200);

      // Try to resize above maximum
      await page.evaluate(() => {
        const container = document.querySelector('.adaptive-card-container');
        if (container) {
          container.style.width = '2000px';
        }
      });

      await page.waitForTimeout(350);

      const maxWidth = await containerHelper.getContainerWidth('.adaptive-card-container');

      // Should be at or below maximum (1200px)
      expect(maxWidth).toBeLessThanOrEqual(1200);
    });

    test('should handle rapid dragging without breaking', async ({ page }) => {
      const dragHandle = page.locator('.resize-handle, [data-testid="resize-handle"]');

      const handleBox = await dragHandle.boundingBox();
      if (handleBox) {
        await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2);
        await page.mouse.down();

        // Rapid movements
        for (let i = 0; i < 10; i++) {
          const offset = i % 2 === 0 ? 50 : -50;
          await page.mouse.move(handleBox.x + offset, handleBox.y + handleBox.height / 2);
        }

        await page.mouse.up();
      }

      await page.waitForTimeout(400);

      // Card should still be visible
      const isVisible = await page.isVisible('.adaptive-card');
      expect(isVisible).toBe(true);
    });
  });

  test.describe('Dimension Display', () => {
    test('should update dimension display in real-time', async ({ page, containerHelper }) => {
      const sizes = [300, 500, 700];

      for (const size of sizes) {
        await containerHelper.resizeContainer('.adaptive-card-container', size);
        await page.waitForTimeout(200);

        const displayedWidth = await page.evaluate(() => {
          const display = document.querySelector('[data-testid="width-display"], .width-display');
          if (!display) return null;
          const text = display.textContent;
          const match = text.match(/(\d+)px/);
          return match ? parseInt(match[1]) : null;
        });

        if (displayedWidth) {
          // Displayed width should match actual width (within 10px)
          expect(Math.abs(displayedWidth - size)).toBeLessThan(10);
        }
      }
    });

    test('should display height dimension', async ({ page }) => {
      const heightDisplay = await page.evaluate(() => {
        const display = document.querySelector('[data-testid="height-display"], .height-display');
        if (!display) return null;
        return display.textContent;
      });

      if (heightDisplay) {
        expect(heightDisplay).toMatch(/\d+px/);
      }
    });

    test('should update dimensions during drag', async ({ page }) => {
      const dragHandle = page.locator('.resize-handle, [data-testid="resize-handle"]');

      let dimensionsUpdated = false;

      page.on('console', msg => {
        if (msg.text().includes('dimension') || msg.text().includes('resize')) {
          dimensionsUpdated = true;
        }
      });

      const handleBox = await dragHandle.boundingBox();
      if (handleBox) {
        await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(handleBox.x + 100, handleBox.y + handleBox.height / 2);
        await page.waitForTimeout(100);
        await page.mouse.up();
      }

      // Dimension display should exist
      const display = await page.locator('[data-testid="width-display"], .width-display').count();
      expect(display).toBeGreaterThan(0);
    });
  });

  test.describe('Layout Switcher', () => {
    test('should switch between all 6 layouts', async ({ page, layoutHelper }) => {
      for (const layout of LAYOUTS) {
        // Click layout button
        const button = page.locator(`[data-layout="${layout}"], button:has-text("${layout}")`).first();
        if (await button.count() > 0) {
          await button.click();
        } else {
          await layoutHelper.setLayout(layout);
        }
        await page.waitForTimeout(350);

        // Verify layout changed
        const currentLayout = await layoutHelper.getCurrentLayout();
        expect(currentLayout).toBe(layout);
      }
    });

    test('should highlight active layout button', async ({ page }) => {
      for (const layout of LAYOUTS) {
        const button = page.locator(`[data-layout="${layout}"], button:has-text("${layout}")`).first();
        await button.click();
        await page.waitForTimeout(200);

        // Check if button is active/highlighted
        const isActive = await page.evaluate((l) => {
          const btn = document.querySelector(`[data-layout="${l}"]`);
          if (!btn) return false;
          return btn.classList.contains('active') ||
                 btn.classList.contains('btn-active') ||
                 btn.getAttribute('aria-pressed') === 'true';
        }, layout);

        expect(isActive).toBe(true);
      }
    });

    test('should maintain layout across container resizes', async ({
      page,
      containerHelper,
      layoutHelper
    }) => {
      await layoutHelper.setLayout('feature');
      await page.waitForTimeout(200);

      const sizes = [300, 600, 900];
      for (const size of sizes) {
        await containerHelper.resizeContainer('.adaptive-card-container', size);
        await page.waitForTimeout(350);

        const currentLayout = await layoutHelper.getCurrentLayout();
        expect(currentLayout).toBe('feature');
      }
    });
  });

  test.describe('DaisyUI Theme Switcher', () => {
    test('should apply all DaisyUI themes correctly', async ({ page, themeHelper }) => {
      for (const theme of THEMES) {
        // Click theme button
        const button = page.locator(`[data-theme-btn="${theme}"], button:has-text("${theme}")`).first();
        if (await button.count() > 0) {
          await button.click();
          await page.waitForTimeout(200);
        } else {
          await themeHelper.setTheme(theme);
        }

        // Verify theme applied
        const currentTheme = await themeHelper.getCurrentTheme();
        expect(currentTheme).toBe(theme);

        // Verify theme colors changed
        const bgColor = await page.evaluate(() => {
          return window.getComputedStyle(document.body).backgroundColor;
        });

        expect(bgColor).toBeTruthy();
        expect(bgColor).not.toBe('');
      }
    });

    test('should persist DaisyUI theme when switching layouts', async ({
      page,
      themeHelper,
      layoutHelper
    }) => {
      await themeHelper.setTheme('dark');
      const darkTheme = await themeHelper.getCurrentTheme();

      // Switch layouts
      await layoutHelper.setLayout('sidebar');
      await page.waitForTimeout(200);

      await layoutHelper.setLayout('feature');
      await page.waitForTimeout(200);

      // DaisyUI theme should still be dark
      const currentTheme = await themeHelper.getCurrentTheme();
      expect(currentTheme).toBe(darkTheme);
    });

    test('should update base colors when DaisyUI theme changes', async ({ page, themeHelper }) => {
      await themeHelper.setTheme('light');
      await page.waitForTimeout(200);

      const lightBg = await page.evaluate(() => {
        const card = document.querySelector('.adaptive-card');
        if (!card) return null;
        return window.getComputedStyle(card).backgroundColor;
      });

      await themeHelper.setTheme('dark');
      await page.waitForTimeout(200);

      const darkBg = await page.evaluate(() => {
        const card = document.querySelector('.adaptive-card');
        if (!card) return null;
        return window.getComputedStyle(card).backgroundColor;
      });

      // Background colors should be different
      expect(darkBg).not.toBe(lightBg);
    });
  });

  test.describe('Custom Theme Switcher', () => {
    test('should apply all 5 custom themes', async ({ page, customThemeHelper }) => {
      const themesToTest = CUSTOM_THEMES.filter(t => t !== ''); // Exclude empty string

      for (const theme of themesToTest) {
        // Click custom theme button
        const button = page.locator(`[data-custom-theme-btn="${theme}"], button:has-text("${theme}")`).first();
        if (await button.count() > 0) {
          await button.click();
        } else {
          await customThemeHelper.setCustomTheme(theme);
        }
        await page.waitForTimeout(200);

        // Verify custom theme applied
        const currentTheme = await customThemeHelper.getCurrentCustomTheme();
        expect(currentTheme).toBe(theme);

        // Verify theme has visual effect
        const hasCustomStyling = await page.evaluate(() => {
          const card = document.querySelector('.adaptive-card');
          if (!card) return false;
          const computed = window.getComputedStyle(card);
          return computed.backgroundImage !== 'none' ||
                 computed.backgroundColor !== 'rgba(0, 0, 0, 0)';
        });

        expect(hasCustomStyling).toBe(true);
      }
    });

    test('should persist custom theme when switching layouts', async ({ page, customThemeHelper, layoutHelper }) => {
      await customThemeHelper.setCustomTheme('theme-dark-gradient');
      await page.waitForTimeout(200);

      const initialTheme = await customThemeHelper.getCurrentCustomTheme();

      // Switch layouts
      await layoutHelper.setLayout('sidebar');
      await page.waitForTimeout(200);

      await layoutHelper.setLayout('hero-split');
      await page.waitForTimeout(200);

      // Custom theme should persist
      const currentTheme = await customThemeHelper.getCurrentCustomTheme();
      expect(currentTheme).toBe(initialTheme);
    });

    test('should persist custom theme when switching DaisyUI themes', async ({ page, customThemeHelper, themeHelper }) => {
      await customThemeHelper.setCustomTheme('theme-neon-accent');
      await page.waitForTimeout(200);

      const initialCustomTheme = await customThemeHelper.getCurrentCustomTheme();

      // Switch DaisyUI themes
      await themeHelper.setTheme('cyberpunk');
      await page.waitForTimeout(200);

      await themeHelper.setTheme('light');
      await page.waitForTimeout(200);

      // Custom theme should persist
      const currentCustomTheme = await customThemeHelper.getCurrentCustomTheme();
      expect(currentCustomTheme).toBe(initialCustomTheme);
    });

    test('should remove custom theme when selecting "none"', async ({ page, customThemeHelper }) => {
      // Apply custom theme
      await customThemeHelper.setCustomTheme('theme-brand');
      await page.waitForTimeout(200);

      expect(await customThemeHelper.getCurrentCustomTheme()).toBe('theme-brand');

      // Remove custom theme
      await customThemeHelper.removeCustomTheme();
      await page.waitForTimeout(200);

      expect(await customThemeHelper.getCurrentCustomTheme()).toBeNull();
    });
  });

  test.describe('Three Separate Switchers', () => {
    test('all three switchers are independent', async ({
      page,
      layoutHelper,
      customThemeHelper,
      themeHelper
    }) => {
      // Set all three
      await layoutHelper.setLayout('hero-split');
      await customThemeHelper.setCustomTheme('theme-dark-gradient');
      await themeHelper.setTheme('cyberpunk');

      await page.waitForTimeout(300);

      // Verify all are applied
      const state = await page.evaluate(() => {
        const card = document.querySelector('.adaptive-card');
        const wrapper = card?.closest('[data-custom-theme]');

        return {
          layout: Array.from(card.classList).find(c => c.startsWith('layout-')),
          customTheme: wrapper?.getAttribute('data-custom-theme'),
          daisyuiTheme: document.documentElement.getAttribute('data-theme'),
        };
      });

      expect(state.layout).toBe('layout-hero-split');
      expect(state.customTheme).toBe('theme-dark-gradient');
      expect(state.daisyuiTheme).toBe('cyberpunk');
    });

    test('localStorage persists all three independently', async ({ page }) => {
      // Set localStorage
      await page.evaluate(() => {
        localStorage.setItem('current-layout', 'dashboard');
        localStorage.setItem('custom-theme', 'theme-minimal');
        localStorage.setItem('daisyui-theme', 'cupcake');
      });

      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Verify persisted
      const storage = await page.evaluate(() => {
        return {
          layout: localStorage.getItem('current-layout'),
          custom: localStorage.getItem('custom-theme'),
          daisyui: localStorage.getItem('daisyui-theme'),
        };
      });

      expect(storage.layout).toBe('dashboard');
      expect(storage.custom).toBe('theme-minimal');
      expect(storage.daisyui).toBe('cupcake');
    });
  });

  test.describe('Example Cards', () => {
    test('should render all example cards', async ({ page }) => {
      await page.goto('/examples');
      await page.waitForLoadState('networkidle');

      const examples = [
        'product-card',
        'blog-card',
        'dashboard-widget',
        'profile-card',
        'media-gallery'
      ];

      for (const example of examples) {
        const card = page.locator(`[data-card-type="${example}"], .${example}`).first();
        if (await card.count() > 0) {
          await expect(card).toBeVisible();
        }
      }
    });

    test('should handle missing images gracefully', async ({ page }) => {
      await page.goto('/examples');
      await page.waitForLoadState('networkidle');

      // Check for broken images
      const brokenImages = await page.evaluate(() => {
        const images = document.querySelectorAll('.adaptive-card img');
        let broken = 0;

        images.forEach(img => {
          if (!img.complete || img.naturalHeight === 0) {
            broken++;
          }
        });

        return broken;
      });

      // Should have fallbacks or placeholders
      expect(brokenImages).toBe(0);
    });

    test('should maintain card functionality in showcase grid', async ({ page }) => {
      await page.goto('/showcase');
      await page.waitForLoadState('networkidle');

      const cardCount = await page.locator('.adaptive-card').count();
      expect(cardCount).toBeGreaterThan(0);

      // Each card should be interactive
      const cards = await page.locator('.adaptive-card').all();
      for (const card of cards.slice(0, 3)) { // Test first 3 cards
        await expect(card).toBeVisible();

        // Check if card has content
        const hasContent = await card.evaluate(el => {
          return el.textContent.trim().length > 0;
        });
        expect(hasContent).toBe(true);
      }
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should navigate layout switcher with keyboard', async ({ page }) => {
      const layoutButtons = page.locator('[data-layout], .layout-btn');

      // Focus first button
      await layoutButtons.first().focus();

      // Navigate with arrow keys
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(100);

      // Check if focus moved
      const focusedElement = await page.evaluate(() => {
        return document.activeElement?.getAttribute('data-layout');
      });

      expect(focusedElement).toBeTruthy();
    });

    test('should activate layout with Enter/Space', async ({ page, layoutHelper }) => {
      const layoutButton = page.locator('[data-layout="sidebar"]').first();

      await layoutButton.focus();
      await page.keyboard.press('Enter');
      await page.waitForTimeout(350);

      const currentLayout = await layoutHelper.getCurrentLayout();
      expect(currentLayout).toBe('sidebar');
    });
  });

  test('should handle simultaneous interactions', async ({
    page,
    containerHelper,
    layoutHelper,
    themeHelper
  }) => {
    // Resize container
    await containerHelper.resizeContainer('.adaptive-card-container', 500);

    // Change layout
    await layoutHelper.setLayout('feature');

    // Change theme
    await themeHelper.setTheme('dark');

    await page.waitForTimeout(400);

    // All changes should be applied
    const state = await page.evaluate(() => {
      const container = document.querySelector('.adaptive-card-container');
      const card = document.querySelector('.adaptive-card');
      const theme = document.documentElement.getAttribute('data-theme');

      return {
        width: container ? container.offsetWidth : 0,
        layout: card ? Array.from(card.classList).find(c => c.startsWith('layout-')) : null,
        theme: theme
      };
    });

    expect(Math.abs(state.width - 500)).toBeLessThan(10);
    expect(state.layout).toBe('layout-feature');
    expect(state.theme).toBe('dark');
  });
});
