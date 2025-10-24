// Playwright fixtures for e2e tests
import { test as base } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

// Container sizes for testing
export const CONTAINER_SIZES = {
  extraSmall: 200,
  small: 250,
  medium: 400,
  large: 600,
  extraLarge: 800,
  max: 1200
};

// Breakpoint thresholds
export const BREAKPOINTS = {
  extraSmall: 250,
  small: 400,
  medium: 600,
  large: 800
};

// Layout types (all 6 layouts)
export const LAYOUTS = [
  'sidebar',
  'feature',
  'masonry',
  'dashboard',
  'split',
  'hero-split'
];

// Custom theme options
export const CUSTOM_THEMES = [
  '',
  'theme-dark-gradient',
  'theme-light-elegant',
  'theme-neon-accent',
  'theme-minimal',
  'theme-brand'
];

// DaisyUI themes to test
export const THEMES = [
  'light',
  'dark',
  'cupcake',
  'cyberpunk',
  'business',
  'corporate'
];

// Extended test with custom fixtures
export const test = base.extend({
  // Auto-inject axe for accessibility testing
  autoTestFixture: async ({ page }, use) => {
    await page.goto('/');
    await injectAxe(page);
    await use(page);
  },

  // Helper to resize container
  containerHelper: async ({ page }, use) => {
    const helper = {
      async resizeContainer(selector, width) {
        await page.evaluate(({ sel, w }) => {
          const container = document.querySelector(sel);
          if (container) {
            container.style.width = `${w}px`;
          }
        }, { sel: selector, w: width });

        // Wait for any transitions to complete
        await page.waitForTimeout(350);
      },

      async getContainerWidth(selector) {
        return await page.evaluate((sel) => {
          const container = document.querySelector(sel);
          return container ? container.offsetWidth : 0;
        }, selector);
      },

      async getComputedStyle(selector, property) {
        return await page.evaluate(({ sel, prop }) => {
          const element = document.querySelector(sel);
          if (!element) return null;
          return window.getComputedStyle(element).getPropertyValue(prop);
        }, { sel: selector, prop: property });
      }
    };
    await use(helper);
  },

  // Helper for layout testing
  layoutHelper: async ({ page }, use) => {
    const helper = {
      async setLayout(layout) {
        await page.evaluate((l) => {
          const card = document.querySelector('.adaptive-card');
          if (card) {
            card.className = card.className
              .replace(/layout-\w+/g, '')
              .trim();
            card.classList.add(`layout-${l}`);
          }
        }, layout);
        await page.waitForTimeout(350);
      },

      async getCurrentLayout() {
        return await page.evaluate(() => {
          const card = document.querySelector('.adaptive-card');
          if (!card) return null;
          const classes = Array.from(card.classList);
          const layoutClass = classes.find(c => c.startsWith('layout-'));
          return layoutClass ? layoutClass.replace('layout-', '') : null;
        });
      },

      async getGridTemplateAreas(selector) {
        return await page.evaluate((sel) => {
          const element = document.querySelector(sel);
          if (!element) return null;
          return window.getComputedStyle(element).gridTemplateAreas;
        }, selector);
      }
    };
    await use(helper);
  },

  // Helper for DaisyUI theme testing
  themeHelper: async ({ page }, use) => {
    const helper = {
      async setTheme(theme) {
        await page.evaluate((t) => {
          document.documentElement.setAttribute('data-theme', t);
        }, theme);
        await page.waitForTimeout(100);
      },

      async getCurrentTheme() {
        return await page.evaluate(() => {
          return document.documentElement.getAttribute('data-theme');
        });
      }
    };
    await use(helper);
  },

  // Helper for custom theme testing
  customThemeHelper: async ({ page }, use) => {
    const helper = {
      async setCustomTheme(theme) {
        await page.evaluate((t) => {
          const card = document.querySelector('.adaptive-card');
          if (!card) return;

          // Remove existing wrapper
          const existingWrapper = card.closest('[class*="theme-"]');
          if (existingWrapper && existingWrapper !== document.body) {
            document.body.appendChild(card);
            existingWrapper.remove();
          }

          // Apply new theme if not default
          if (t) {
            const wrapper = document.createElement('div');
            wrapper.className = t;
            wrapper.setAttribute('data-custom-theme', t);
            card.parentNode.insertBefore(wrapper, card);
            wrapper.appendChild(card);
          }
        }, theme);
        await page.waitForTimeout(100);
      },

      async getCurrentCustomTheme() {
        return await page.evaluate(() => {
          const wrapper = document.querySelector('[data-custom-theme]');
          return wrapper ? wrapper.getAttribute('data-custom-theme') : null;
        });
      },

      async removeCustomTheme() {
        await page.evaluate(() => {
          const card = document.querySelector('.adaptive-card');
          const wrapper = card?.closest('[class*="theme-"]');
          if (wrapper && wrapper !== document.body) {
            document.body.appendChild(card);
            wrapper.remove();
          }
        });
        await page.waitForTimeout(100);
      }
    };
    await use(helper);
  }
});

export { expect } from '@playwright/test';
