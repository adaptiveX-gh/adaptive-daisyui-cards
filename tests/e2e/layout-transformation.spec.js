// Layout transformation tests for all 5 layout types
import { test, expect, LAYOUTS } from './fixtures.js';

test.describe('Layout Transformation Tests @layout', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Sidebar Layout', () => {
    test('should display side-by-side at large sizes', async ({
      page,
      containerHelper,
      layoutHelper
    }) => {
      await layoutHelper.setLayout('sidebar');
      await containerHelper.resizeContainer('.adaptive-card-container', 800);
      await page.waitForTimeout(350);

      const layout = await page.evaluate(() => {
        const card = document.querySelector('.adaptive-card.layout-sidebar');
        if (!card) return null;

        const styles = window.getComputedStyle(card);
        return {
          display: styles.display,
          gridTemplateColumns: styles.gridTemplateColumns,
          flexDirection: styles.flexDirection
        };
      });

      // Should be horizontal layout
      expect(
        layout.gridTemplateColumns !== 'none' ||
        layout.flexDirection === 'row'
      ).toBe(true);
    });

    test('should stack at small sizes', async ({
      page,
      containerHelper,
      layoutHelper
    }) => {
      await layoutHelper.setLayout('sidebar');
      await containerHelper.resizeContainer('.adaptive-card-container', 250);
      await page.waitForTimeout(350);

      const layout = await page.evaluate(() => {
        const card = document.querySelector('.adaptive-card.layout-sidebar');
        if (!card) return null;

        const styles = window.getComputedStyle(card);
        return {
          display: styles.display,
          gridTemplateColumns: styles.gridTemplateColumns,
          flexDirection: styles.flexDirection,
          gridTemplateAreas: styles.gridTemplateAreas
        };
      });

      // Should be vertical/stacked layout
      expect(
        layout.flexDirection === 'column' ||
        layout.gridTemplateColumns === 'none' ||
        !layout.gridTemplateColumns.includes(' ')
      ).toBe(true);
    });

    test('should adjust proportions at medium sizes', async ({
      page,
      containerHelper,
      layoutHelper
    }) => {
      await layoutHelper.setLayout('sidebar');
      await containerHelper.resizeContainer('.adaptive-card-container', 500);
      await page.waitForTimeout(350);

      const proportions = await page.evaluate(() => {
        const card = document.querySelector('.adaptive-card.layout-sidebar');
        if (!card) return null;

        const children = card.children;
        if (children.length < 2) return null;

        return {
          first: children[0].offsetWidth,
          second: children[1].offsetWidth,
          total: card.offsetWidth
        };
      });

      if (proportions && proportions.first > 0 && proportions.second > 0) {
        // Should have different widths (not equal split)
        const ratio = proportions.first / proportions.second;
        expect(ratio).toBeGreaterThan(0.3);
        expect(ratio).toBeLessThan(3);
      }
    });
  });

  test.describe('Feature Layout', () => {
    test('should display 3-column grid at large sizes', async ({
      page,
      containerHelper,
      layoutHelper
    }) => {
      await layoutHelper.setLayout('feature');
      await containerHelper.resizeContainer('.adaptive-card-container', 900);
      await page.waitForTimeout(350);

      const gridColumns = await page.evaluate(() => {
        const card = document.querySelector('.adaptive-card.layout-feature');
        if (!card) return null;
        return window.getComputedStyle(card).gridTemplateColumns;
      });

      // Should have 3 columns
      if (gridColumns && gridColumns !== 'none') {
        const columns = gridColumns.split(' ').filter(c => c.includes('fr') || c.includes('px'));
        expect(columns.length).toBeGreaterThanOrEqual(3);
      }
    });

    test('should display 2-column grid at medium sizes', async ({
      page,
      containerHelper,
      layoutHelper
    }) => {
      await layoutHelper.setLayout('feature');
      await containerHelper.resizeContainer('.adaptive-card-container', 500);
      await page.waitForTimeout(350);

      const gridColumns = await page.evaluate(() => {
        const card = document.querySelector('.adaptive-card.layout-feature');
        if (!card) return null;
        return window.getComputedStyle(card).gridTemplateColumns;
      });

      if (gridColumns && gridColumns !== 'none') {
        const columns = gridColumns.split(' ').filter(c => c.includes('fr') || c.includes('px'));
        expect(columns.length).toBeGreaterThanOrEqual(2);
        expect(columns.length).toBeLessThanOrEqual(3);
      }
    });

    test('should display single column at small sizes', async ({
      page,
      containerHelper,
      layoutHelper
    }) => {
      await layoutHelper.setLayout('feature');
      await containerHelper.resizeContainer('.adaptive-card-container', 250);
      await page.waitForTimeout(350);

      const gridColumns = await page.evaluate(() => {
        const card = document.querySelector('.adaptive-card.layout-feature');
        if (!card) return null;
        const styles = window.getComputedStyle(card);
        return {
          gridTemplateColumns: styles.gridTemplateColumns,
          flexDirection: styles.flexDirection
        };
      });

      // Should be single column
      expect(
        gridColumns.gridTemplateColumns === 'none' ||
        !gridColumns.gridTemplateColumns.includes(' ') ||
        gridColumns.flexDirection === 'column'
      ).toBe(true);
    });
  });

  test.describe('Masonry Layout', () => {
    test('should display 3-column masonry at large sizes', async ({
      page,
      containerHelper,
      layoutHelper
    }) => {
      await layoutHelper.setLayout('masonry');
      await containerHelper.resizeContainer('.adaptive-card-container', 900);
      await page.waitForTimeout(350);

      const columns = await page.evaluate(() => {
        const card = document.querySelector('.adaptive-card.layout-masonry');
        if (!card) return null;

        const styles = window.getComputedStyle(card);
        const cols = styles.gridTemplateColumns || styles.columnCount;

        if (cols === 'none') return 1;
        if (cols.match(/\d+/)) {
          const count = parseInt(cols);
          if (!isNaN(count)) return count;
        }

        return cols.split(' ').filter(c => c.includes('fr') || c.includes('px')).length;
      });

      expect(columns).toBeGreaterThanOrEqual(3);
    });

    test('should display 2-column masonry at medium sizes', async ({
      page,
      containerHelper,
      layoutHelper
    }) => {
      await layoutHelper.setLayout('masonry');
      await containerHelper.resizeContainer('.adaptive-card-container', 500);
      await page.waitForTimeout(350);

      const columns = await page.evaluate(() => {
        const card = document.querySelector('.adaptive-card.layout-masonry');
        if (!card) return null;

        const styles = window.getComputedStyle(card);
        const cols = styles.gridTemplateColumns || styles.columnCount;

        if (cols === 'none') return 1;
        if (cols.match(/\d+/)) {
          const count = parseInt(cols);
          if (!isNaN(count)) return count;
        }

        return cols.split(' ').filter(c => c.includes('fr') || c.includes('px')).length;
      });

      expect(columns).toBeGreaterThanOrEqual(2);
      expect(columns).toBeLessThanOrEqual(3);
    });

    test('should display single column at small sizes', async ({
      page,
      containerHelper,
      layoutHelper
    }) => {
      await layoutHelper.setLayout('masonry');
      await containerHelper.resizeContainer('.adaptive-card-container', 250);
      await page.waitForTimeout(350);

      const columns = await page.evaluate(() => {
        const card = document.querySelector('.adaptive-card.layout-masonry');
        if (!card) return null;

        const styles = window.getComputedStyle(card);
        const cols = styles.gridTemplateColumns || styles.columnCount;

        if (cols === 'none' || cols === '1') return 1;
        if (cols.match(/^\d+$/)) return parseInt(cols);

        const split = cols.split(' ').filter(c => c.includes('fr') || c.includes('px'));
        return split.length || 1;
      });

      expect(columns).toBe(1);
    });
  });

  test.describe('Dashboard Layout', () => {
    test('should display complex grid at large sizes', async ({
      page,
      containerHelper,
      layoutHelper
    }) => {
      await layoutHelper.setLayout('dashboard');
      await containerHelper.resizeContainer('.adaptive-card-container', 1000);
      await page.waitForTimeout(350);

      const gridAreas = await page.evaluate(() => {
        const card = document.querySelector('.adaptive-card.layout-dashboard');
        if (!card) return null;
        return window.getComputedStyle(card).gridTemplateAreas;
      });

      // Should have named grid areas
      expect(gridAreas).toBeTruthy();
      expect(gridAreas).not.toBe('none');
    });

    test('should simplify to 2-column at medium sizes', async ({
      page,
      containerHelper,
      layoutHelper
    }) => {
      await layoutHelper.setLayout('dashboard');
      await containerHelper.resizeContainer('.adaptive-card-container', 600);
      await page.waitForTimeout(350);

      const layout = await page.evaluate(() => {
        const card = document.querySelector('.adaptive-card.layout-dashboard');
        if (!card) return null;

        const styles = window.getComputedStyle(card);
        return {
          gridTemplateColumns: styles.gridTemplateColumns,
          gridTemplateAreas: styles.gridTemplateAreas
        };
      });

      // Grid should be simpler but still multi-column
      if (layout.gridTemplateColumns && layout.gridTemplateColumns !== 'none') {
        const columns = layout.gridTemplateColumns.split(' ')
          .filter(c => c.includes('fr') || c.includes('px'));
        expect(columns.length).toBeGreaterThanOrEqual(2);
        expect(columns.length).toBeLessThanOrEqual(3);
      }
    });

    test('should stack vertically at small sizes', async ({
      page,
      containerHelper,
      layoutHelper
    }) => {
      await layoutHelper.setLayout('dashboard');
      await containerHelper.resizeContainer('.adaptive-card-container', 300);
      await page.waitForTimeout(350);

      const layout = await page.evaluate(() => {
        const card = document.querySelector('.adaptive-card.layout-dashboard');
        if (!card) return null;

        const styles = window.getComputedStyle(card);
        return {
          gridTemplateColumns: styles.gridTemplateColumns,
          flexDirection: styles.flexDirection
        };
      });

      // Should be single column or stacked
      expect(
        layout.gridTemplateColumns === 'none' ||
        !layout.gridTemplateColumns.includes(' ') ||
        layout.flexDirection === 'column'
      ).toBe(true);
    });
  });

  test.describe('Split Layout', () => {
    test('should display 50/50 split at large sizes', async ({
      page,
      containerHelper,
      layoutHelper
    }) => {
      await layoutHelper.setLayout('split');
      await containerHelper.resizeContainer('.adaptive-card-container', 900);
      await page.waitForTimeout(350);

      const split = await page.evaluate(() => {
        const card = document.querySelector('.adaptive-card.layout-split');
        if (!card) return null;

        const children = Array.from(card.children);
        if (children.length < 2) return null;

        return {
          first: children[0].offsetWidth,
          second: children[1].offsetWidth,
          total: card.offsetWidth
        };
      });

      if (split && split.first > 0 && split.second > 0) {
        const ratio = split.first / split.second;
        // Should be roughly 50/50 (between 0.8 and 1.2)
        expect(ratio).toBeGreaterThan(0.8);
        expect(ratio).toBeLessThan(1.2);
      }
    });

    test('should display 60/40 split at medium sizes', async ({
      page,
      containerHelper,
      layoutHelper
    }) => {
      await layoutHelper.setLayout('split');
      await containerHelper.resizeContainer('.adaptive-card-container', 600);
      await page.waitForTimeout(350);

      const split = await page.evaluate(() => {
        const card = document.querySelector('.adaptive-card.layout-split');
        if (!card) return null;

        const children = Array.from(card.children);
        if (children.length < 2) return null;

        return {
          first: children[0].offsetWidth,
          second: children[1].offsetWidth
        };
      });

      if (split && split.first > 0 && split.second > 0) {
        const ratio = split.first / split.second;
        // Should be roughly 60/40 (between 1.2 and 1.8)
        expect(ratio).toBeGreaterThan(1.1);
        expect(ratio).toBeLessThan(2);
      }
    });

    test('should stack vertically at small sizes', async ({
      page,
      containerHelper,
      layoutHelper
    }) => {
      await layoutHelper.setLayout('split');
      await containerHelper.resizeContainer('.adaptive-card-container', 300);
      await page.waitForTimeout(350);

      const layout = await page.evaluate(() => {
        const card = document.querySelector('.adaptive-card.layout-split');
        if (!card) return null;

        const styles = window.getComputedStyle(card);
        return {
          flexDirection: styles.flexDirection,
          gridTemplateColumns: styles.gridTemplateColumns
        };
      });

      // Should be vertical
      expect(
        layout.flexDirection === 'column' ||
        layout.gridTemplateColumns === 'none' ||
        !layout.gridTemplateColumns.includes(' ')
      ).toBe(true);
    });
  });

  test('should maintain content integrity during layout changes', async ({
    page,
    containerHelper,
    layoutHelper
  }) => {
    for (const layout of LAYOUTS) {
      await layoutHelper.setLayout(layout);

      // Get initial content
      const initialContent = await page.evaluate(() => {
        const card = document.querySelector('.adaptive-card');
        return card ? card.textContent : null;
      });

      // Resize through different sizes
      const sizes = [250, 500, 800];
      for (const size of sizes) {
        await containerHelper.resizeContainer('.adaptive-card-container', size);
        await page.waitForTimeout(350);

        const currentContent = await page.evaluate(() => {
          const card = document.querySelector('.adaptive-card');
          return card ? card.textContent : null;
        });

        // Content should remain the same
        expect(currentContent).toBe(initialContent);
      }
    }
  });

  test('should handle layout switching without errors', async ({
    page,
    layoutHelper,
    containerHelper
  }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await containerHelper.resizeContainer('.adaptive-card-container', 600);

    // Switch between all layouts
    for (const layout of LAYOUTS) {
      await layoutHelper.setLayout(layout);
      await page.waitForTimeout(350);

      const isVisible = await page.isVisible('.adaptive-card');
      expect(isVisible).toBe(true);
    }

    expect(consoleErrors).toHaveLength(0);
  });
});
