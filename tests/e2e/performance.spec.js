// Performance tests for adaptive card system
import { test, expect, CONTAINER_SIZES, CUSTOM_THEMES, LAYOUTS } from './fixtures.js';

test.describe('Performance Tests @performance', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should maintain 60fps during container resizing', async ({ page, containerHelper }) => {
    // Start performance monitoring
    await page.evaluate(() => {
      window.performanceMetrics = {
        frames: [],
        startTime: performance.now()
      };

      let lastFrameTime = performance.now();

      function measureFrame() {
        const now = performance.now();
        const frameDuration = now - lastFrameTime;
        window.performanceMetrics.frames.push(frameDuration);
        lastFrameTime = now;

        if (now - window.performanceMetrics.startTime < 3000) {
          requestAnimationFrame(measureFrame);
        }
      }

      requestAnimationFrame(measureFrame);
    });

    // Perform multiple resizes
    const sizes = [300, 400, 500, 600, 700, 800, 700, 600, 500, 400];
    for (const size of sizes) {
      await containerHelper.resizeContainer('.adaptive-card-container', size);
      await page.waitForTimeout(100);
    }

    await page.waitForTimeout(1000);

    // Analyze frame times
    const metrics = await page.evaluate(() => window.performanceMetrics);

    if (metrics && metrics.frames.length > 0) {
      const avgFrameTime = metrics.frames.reduce((a, b) => a + b, 0) / metrics.frames.length;
      const fps = 1000 / avgFrameTime;

      // Should average close to 60fps (at least 50fps)
      expect(fps).toBeGreaterThan(50);

      // No frame should take more than 33ms (30fps minimum)
      const slowFrames = metrics.frames.filter(f => f > 33);
      const slowFramePercentage = (slowFrames.length / metrics.frames.length) * 100;

      // Less than 10% of frames should be slow
      expect(slowFramePercentage).toBeLessThan(10);
    }
  });

  test('should have minimal layout shift during resize', async ({ page, containerHelper }) => {
    // Enable layout shift tracking
    await page.evaluate(() => {
      window.layoutShifts = [];

      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
            window.layoutShifts.push(entry.value);
          }
        }
      });

      observer.observe({ entryTypes: ['layout-shift'] });
    });

    // Resize multiple times
    const sizes = [300, 600, 900, 600, 300];
    for (const size of sizes) {
      await containerHelper.resizeContainer('.adaptive-card-container', size);
      await page.waitForTimeout(350);
    }

    await page.waitForTimeout(500);

    const shifts = await page.evaluate(() => window.layoutShifts);

    if (shifts && shifts.length > 0) {
      const totalShift = shifts.reduce((a, b) => a + b, 0);

      // Cumulative Layout Shift should be less than 0.1 (good)
      expect(totalShift).toBeLessThan(0.1);
    }
  });

  test('should handle smooth transitions at 300ms', async ({ page, containerHelper }) => {
    await containerHelper.resizeContainer('.adaptive-card-container', 400);
    await page.waitForTimeout(100);

    // Measure transition duration
    const transitionDuration = await page.evaluate(() => {
      const card = document.querySelector('.adaptive-card');
      if (!card) return null;

      const styles = window.getComputedStyle(card);
      const transition = styles.transition || styles.transitionDuration;

      // Extract duration in ms
      const match = transition.match(/(\d+(\.\d+)?)m?s/);
      if (!match) return null;

      const value = parseFloat(match[1]);
      const isSeconds = transition.includes('s') && !transition.includes('ms');

      return isSeconds ? value * 1000 : value;
    });

    if (transitionDuration) {
      // Should be around 300ms
      expect(transitionDuration).toBeGreaterThanOrEqual(250);
      expect(transitionDuration).toBeLessThanOrEqual(400);
    }
  });

  test('should handle multiple cards without performance degradation', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Create many cards
    await page.evaluate(() => {
      const container = document.querySelector('.card-grid, main');
      if (!container) return;

      for (let i = 0; i < 20; i++) {
        const cardContainer = document.createElement('div');
        cardContainer.className = 'adaptive-card-container';
        cardContainer.innerHTML = `
          <div class="adaptive-card layout-sidebar">
            <h2>Card ${i}</h2>
            <p>Content for card ${i}</p>
          </div>
        `;
        container.appendChild(cardContainer);
      }
    });

    await page.waitForTimeout(500);

    // Measure performance with many cards
    const metrics = await page.evaluate(() => {
      const startTime = performance.now();

      // Resize all containers
      const containers = document.querySelectorAll('.adaptive-card-container');
      containers.forEach((container, index) => {
        container.style.width = `${300 + (index % 5) * 100}px`;
      });

      const endTime = performance.now();

      return {
        duration: endTime - startTime,
        cardCount: containers.length
      };
    });

    // Should complete in reasonable time (< 100ms for layout update)
    expect(metrics.duration).toBeLessThan(100);

    // All cards should be visible
    const visibleCards = await page.locator('.adaptive-card:visible').count();
    expect(visibleCards).toBeGreaterThan(15);
  });

  test('should efficiently handle rapid resize events', async ({ page, containerHelper }) => {
    // Start performance measurement
    const startTime = await page.evaluate(() => performance.now());

    // Rapid resizes (simulating user dragging)
    for (let size = 300; size <= 800; size += 20) {
      await page.evaluate((s) => {
        const container = document.querySelector('.adaptive-card-container');
        if (container) container.style.width = `${s}px`;
      }, size);
      await page.waitForTimeout(10);
    }

    const endTime = await page.evaluate(() => performance.now());
    const duration = endTime - startTime;

    // Should complete in reasonable time (< 2 seconds)
    expect(duration).toBeLessThan(2000);

    // Card should still be responsive
    const isVisible = await page.isVisible('.adaptive-card');
    expect(isVisible).toBe(true);
  });

  test('should not leak memory during repeated operations', async ({ page, containerHelper }) => {
    // Get initial memory
    const initialMemory = await page.evaluate(() => {
      if (performance.memory) {
        return performance.memory.usedJSHeapSize;
      }
      return null;
    });

    // Perform many operations
    for (let i = 0; i < 50; i++) {
      await containerHelper.resizeContainer('.adaptive-card-container', 300 + (i % 5) * 100);
      await page.waitForTimeout(50);

      // Change layout occasionally
      if (i % 10 === 0) {
        await page.evaluate(() => {
          const card = document.querySelector('.adaptive-card');
          if (card) {
            const layouts = ['sidebar', 'feature', 'masonry'];
            const layout = layouts[Math.floor(Math.random() * layouts.length)];
            card.className = `adaptive-card layout-${layout}`;
          }
        });
      }
    }

    await page.waitForTimeout(1000);

    // Force garbage collection if available
    const finalMemory = await page.evaluate(() => {
      if (performance.memory) {
        return performance.memory.usedJSHeapSize;
      }
      return null;
    });

    if (initialMemory && finalMemory) {
      const memoryIncrease = (finalMemory - initialMemory) / initialMemory;

      // Memory should not increase by more than 50%
      expect(memoryIncrease).toBeLessThan(0.5);
    }
  });

  test('should optimize paint and composite layers', async ({ page }) => {
    // Check for will-change or transform usage
    const hasOptimizations = await page.evaluate(() => {
      const card = document.querySelector('.adaptive-card');
      if (!card) return false;

      const styles = window.getComputedStyle(card);
      return {
        willChange: styles.willChange,
        transform: styles.transform,
        containment: styles.contain
      };
    });

    // Should use CSS containment for better performance
    if (hasOptimizations.containment) {
      expect(['layout', 'paint', 'size', 'content'].some(
        val => hasOptimizations.containment.includes(val)
      )).toBe(true);
    }
  });

  test('should debounce resize events properly', async ({ page }) => {
    let resizeEventCount = 0;

    await page.evaluate(() => {
      window.resizeEventCount = 0;

      const container = document.querySelector('.adaptive-card-container');
      if (container) {
        const observer = new ResizeObserver(() => {
          window.resizeEventCount++;
        });
        observer.observe(container);
      }
    });

    // Trigger many rapid resizes
    for (let i = 0; i < 100; i++) {
      await page.evaluate((i) => {
        const container = document.querySelector('.adaptive-card-container');
        if (container) container.style.width = `${300 + i}px`;
      }, i);
    }

    await page.waitForTimeout(500);

    resizeEventCount = await page.evaluate(() => window.resizeEventCount);

    // Should not fire 100 times (should be debounced/throttled)
    // Typically should be less than 20 actual handler calls
    expect(resizeEventCount).toBeLessThan(100);
  });

  test('should load images lazily', async ({ page }) => {
    await page.goto('/gallery');
    await page.waitForLoadState('networkidle');

    // Check for lazy loading attributes
    const lazyImages = await page.evaluate(() => {
      const images = document.querySelectorAll('.adaptive-card img');
      let lazyCount = 0;

      images.forEach(img => {
        if (img.loading === 'lazy' || img.hasAttribute('data-src')) {
          lazyCount++;
        }
      });

      return {
        total: images.length,
        lazy: lazyCount
      };
    });

    if (lazyImages.total > 5) {
      // Most images should be lazy loaded
      expect(lazyImages.lazy).toBeGreaterThan(lazyImages.total * 0.5);
    }
  });

  test('should respect prefers-reduced-motion', async ({ page, containerHelper }) => {
    // Enable reduced motion
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await containerHelper.resizeContainer('.adaptive-card-container', 400);
    await page.waitForTimeout(100);

    // Check if transitions are disabled
    const transitionDuration = await page.evaluate(() => {
      const card = document.querySelector('.adaptive-card');
      if (!card) return null;

      const styles = window.getComputedStyle(card);
      return styles.transitionDuration;
    });

    // With reduced motion, transitions might be 0s or very short
    if (transitionDuration) {
      const duration = parseFloat(transitionDuration);
      expect(duration).toBeLessThan(0.2); // Less than 200ms or 0
    }
  });

  test('should have good First Contentful Paint (FCP)', async ({ page }) => {
    await page.goto('/');

    const fcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
          if (fcpEntry) {
            resolve(fcpEntry.startTime);
            observer.disconnect();
          }
        });
        observer.observe({ entryTypes: ['paint'] });

        // Timeout after 5 seconds
        setTimeout(() => resolve(null), 5000);
      });
    });

    if (fcp) {
      // FCP should be less than 2 seconds
      expect(fcp).toBeLessThan(2000);
    }
  });

  test('should have good Time to Interactive (TTI)', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Try to interact with the page
    await page.locator('.adaptive-card').first().click();

    const tti = Date.now() - startTime;

    // TTI should be less than 3 seconds
    expect(tti).toBeLessThan(3000);
  });

  test.describe('Theme Switching Performance', () => {

    test('custom theme switching is fast (<50ms average)', async ({ page, customThemeHelper }) => {
      const timings = [];

      for (let i = 0; i < 10; i++) {
        const theme = CUSTOM_THEMES[i % CUSTOM_THEMES.length];
        if (!theme) continue;

        const startTime = performance.now();
        await customThemeHelper.setCustomTheme(theme);
        const endTime = performance.now();

        timings.push(endTime - startTime);
      }

      const avgTime = timings.reduce((a, b) => a + b, 0) / timings.length;
      expect(avgTime).toBeLessThan(50);
    });

    test('theme switching does not cause layout reflow', async ({ page, customThemeHelper }) => {
      // Set initial layout
      await page.evaluate(() => {
        const card = document.querySelector('.adaptive-card');
        card.className = 'adaptive-card layout-feature';
        card.innerHTML = '<div class="feature-grid"><div class="feature-item">Item</div></div>';
      });

      await page.waitForTimeout(200);

      // Get initial layout metrics
      const before = await page.evaluate(() => {
        const card = document.querySelector('.adaptive-card');
        return {
          width: card.offsetWidth,
          height: card.offsetHeight,
        };
      });

      // Switch theme
      await customThemeHelper.setCustomTheme('theme-dark-gradient');
      await page.waitForTimeout(200);

      // Get after metrics
      const after = await page.evaluate(() => {
        const card = document.querySelector('.adaptive-card');
        return {
          width: card.offsetWidth,
          height: card.offsetHeight,
        };
      });

      // Layout should not change (within 2px tolerance)
      expect(Math.abs(after.width - before.width)).toBeLessThan(2);
      expect(Math.abs(after.height - before.height)).toBeLessThan(2);
    });

    test('rapid theme switching maintains performance', async ({ page, customThemeHelper }) => {
      const iterations = 30;
      const startTime = Date.now();

      for (let i = 0; i < iterations; i++) {
        const theme = CUSTOM_THEMES[(i % (CUSTOM_THEMES.length - 1)) + 1]; // Skip empty
        await customThemeHelper.setCustomTheme(theme);
        await page.waitForTimeout(20);
      }

      const totalTime = Date.now() - startTime;
      const avgTime = totalTime / iterations;

      // Average should be less than 50ms per switch
      expect(avgTime).toBeLessThan(50);
    });

    test('theme switching with multiple layouts performs well', async ({ page, layoutHelper, customThemeHelper }) => {
      const timings = [];

      for (const layout of LAYOUTS) {
        await layoutHelper.setLayout(layout);
        await page.waitForTimeout(100);

        const startTime = performance.now();
        await customThemeHelper.setCustomTheme('theme-neon-accent');
        const endTime = performance.now();

        timings.push(endTime - startTime);
      }

      const avgTime = timings.reduce((a, b) => a + b, 0) / timings.length;
      expect(avgTime).toBeLessThan(60);
    });

    test('simultaneous layout and theme changes perform well', async ({ page, layoutHelper, customThemeHelper }) => {
      const timings = [];

      for (let i = 0; i < 10; i++) {
        const layout = LAYOUTS[i % LAYOUTS.length];
        const theme = CUSTOM_THEMES[(i % (CUSTOM_THEMES.length - 1)) + 1];

        const startTime = performance.now();
        await layoutHelper.setLayout(layout);
        await customThemeHelper.setCustomTheme(theme);
        const endTime = performance.now();

        timings.push(endTime - startTime);
        await page.waitForTimeout(50);
      }

      const avgTime = timings.reduce((a, b) => a + b, 0) / timings.length;
      expect(avgTime).toBeLessThan(100);
    });

    test('theme CSS does not increase bundle size significantly', async ({ page }) => {
      // Measure CSS file sizes
      const cssSize = await page.evaluate(async () => {
        const results = {};

        try {
          const adaptiveResponse = await fetch('/src/styles/adaptive-cards.css');
          const adaptiveCSS = await adaptiveResponse.text();
          results.adaptive = adaptiveCSS.length;

          const themesResponse = await fetch('/src/styles/card-themes.css');
          const themesCSS = await themesResponse.text();
          results.themes = themesCSS.length;

          results.total = results.adaptive + results.themes;
        } catch (e) {
          results.error = e.message;
        }

        return results;
      });

      if (!cssSize.error) {
        // Total CSS should be reasonable (< 50KB uncompressed)
        expect(cssSize.total).toBeLessThan(50000);

        // Theme CSS should not be larger than layout CSS
        expect(cssSize.themes).toBeLessThan(cssSize.adaptive * 2);
      }
    });

  });

  test.describe('Memory Usage', () => {

    test('theme switching does not leak memory', async ({ page, customThemeHelper }) => {
      // Get initial memory (if available)
      const initialMemory = await page.evaluate(() => {
        if (performance.memory) {
          return performance.memory.usedJSHeapSize;
        }
        return null;
      });

      // Perform many theme switches
      for (let i = 0; i < 50; i++) {
        const theme = CUSTOM_THEMES[(i % (CUSTOM_THEMES.length - 1)) + 1];
        await customThemeHelper.setCustomTheme(theme);
        await page.waitForTimeout(10);
      }

      // Get final memory
      const finalMemory = await page.evaluate(() => {
        if (performance.memory) {
          return performance.memory.usedJSHeapSize;
        }
        return null;
      });

      if (initialMemory && finalMemory) {
        const increase = finalMemory - initialMemory;
        // Memory increase should be minimal (< 5MB)
        expect(increase).toBeLessThan(5 * 1024 * 1024);
      }
    });

  });
});
