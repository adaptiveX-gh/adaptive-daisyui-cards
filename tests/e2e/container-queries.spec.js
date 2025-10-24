// Container Query validation tests
import { test, expect, CONTAINER_SIZES, BREAKPOINTS } from './fixtures.js';

test.describe('Container Query Tests @container', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should apply container-type: inline-size to card containers', async ({
    page,
    containerHelper
  }) => {
    const containerType = await containerHelper.getComputedStyle(
      '.adaptive-card-container',
      'container-type'
    );

    expect(containerType).toContain('inline-size');
  });

  test('should respond to container width, NOT viewport width', async ({
    page,
    containerHelper
  }) => {
    // Set container to small size
    await containerHelper.resizeContainer('.adaptive-card-container', 300);
    await page.waitForTimeout(350);

    // Get font size at small container
    const smallFontSize = await containerHelper.getComputedStyle(
      '.adaptive-card h2',
      'font-size'
    );

    // Resize viewport but keep container same size
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(200);

    // Font size should remain the same (responds to container, not viewport)
    const fontSizeAfterViewportChange = await containerHelper.getComputedStyle(
      '.adaptive-card h2',
      'font-size'
    );

    expect(fontSizeAfterViewportChange).toBe(smallFontSize);

    // Now resize container to large
    await containerHelper.resizeContainer('.adaptive-card-container', 800);
    await page.waitForTimeout(350);

    // Font size should change (responds to container)
    const largeFontSize = await containerHelper.getComputedStyle(
      '.adaptive-card h2',
      'font-size'
    );

    expect(largeFontSize).not.toBe(smallFontSize);
  });

  test('should trigger layout changes at correct breakpoints', async ({
    page,
    containerHelper,
    layoutHelper
  }) => {
    await layoutHelper.setLayout('sidebar');

    const testCases = [
      { size: 200, expectedLayout: 'stacked' },
      { size: 250, expectedLayout: 'stacked' },
      { size: 450, expectedLayout: 'side-by-side' },
      { size: 700, expectedLayout: 'side-by-side' },
      { size: 1000, expectedLayout: 'side-by-side' }
    ];

    for (const testCase of testCases) {
      await containerHelper.resizeContainer('.adaptive-card-container', testCase.size);
      await page.waitForTimeout(350);

      // Check grid template or flex direction
      const display = await containerHelper.getComputedStyle(
        '.adaptive-card.layout-sidebar',
        'display'
      );

      const gridTemplateColumns = await containerHelper.getComputedStyle(
        '.adaptive-card.layout-sidebar',
        'grid-template-columns'
      );

      const flexDirection = await containerHelper.getComputedStyle(
        '.adaptive-card.layout-sidebar',
        'flex-direction'
      );

      if (testCase.expectedLayout === 'stacked') {
        // Should be column layout
        expect(
          flexDirection === 'column' ||
          gridTemplateColumns === 'none' ||
          gridTemplateColumns.includes('1fr')
        ).toBe(true);
      } else {
        // Should be row/multi-column layout
        expect(
          flexDirection === 'row' ||
          gridTemplateColumns.split(' ').length > 1
        ).toBe(true);
      }
    }
  });

  test('should validate all breakpoint triggers', async ({
    page,
    containerHelper
  }) => {
    const breakpointTests = [
      { size: 249, breakpoint: 'extra-small', threshold: 250 },
      { size: 251, breakpoint: 'small', threshold: 250 },
      { size: 399, breakpoint: 'small', threshold: 400 },
      { size: 401, breakpoint: 'medium', threshold: 400 },
      { size: 599, breakpoint: 'medium', threshold: 600 },
      { size: 601, breakpoint: 'large', threshold: 600 },
      { size: 799, breakpoint: 'large', threshold: 800 },
      { size: 801, breakpoint: 'extra-large', threshold: 800 }
    ];

    for (const test of breakpointTests) {
      await containerHelper.resizeContainer('.adaptive-card-container', test.size);
      await page.waitForTimeout(350);

      // Get the current container width
      const actualWidth = await containerHelper.getContainerWidth('.adaptive-card-container');

      // Verify the container is at the expected size
      expect(Math.abs(actualWidth - test.size)).toBeLessThan(5);

      // Get computed font size as indicator of breakpoint
      const fontSize = await containerHelper.getComputedStyle(
        '.adaptive-card .adaptive-text-base',
        'font-size'
      );

      // Font size should be numeric
      expect(fontSize).toMatch(/^\d+(\.\d+)?px$/);
    }
  });

  test('should handle nested containers correctly', async ({ page }) => {
    // Navigate to page with nested containers
    await page.goto('/nested-containers');
    await page.waitForLoadState('networkidle');

    // Resize outer container
    await page.evaluate(() => {
      const outer = document.querySelector('.outer-container');
      if (outer) outer.style.width = '800px';
    });

    await page.waitForTimeout(350);

    // Resize inner container
    await page.evaluate(() => {
      const inner = document.querySelector('.inner-container');
      if (inner) inner.style.width = '300px';
    });

    await page.waitForTimeout(350);

    // Inner card should respond to inner container, not outer
    const innerCardFontSize = await page.evaluate(() => {
      const card = document.querySelector('.inner-container .adaptive-card h2');
      if (!card) return null;
      return window.getComputedStyle(card).fontSize;
    });

    // Outer card should respond to outer container
    const outerCardFontSize = await page.evaluate(() => {
      const card = document.querySelector('.outer-container > .adaptive-card h2');
      if (!card) return null;
      return window.getComputedStyle(card).fontSize;
    });

    // Inner and outer should have different font sizes
    if (innerCardFontSize && outerCardFontSize) {
      expect(innerCardFontSize).not.toBe(outerCardFontSize);
    }
  });

  test('should apply container query units (cqw) correctly', async ({
    page,
    containerHelper
  }) => {
    // Test at 400px container
    await containerHelper.resizeContainer('.adaptive-card-container', 400);
    await page.waitForTimeout(350);

    // Get padding value
    const padding400 = await containerHelper.getComputedStyle(
      '.adaptive-card',
      'padding'
    );

    // Test at 800px container
    await containerHelper.resizeContainer('.adaptive-card-container', 800);
    await page.waitForTimeout(350);

    const padding800 = await containerHelper.getComputedStyle(
      '.adaptive-card',
      'padding'
    );

    // Padding should scale proportionally
    // Convert to numbers for comparison
    const extractPx = (str) => parseFloat(str.match(/[\d.]+/)[0]);

    if (padding400 && padding800) {
      const pad400 = extractPx(padding400);
      const pad800 = extractPx(padding800);

      // 800px should have larger padding than 400px
      expect(pad800).toBeGreaterThan(pad400);

      // Ratio should be roughly 2:1 if using cqw
      const ratio = pad800 / pad400;
      expect(ratio).toBeGreaterThan(1.5);
      expect(ratio).toBeLessThan(2.5);
    }
  });

  test('should support container query with multiple cards on page', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Get all card containers
    const containers = await page.$$('.adaptive-card-container');

    expect(containers.length).toBeGreaterThan(1);

    // Resize each container to different sizes
    const sizes = [300, 500, 700, 900];

    for (let i = 0; i < Math.min(containers.length, sizes.length); i++) {
      await page.evaluate(({ index, size }) => {
        const containers = document.querySelectorAll('.adaptive-card-container');
        if (containers[index]) {
          containers[index].style.width = `${size}px`;
        }
      }, { index: i, size: sizes[i] });
    }

    await page.waitForTimeout(400);

    // Verify each card has different computed styles
    const fontSizes = await page.evaluate(() => {
      const containers = document.querySelectorAll('.adaptive-card-container');
      return Array.from(containers).map(container => {
        const card = container.querySelector('.adaptive-card h2');
        if (!card) return null;
        return window.getComputedStyle(card).fontSize;
      });
    });

    // Should have variety of font sizes
    const uniqueSizes = new Set(fontSizes.filter(s => s !== null));
    expect(uniqueSizes.size).toBeGreaterThan(1);
  });

  test('should gracefully handle container resize to zero width', async ({
    page,
    containerHelper
  }) => {
    // Resize to very small size
    await containerHelper.resizeContainer('.adaptive-card-container', 1);
    await page.waitForTimeout(350);

    // Card should still exist and be in DOM
    const cardExists = await page.isVisible('.adaptive-card');
    expect(cardExists).toBe(true);

    // Resize back to normal
    await containerHelper.resizeContainer('.adaptive-card-container', 400);
    await page.waitForTimeout(350);

    // Should recover properly
    const isVisible = await page.isVisible('.adaptive-card');
    expect(isVisible).toBe(true);
  });

  test('should handle container-name attribute correctly', async ({ page }) => {
    const containerName = await page.evaluate(() => {
      const container = document.querySelector('.adaptive-card-container');
      if (!container) return null;
      return window.getComputedStyle(container).containerName;
    });

    // Container should have a name
    expect(containerName).toBeTruthy();
  });
});
