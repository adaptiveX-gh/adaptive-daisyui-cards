// Hero Split Layout Tests
// Comprehensive tests for the 6th layout type
import { test, expect } from './fixtures.js';

const CUSTOM_THEMES = [
  '',
  'theme-dark-gradient',
  'theme-light-elegant',
  'theme-neon-accent',
  'theme-minimal',
  'theme-brand'
];

test.describe('Hero Split Layout @layout @hero-split', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Setup hero-split layout
    await page.evaluate(() => {
      const card = document.querySelector('.adaptive-card');
      if (card) {
        card.className = 'adaptive-card layout-hero-split';
        card.innerHTML = `
          <div class="hero-content">
            <h1>Hero Heading</h1>
            <p>This is a compelling description that scales with container size.</p>
            <div class="hero-actions">
              <button class="btn btn-primary">Primary Action</button>
              <button class="btn btn-outline">Secondary</button>
            </div>
          </div>
          <div class="hero-image">
            <img src="https://picsum.photos/800/600" alt="Hero image" />
          </div>
        `;
      }
    });

    await page.waitForTimeout(200);
  });

  test.describe('Responsive Layout Behavior', () => {

    test('renders 40/60 split at large sizes (>600px)', async ({ page, containerHelper }) => {
      // Set container to large size
      await containerHelper.resizeContainer('.adaptive-card-container', 800);

      const layout = await page.evaluate(() => {
        const card = document.querySelector('.layout-hero-split');
        const computed = window.getComputedStyle(card);

        return {
          gridTemplateColumns: computed.gridTemplateColumns,
          gridTemplateAreas: computed.gridTemplateAreas,
          display: computed.display,
        };
      });

      expect(layout.display).toBe('grid');
      expect(layout.gridTemplateColumns).toContain('2fr 3fr');
      expect(layout.gridTemplateAreas).toContain('content');
      expect(layout.gridTemplateAreas).toContain('image');
    });

    test('renders side-by-side at large sizes', async ({ page, containerHelper }) => {
      await containerHelper.resizeContainer('.adaptive-card-container', 800);

      const positions = await page.evaluate(() => {
        const content = document.querySelector('.hero-content');
        const image = document.querySelector('.hero-image');

        if (!content || !image) return null;

        const contentRect = content.getBoundingClientRect();
        const imageRect = image.getBoundingClientRect();

        return {
          contentTop: contentRect.top,
          imageTop: imageRect.top,
          contentLeft: contentRect.left,
          imageLeft: imageRect.left,
          sameRow: Math.abs(contentRect.top - imageRect.top) < 10,
          contentBeforeImage: contentRect.left < imageRect.left,
        };
      });

      expect(positions.sameRow).toBe(true);
      expect(positions.contentBeforeImage).toBe(true);
    });

    test('stacks vertically at small sizes (<600px)', async ({ page, containerHelper }) => {
      // Set container to small size
      await containerHelper.resizeContainer('.adaptive-card-container', 400);

      const layout = await page.evaluate(() => {
        const card = document.querySelector('.layout-hero-split');
        const computed = window.getComputedStyle(card);

        return {
          gridTemplateRows: computed.gridTemplateRows,
          gridTemplateAreas: computed.gridTemplateAreas,
          gridTemplateColumns: computed.gridTemplateColumns,
        };
      });

      // Should have row-based template areas in stacked mode
      expect(layout.gridTemplateAreas).toContain('content');
      expect(layout.gridTemplateAreas).toContain('image');
    });

    test('content is above image when stacked', async ({ page, containerHelper }) => {
      await containerHelper.resizeContainer('.adaptive-card-container', 400);

      const positions = await page.evaluate(() => {
        const content = document.querySelector('.hero-content');
        const image = document.querySelector('.hero-image');

        if (!content || !image) return null;

        const contentRect = content.getBoundingClientRect();
        const imageRect = image.getBoundingClientRect();

        return {
          contentTop: contentRect.top,
          imageTop: imageRect.top,
          contentAboveImage: contentRect.bottom <= imageRect.top + 10,
        };
      });

      expect(positions.contentAboveImage).toBe(true);
    });

    test('switches layout at 600px breakpoint', async ({ page, containerHelper }) => {
      // Test just below breakpoint
      await containerHelper.resizeContainer('.adaptive-card-container', 599);

      const smallLayout = await page.evaluate(() => {
        const content = document.querySelector('.hero-content');
        const image = document.querySelector('.hero-image');
        const contentRect = content.getBoundingClientRect();
        const imageRect = image.getBoundingClientRect();

        return {
          stacked: Math.abs(contentRect.left - imageRect.left) < 10,
        };
      });

      // Test just above breakpoint
      await containerHelper.resizeContainer('.adaptive-card-container', 601);

      const largeLayout = await page.evaluate(() => {
        const content = document.querySelector('.hero-content');
        const image = document.querySelector('.hero-image');
        const contentRect = content.getBoundingClientRect();
        const imageRect = image.getBoundingClientRect();

        return {
          sideBySide: Math.abs(contentRect.top - imageRect.top) < 10,
        };
      });

      expect(smallLayout.stacked).toBe(true);
      expect(largeLayout.sideBySide).toBe(true);
    });

  });

  test.describe('Typography Scaling', () => {

    test('heading scales with container (clamp 1.75rem to 3rem)', async ({ page, containerHelper }) => {
      const sizes = [400, 600, 800, 1000];
      const headingSizes = [];

      for (const size of sizes) {
        await containerHelper.resizeContainer('.adaptive-card-container', size);

        const fontSize = await page.evaluate(() => {
          const heading = document.querySelector('.layout-hero-split h1');
          if (!heading) return null;
          const computed = window.getComputedStyle(heading);
          return parseFloat(computed.fontSize);
        });

        headingSizes.push({ containerSize: size, fontSize });
      }

      // Font size should increase with container size
      for (let i = 1; i < headingSizes.length; i++) {
        expect(headingSizes[i].fontSize).toBeGreaterThanOrEqual(headingSizes[i - 1].fontSize);
      }

      // Should be within clamp range (1.75rem = 28px, 3rem = 48px)
      headingSizes.forEach(({ fontSize }) => {
        expect(fontSize).toBeGreaterThanOrEqual(28);
        expect(fontSize).toBeLessThanOrEqual(48);
      });
    });

    test('paragraph scales with container (clamp 1rem to 1.25rem)', async ({ page, containerHelper }) => {
      const sizes = [400, 800, 1200];
      const paragraphSizes = [];

      for (const size of sizes) {
        await containerHelper.resizeContainer('.adaptive-card-container', size);

        const fontSize = await page.evaluate(() => {
          const paragraph = document.querySelector('.layout-hero-split p');
          if (!paragraph) return null;
          const computed = window.getComputedStyle(paragraph);
          return parseFloat(computed.fontSize);
        });

        paragraphSizes.push({ containerSize: size, fontSize });
      }

      // Should be within clamp range (1rem = 16px, 1.25rem = 20px)
      paragraphSizes.forEach(({ fontSize }) => {
        expect(fontSize).toBeGreaterThanOrEqual(16);
        expect(fontSize).toBeLessThanOrEqual(20);
      });
    });

    test('content padding scales (clamp 2rem to 4rem)', async ({ page, containerHelper }) => {
      const sizes = [400, 800, 1200];
      const paddingSizes = [];

      for (const size of sizes) {
        await containerHelper.resizeContainer('.adaptive-card-container', size);

        const padding = await page.evaluate(() => {
          const content = document.querySelector('.hero-content');
          if (!content) return null;
          const computed = window.getComputedStyle(content);
          return parseFloat(computed.paddingTop);
        });

        paddingSizes.push({ containerSize: size, padding });
      }

      // Should be within clamp range (2rem = 32px, 4rem = 64px)
      paddingSizes.forEach(({ padding }) => {
        expect(padding).toBeGreaterThanOrEqual(32);
        expect(padding).toBeLessThanOrEqual(64);
      });
    });

  });

  test.describe('Image Behavior', () => {

    test('image maintains aspect ratio with object-fit: cover', async ({ page, containerHelper }) => {
      const sizes = [400, 600, 800, 1000];

      for (const size of sizes) {
        await containerHelper.resizeContainer('.adaptive-card-container', size);

        const imageStyle = await page.evaluate(() => {
          const img = document.querySelector('.hero-image img');
          if (!img) return null;

          const computed = window.getComputedStyle(img);
          return {
            objectFit: computed.objectFit,
            width: img.offsetWidth,
            height: img.offsetHeight,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
          };
        });

        expect(imageStyle.objectFit).toBe('cover');
        expect(imageStyle.width).toBeGreaterThan(0);
        expect(imageStyle.height).toBeGreaterThan(0);
      }
    });

    test('image fills container at all sizes', async ({ page, containerHelper }) => {
      const sizes = [400, 800, 1200];

      for (const size of sizes) {
        await containerHelper.resizeContainer('.adaptive-card-container', size);

        const fillsContainer = await page.evaluate(() => {
          const heroImage = document.querySelector('.hero-image');
          const img = heroImage?.querySelector('img');

          if (!heroImage || !img) return false;

          const containerRect = heroImage.getBoundingClientRect();
          const imgRect = img.getBoundingClientRect();

          // Image should fill the hero-image container
          return {
            widthMatches: Math.abs(imgRect.width - containerRect.width) < 2,
            heightMatches: Math.abs(imgRect.height - containerRect.height) < 2,
            containerWidth: containerRect.width,
            containerHeight: containerRect.height,
          };
        });

        expect(fillsContainer.widthMatches).toBe(true);
        expect(fillsContainer.heightMatches).toBe(true);
      }
    });

    test('hero-image container has overflow hidden', async ({ page }) => {
      const overflow = await page.evaluate(() => {
        const heroImage = document.querySelector('.hero-image');
        if (!heroImage) return null;
        const computed = window.getComputedStyle(heroImage);
        return computed.overflow;
      });

      expect(overflow).toBe('hidden');
    });

  });

  test.describe('Content Alignment', () => {

    test('content is vertically centered', async ({ page, containerHelper }) => {
      await containerHelper.resizeContainer('.adaptive-card-container', 800);

      const alignment = await page.evaluate(() => {
        const content = document.querySelector('.hero-content');
        if (!content) return null;

        const computed = window.getComputedStyle(content);
        return {
          display: computed.display,
          justifyContent: computed.justifyContent,
          flexDirection: computed.flexDirection,
        };
      });

      expect(alignment.display).toBe('flex');
      expect(alignment.flexDirection).toBe('column');
      expect(alignment.justifyContent).toBe('center');
    });

    test('hero-actions have proper spacing', async ({ page }) => {
      const actionsLayout = await page.evaluate(() => {
        const actions = document.querySelector('.hero-actions');
        if (!actions) return null;

        const computed = window.getComputedStyle(actions);
        return {
          display: computed.display,
          gap: computed.gap,
          flexWrap: computed.flexWrap,
          marginTop: parseFloat(computed.marginTop),
        };
      });

      expect(actionsLayout.display).toBe('flex');
      expect(actionsLayout.flexWrap).toBe('wrap');
      expect(actionsLayout.marginTop).toBeGreaterThan(20); // Should have top margin
    });

  });

  test.describe('Theme Integration', () => {

    test('works with all 6 theme options', async ({ page }) => {
      const results = [];

      for (const theme of CUSTOM_THEMES) {
        // Apply theme
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
            card.parentNode.insertBefore(wrapper, card);
            wrapper.appendChild(card);
          }
        }, theme);

        await page.waitForTimeout(200);

        // Verify renders correctly
        const result = await page.evaluate(() => {
          const card = document.querySelector('.adaptive-card');
          const content = document.querySelector('.hero-content');
          const image = document.querySelector('.hero-image');

          if (!card || !content || !image) return { success: false };

          const cardRect = card.getBoundingClientRect();
          const computed = window.getComputedStyle(card);

          return {
            success: true,
            isVisible: cardRect.width > 0 && cardRect.height > 0,
            hasBackground: computed.backgroundColor !== 'rgba(0, 0, 0, 0)' ||
                          computed.backgroundImage !== 'none',
          };
        });

        results.push({
          theme: theme || 'none',
          ...result,
        });

        expect(result.success).toBe(true);
        expect(result.isVisible).toBe(true);
      }

      // All themes should work
      const successCount = results.filter(r => r.success).length;
      expect(successCount).toBe(6);
    });

    test('theme changes appearance but not layout structure', async ({ page, containerHelper }) => {
      await containerHelper.resizeContainer('.adaptive-card-container', 800);

      // Get structure without theme
      const initialStructure = await page.evaluate(() => {
        const card = document.querySelector('.layout-hero-split');
        const computed = window.getComputedStyle(card);
        const content = document.querySelector('.hero-content');
        const image = document.querySelector('.hero-image');

        return {
          gridTemplateColumns: computed.gridTemplateColumns,
          contentLeft: content.getBoundingClientRect().left,
          imageLeft: image.getBoundingClientRect().left,
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

      // Get structure with theme
      const themedStructure = await page.evaluate(() => {
        const card = document.querySelector('.layout-hero-split');
        const computed = window.getComputedStyle(card);
        const content = document.querySelector('.hero-content');
        const image = document.querySelector('.hero-image');

        return {
          gridTemplateColumns: computed.gridTemplateColumns,
          contentLeft: content.getBoundingClientRect().left,
          imageLeft: image.getBoundingClientRect().left,
        };
      });

      // Structure should be unchanged
      expect(themedStructure.gridTemplateColumns).toBe(initialStructure.gridTemplateColumns);
      expect(Math.abs(themedStructure.contentLeft - initialStructure.contentLeft)).toBeLessThan(2);
      expect(Math.abs(themedStructure.imageLeft - initialStructure.imageLeft)).toBeLessThan(2);
    });

  });

  test.describe('Edge Cases', () => {

    test('handles missing image gracefully', async ({ page }) => {
      await page.evaluate(() => {
        const img = document.querySelector('.hero-image img');
        if (img) img.remove();
      });

      await page.waitForTimeout(200);

      const isStillVisible = await page.evaluate(() => {
        const card = document.querySelector('.adaptive-card');
        const content = document.querySelector('.hero-content');

        return {
          cardVisible: card && card.offsetWidth > 0,
          contentVisible: content && content.offsetWidth > 0,
        };
      });

      expect(isStillVisible.cardVisible).toBe(true);
      expect(isStillVisible.contentVisible).toBe(true);
    });

    test('handles long content gracefully', async ({ page, containerHelper }) => {
      await page.evaluate(() => {
        const content = document.querySelector('.hero-content');
        if (content) {
          content.querySelector('p').textContent = 'Lorem ipsum dolor sit amet, '.repeat(50);
        }
      });

      await page.waitForTimeout(200);

      const noOverflow = await page.evaluate(() => {
        const card = document.querySelector('.layout-hero-split');
        const computed = window.getComputedStyle(card);
        return {
          overflow: computed.overflow,
          isVisible: card.offsetWidth > 0 && card.offsetHeight > 0,
        };
      });

      expect(noOverflow.isVisible).toBe(true);
    });

    test('handles responsive resize smoothly', async ({ page, containerHelper }) => {
      const sizes = [800, 400, 600, 900, 300, 700];

      for (const size of sizes) {
        await containerHelper.resizeContainer('.adaptive-card-container', size);

        const isValid = await page.evaluate(() => {
          const card = document.querySelector('.adaptive-card');
          const content = document.querySelector('.hero-content');
          const image = document.querySelector('.hero-image');

          return {
            allVisible: card && content && image &&
                       card.offsetWidth > 0 &&
                       content.offsetWidth > 0 &&
                       image.offsetWidth > 0,
          };
        });

        expect(isValid.allVisible).toBe(true);
      }
    });

  });

  test.describe('Visual Regression', () => {

    test('matches snapshot at 800px with default theme', async ({ page, containerHelper }) => {
      await containerHelper.resizeContainer('.adaptive-card-container', 800);

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

      expect(screenshot).toMatchSnapshot('hero-split-800px-default.png', {
        maxDiffPixels: 100,
        threshold: 0.2,
      });
    });

    test('matches snapshot at 400px stacked', async ({ page, containerHelper }) => {
      await containerHelper.resizeContainer('.adaptive-card-container', 400);

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

      expect(screenshot).toMatchSnapshot('hero-split-400px-stacked.png', {
        maxDiffPixels: 100,
        threshold: 0.2,
      });
    });

  });

});
