// Typography and scaling tests
import { test, expect, CONTAINER_SIZES } from './fixtures.js';

test.describe('Typography and Scaling Tests @typography', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should scale font sizes with clamp() correctly', async ({
    page,
    containerHelper
  }) => {
    const sizes = [200, 400, 600, 800, 1200];
    const fontSizes = {};

    for (const size of sizes) {
      await containerHelper.resizeContainer('.adaptive-card-container', size);
      await page.waitForTimeout(350);

      // Measure all text size classes
      const measurements = await page.evaluate(() => {
        const classes = [
          'adaptive-text-xs',
          'adaptive-text-sm',
          'adaptive-text-base',
          'adaptive-text-lg',
          'adaptive-text-xl',
          'adaptive-text-2xl'
        ];

        return classes.reduce((acc, className) => {
          const element = document.querySelector(`.${className}`);
          if (element) {
            acc[className] = parseFloat(window.getComputedStyle(element).fontSize);
          }
          return acc;
        }, {});
      });

      fontSizes[size] = measurements;
    }

    // Verify font sizes increase as container grows
    for (const className of Object.keys(fontSizes[200])) {
      const size200 = fontSizes[200][className];
      const size400 = fontSizes[400][className];
      const size800 = fontSizes[800][className];
      const size1200 = fontSizes[1200][className];

      // Font sizes should increase
      expect(size400).toBeGreaterThanOrEqual(size200);
      expect(size800).toBeGreaterThanOrEqual(size400);
      expect(size1200).toBeGreaterThanOrEqual(size800);

      // But not increase beyond reasonable bounds (clamp max)
      expect(size1200 / size200).toBeLessThan(3);
    }
  });

  test('should maintain readable text at all container sizes', async ({
    page,
    containerHelper
  }) => {
    const sizes = [200, 250, 400, 600, 800, 1200];

    for (const size of sizes) {
      await containerHelper.resizeContainer('.adaptive-card-container', size);
      await page.waitForTimeout(350);

      // Check minimum font sizes
      const minFontSize = await page.evaluate(() => {
        const allText = document.querySelectorAll('.adaptive-card *');
        let minSize = Infinity;

        allText.forEach(el => {
          const fontSize = parseFloat(window.getComputedStyle(el).fontSize);
          if (fontSize > 0 && fontSize < minSize) {
            minSize = fontSize;
          }
        });

        return minSize;
      });

      // Minimum font size should be at least 12px for readability
      expect(minFontSize).toBeGreaterThanOrEqual(12);

      // Maximum font size should not be excessive
      const maxFontSize = await page.evaluate(() => {
        const allText = document.querySelectorAll('.adaptive-card *');
        let maxSize = 0;

        allText.forEach(el => {
          const fontSize = parseFloat(window.getComputedStyle(el).fontSize);
          if (fontSize > maxSize) {
            maxSize = fontSize;
          }
        });

        return maxSize;
      });

      // Max font size should be reasonable (< 60px)
      expect(maxFontSize).toBeLessThan(60);
    }
  });

  test('should scale line-height proportionally', async ({
    page,
    containerHelper
  }) => {
    await containerHelper.resizeContainer('.adaptive-card-container', 300);
    await page.waitForTimeout(350);

    const smallLineHeight = await page.evaluate(() => {
      const p = document.querySelector('.adaptive-card p');
      if (!p) return null;
      return parseFloat(window.getComputedStyle(p).lineHeight);
    });

    await containerHelper.resizeContainer('.adaptive-card-container', 800);
    await page.waitForTimeout(350);

    const largeLineHeight = await page.evaluate(() => {
      const p = document.querySelector('.adaptive-card p');
      if (!p) return null;
      return parseFloat(window.getComputedStyle(p).lineHeight);
    });

    if (smallLineHeight && largeLineHeight) {
      // Line height should increase with container size
      expect(largeLineHeight).toBeGreaterThan(smallLineHeight);

      // But not disproportionately
      expect(largeLineHeight / smallLineHeight).toBeLessThan(2);
    }
  });

  test('should scale letter-spacing appropriately', async ({
    page,
    containerHelper
  }) => {
    const sizes = [300, 600, 900];

    for (const size of sizes) {
      await containerHelper.resizeContainer('.adaptive-card-container', size);
      await page.waitForTimeout(350);

      const letterSpacing = await page.evaluate(() => {
        const heading = document.querySelector('.adaptive-card h1, .adaptive-card h2');
        if (!heading) return null;
        return window.getComputedStyle(heading).letterSpacing;
      });

      // Letter spacing should be normal or slightly increased
      if (letterSpacing && letterSpacing !== 'normal') {
        const spacing = parseFloat(letterSpacing);
        expect(spacing).toBeGreaterThanOrEqual(-1);
        expect(spacing).toBeLessThan(5);
      }
    }
  });

  test('should scale container query units (cqw) proportionally', async ({
    page,
    containerHelper
  }) => {
    // Test padding that uses cqw units
    const testSizes = [
      { container: 200, expectedCqw: 2 },  // 2cqw = 4px at 200px
      { container: 400, expectedCqw: 2 },  // 2cqw = 8px at 400px
      { container: 800, expectedCqw: 2 }   // 2cqw = 16px at 800px
    ];

    for (const test of testSizes) {
      await containerHelper.resizeContainer('.adaptive-card-container', test.container);
      await page.waitForTimeout(350);

      const gap = await page.evaluate(() => {
        const card = document.querySelector('.adaptive-card');
        if (!card) return null;
        return parseFloat(window.getComputedStyle(card).gap || '0');
      });

      if (gap !== null) {
        // Calculate expected value: cqw% of container width
        const expected = (test.expectedCqw / 100) * test.container;

        // Allow for clamp() min/max bounds
        expect(gap).toBeGreaterThanOrEqual(expected * 0.3);
        expect(gap).toBeLessThanOrEqual(expected * 2);
      }
    }
  });

  test('should maintain text hierarchy across all sizes', async ({
    page,
    containerHelper
  }) => {
    const sizes = [250, 500, 1000];

    for (const size of sizes) {
      await containerHelper.resizeContainer('.adaptive-card-container', size);
      await page.waitForTimeout(350);

      const hierarchy = await page.evaluate(() => {
        const h1 = document.querySelector('.adaptive-card h1');
        const h2 = document.querySelector('.adaptive-card h2');
        const h3 = document.querySelector('.adaptive-card h3');
        const p = document.querySelector('.adaptive-card p');

        return {
          h1: h1 ? parseFloat(window.getComputedStyle(h1).fontSize) : null,
          h2: h2 ? parseFloat(window.getComputedStyle(h2).fontSize) : null,
          h3: h3 ? parseFloat(window.getComputedStyle(h3).fontSize) : null,
          p: p ? parseFloat(window.getComputedStyle(p).fontSize) : null
        };
      });

      // Verify hierarchy: h1 > h2 > h3 > p
      if (hierarchy.h1 && hierarchy.h2) {
        expect(hierarchy.h1).toBeGreaterThan(hierarchy.h2);
      }
      if (hierarchy.h2 && hierarchy.h3) {
        expect(hierarchy.h2).toBeGreaterThan(hierarchy.h3);
      }
      if (hierarchy.h3 && hierarchy.p) {
        expect(hierarchy.h3).toBeGreaterThan(hierarchy.p);
      }
    }
  });

  test('should scale images proportionally', async ({
    page,
    containerHelper
  }) => {
    const sizes = [300, 600, 900];

    for (const size of sizes) {
      await containerHelper.resizeContainer('.adaptive-card-container', size);
      await page.waitForTimeout(350);

      const imageSize = await page.evaluate(() => {
        const img = document.querySelector('.adaptive-card img');
        if (!img) return null;
        return {
          width: img.offsetWidth,
          height: img.offsetHeight,
          aspectRatio: img.offsetWidth / img.offsetHeight
        };
      });

      if (imageSize) {
        // Image should not exceed container width
        expect(imageSize.width).toBeLessThanOrEqual(size + 50); // Allow for padding

        // Aspect ratio should be maintained
        expect(imageSize.aspectRatio).toBeGreaterThan(0.5);
        expect(imageSize.aspectRatio).toBeLessThan(3);
      }
    }
  });

  test('should scale icon sizes appropriately', async ({
    page,
    containerHelper
  }) => {
    await containerHelper.resizeContainer('.adaptive-card-container', 250);
    await page.waitForTimeout(350);

    const smallIconSize = await page.evaluate(() => {
      const icon = document.querySelector('.adaptive-card .icon, .adaptive-card svg');
      if (!icon) return null;
      return Math.max(icon.offsetWidth, icon.offsetHeight);
    });

    await containerHelper.resizeContainer('.adaptive-card-container', 800);
    await page.waitForTimeout(350);

    const largeIconSize = await page.evaluate(() => {
      const icon = document.querySelector('.adaptive-card .icon, .adaptive-card svg');
      if (!icon) return null;
      return Math.max(icon.offsetWidth, icon.offsetHeight);
    });

    if (smallIconSize && largeIconSize) {
      // Icons should scale but stay within 16-32px range
      expect(smallIconSize).toBeGreaterThanOrEqual(16);
      expect(largeIconSize).toBeLessThanOrEqual(48);
      expect(largeIconSize).toBeGreaterThan(smallIconSize);
    }
  });

  test('should scale button sizes and padding', async ({
    page,
    containerHelper
  }) => {
    const sizes = [300, 600, 900];

    for (const size of sizes) {
      await containerHelper.resizeContainer('.adaptive-card-container', size);
      await page.waitForTimeout(350);

      const buttonMetrics = await page.evaluate(() => {
        const button = document.querySelector('.adaptive-card button, .adaptive-card .btn');
        if (!button) return null;

        const styles = window.getComputedStyle(button);
        return {
          fontSize: parseFloat(styles.fontSize),
          paddingTop: parseFloat(styles.paddingTop),
          paddingLeft: parseFloat(styles.paddingLeft)
        };
      });

      if (buttonMetrics) {
        // Buttons should be readable and tappable
        expect(buttonMetrics.fontSize).toBeGreaterThanOrEqual(14);
        expect(buttonMetrics.paddingTop).toBeGreaterThanOrEqual(6);
        expect(buttonMetrics.paddingLeft).toBeGreaterThanOrEqual(12);
      }
    }
  });

  test('should apply consistent spacing scale', async ({
    page,
    containerHelper
  }) => {
    await containerHelper.resizeContainer('.adaptive-card-container', 400);
    await page.waitForTimeout(350);

    const smallSpacing = await page.evaluate(() => {
      const card = document.querySelector('.adaptive-card');
      if (!card) return null;

      const styles = window.getComputedStyle(card);
      return {
        padding: parseFloat(styles.padding || '0'),
        margin: parseFloat(styles.margin || '0'),
        gap: parseFloat(styles.gap || '0')
      };
    });

    await containerHelper.resizeContainer('.adaptive-card-container', 800);
    await page.waitForTimeout(350);

    const largeSpacing = await page.evaluate(() => {
      const card = document.querySelector('.adaptive-card');
      if (!card) return null;

      const styles = window.getComputedStyle(card);
      return {
        padding: parseFloat(styles.padding || '0'),
        margin: parseFloat(styles.margin || '0'),
        gap: parseFloat(styles.gap || '0')
      };
    });

    // Spacing should scale proportionally
    if (smallSpacing && largeSpacing) {
      expect(largeSpacing.padding).toBeGreaterThanOrEqual(smallSpacing.padding);
      expect(largeSpacing.gap).toBeGreaterThanOrEqual(smallSpacing.gap);
    }
  });
});
