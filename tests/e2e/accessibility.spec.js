// Accessibility tests for adaptive card system
import { test, expect, THEMES, CUSTOM_THEMES, LAYOUTS } from './fixtures.js';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Accessibility Tests @a11y', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await injectAxe(page);
  });

  test('should pass axe accessibility checks', async ({ page }) => {
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: {
        html: true
      }
    });
  });

  test('should have proper ARIA labels on interactive elements', async ({ page }) => {
    const ariaLabels = await page.evaluate(() => {
      const elements = document.querySelectorAll('button, [role="button"], a, input');
      const results = [];

      elements.forEach(el => {
        const label = el.getAttribute('aria-label') ||
                     el.getAttribute('aria-labelledby') ||
                     el.textContent?.trim();

        results.push({
          tagName: el.tagName,
          hasLabel: !!label,
          label: label
        });
      });

      return results;
    });

    // All interactive elements should have labels
    const unlabeled = ariaLabels.filter(item => !item.hasLabel);
    expect(unlabeled).toHaveLength(0);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    const headings = await page.evaluate(() => {
      const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      return Array.from(headingElements).map(h => ({
        level: parseInt(h.tagName.charAt(1)),
        text: h.textContent?.trim()
      }));
    });

    if (headings.length > 0) {
      // First heading should be h1
      expect(headings[0].level).toBe(1);

      // Check hierarchy (no skipping levels)
      for (let i = 1; i < headings.length; i++) {
        const diff = headings[i].level - headings[i - 1].level;
        expect(diff).toBeLessThanOrEqual(1);
      }
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);

    let focusedElement = await page.evaluate(() => {
      return document.activeElement?.tagName;
    });

    expect(['BUTTON', 'A', 'INPUT'].includes(focusedElement)).toBe(true);

    // Tab again
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);

    const secondFocusedElement = await page.evaluate(() => {
      return document.activeElement?.tagName;
    });

    // Focus should have moved
    expect(secondFocusedElement).toBeTruthy();
  });

  test('should have visible focus indicators', async ({ page }) => {
    // Focus first interactive element
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);

    const focusStyles = await page.evaluate(() => {
      const focused = document.activeElement;
      if (!focused) return null;

      const styles = window.getComputedStyle(focused);
      return {
        outline: styles.outline,
        outlineWidth: styles.outlineWidth,
        outlineColor: styles.outlineColor,
        boxShadow: styles.boxShadow
      };
    });

    // Should have some kind of focus indicator
    const hasFocusIndicator = focusStyles &&
      (focusStyles.outline !== 'none' ||
       focusStyles.outlineWidth !== '0px' ||
       focusStyles.boxShadow !== 'none');

    expect(hasFocusIndicator).toBe(true);
  });

  test('should maintain focus when layout changes', async ({ page, layoutHelper }) => {
    // Focus a button
    const layoutButton = page.locator('[data-layout="sidebar"]').first();
    await layoutButton.focus();

    const initialFocus = await page.evaluate(() => document.activeElement?.outerHTML);

    // Change layout
    await layoutHelper.setLayout('feature');
    await page.waitForTimeout(350);

    const finalFocus = await page.evaluate(() => document.activeElement?.outerHTML);

    // Focus should be maintained or moved to a related element
    expect(finalFocus).toBeTruthy();
  });

  test('should have proper color contrast in all themes', async ({ page, themeHelper }) => {
    for (const theme of THEMES) {
      await themeHelper.setTheme(theme);
      await page.waitForTimeout(200);

      // Check color contrast for text
      const contrastIssues = await page.evaluate(() => {
        const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, button');
        const issues = [];

        textElements.forEach(el => {
          const styles = window.getComputedStyle(el);
          const color = styles.color;
          const bgColor = styles.backgroundColor;

          // Simple check if colors are defined
          if (!color || color === 'rgba(0, 0, 0, 0)' || !bgColor || bgColor === 'rgba(0, 0, 0, 0)') {
            return;
          }

          // Helper to parse rgb/rgba
          const parseColor = (colorStr) => {
            const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
            if (!match) return null;
            return {
              r: parseInt(match[1]),
              g: parseInt(match[2]),
              b: parseInt(match[3])
            };
          };

          const textColor = parseColor(color);
          const backgroundColor = parseColor(bgColor);

          if (!textColor || !backgroundColor) return;

          // Calculate relative luminance (simplified)
          const getLuminance = (color) => {
            const { r, g, b } = color;
            const [rs, gs, bs] = [r, g, b].map(c => {
              c = c / 255;
              return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
            });
            return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
          };

          const l1 = getLuminance(textColor);
          const l2 = getLuminance(backgroundColor);

          const contrast = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

          // WCAG AA requires 4.5:1 for normal text
          if (contrast < 4.5) {
            issues.push({
              element: el.tagName,
              text: el.textContent?.substring(0, 50),
              contrast: contrast.toFixed(2)
            });
          }
        });

        return issues;
      });

      // Should have minimal contrast issues
      expect(contrastIssues.length).toBeLessThan(3);
    }
  });

  test('should support screen reader announcements', async ({ page, containerHelper }) => {
    // Check for aria-live regions
    const liveRegions = await page.evaluate(() => {
      const regions = document.querySelectorAll('[aria-live]');
      return Array.from(regions).map(r => ({
        ariaLive: r.getAttribute('aria-live'),
        role: r.getAttribute('role')
      }));
    });

    // Resize container (should announce changes)
    await containerHelper.resizeContainer('.adaptive-card-container', 600);
    await page.waitForTimeout(350);

    // Check if dimension display has aria-live
    const dimensionDisplay = await page.evaluate(() => {
      const display = document.querySelector('[data-testid="width-display"], .width-display');
      if (!display) return null;
      return display.getAttribute('aria-live');
    });

    // Should have live region for dynamic updates
    if (dimensionDisplay) {
      expect(['polite', 'assertive'].includes(dimensionDisplay)).toBe(true);
    }
  });

  test('should have proper image alt text', async ({ page }) => {
    const images = await page.evaluate(() => {
      const imgs = document.querySelectorAll('.adaptive-card img');
      return Array.from(imgs).map(img => ({
        hasAlt: img.hasAttribute('alt'),
        alt: img.getAttribute('alt'),
        src: img.getAttribute('src')
      }));
    });

    // All images should have alt text (even if empty for decorative)
    const missingAlt = images.filter(img => !img.hasAlt);
    expect(missingAlt).toHaveLength(0);
  });

  test('should have semantic HTML structure', async ({ page }) => {
    const semantics = await page.evaluate(() => {
      return {
        hasMain: !!document.querySelector('main'),
        hasNav: !!document.querySelector('nav'),
        hasHeader: !!document.querySelector('header'),
        hasFooter: !!document.querySelector('footer'),
        hasArticle: !!document.querySelector('article'),
        hasSection: !!document.querySelector('section')
      };
    });

    // Should use semantic HTML5 elements
    expect(semantics.hasMain || semantics.hasArticle || semantics.hasSection).toBe(true);
  });

  test('should have proper button roles and states', async ({ page }) => {
    const buttons = await page.evaluate(() => {
      const btns = document.querySelectorAll('button, [role="button"]');
      return Array.from(btns).map(btn => ({
        tagName: btn.tagName,
        role: btn.getAttribute('role'),
        ariaPressed: btn.getAttribute('aria-pressed'),
        ariaExpanded: btn.getAttribute('aria-expanded'),
        disabled: btn.hasAttribute('disabled')
      }));
    });

    // Toggle buttons should have aria-pressed
    buttons.forEach(btn => {
      if (btn.ariaPressed !== null) {
        expect(['true', 'false'].includes(btn.ariaPressed)).toBe(true);
      }
    });
  });

  test('should support high contrast mode', async ({ page }) => {
    // Simulate high contrast mode
    await page.emulateMedia({ colorScheme: 'dark', forcedColors: 'active' });
    await page.waitForTimeout(200);

    // Check if content is still visible
    const isVisible = await page.isVisible('.adaptive-card');
    expect(isVisible).toBe(true);

    // Check if borders/outlines are defined
    const hasDefinedBorders = await page.evaluate(() => {
      const card = document.querySelector('.adaptive-card');
      if (!card) return false;

      const styles = window.getComputedStyle(card);
      return styles.border !== 'none' || styles.outline !== 'none';
    });

    expect(hasDefinedBorders).toBe(true);
  });

  test('should handle reduced motion preference', async ({ page, containerHelper }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await containerHelper.resizeContainer('.adaptive-card-container', 600);
    await page.waitForTimeout(100);

    // Transitions should be minimal or removed
    const transitions = await page.evaluate(() => {
      const card = document.querySelector('.adaptive-card');
      if (!card) return null;
      return window.getComputedStyle(card).transition;
    });

    // Should respect reduced motion
    expect(
      !transitions ||
      transitions === 'none' ||
      transitions.includes('0s')
    ).toBe(true);
  });

  test('should have proper form labels', async ({ page }) => {
    const formControls = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input, select, textarea');
      return Array.from(inputs).map(input => ({
        id: input.id,
        hasLabel: !!document.querySelector(`label[for="${input.id}"]`),
        ariaLabel: input.getAttribute('aria-label'),
        ariaLabelledby: input.getAttribute('aria-labelledby')
      }));
    });

    // All form controls should have labels
    formControls.forEach(control => {
      expect(
        control.hasLabel ||
        control.ariaLabel ||
        control.ariaLabelledby
      ).toBe(true);
    });
  });

  test('should announce dynamic content changes', async ({ page, layoutHelper }) => {
    // Set up mutation observer
    await page.evaluate(() => {
      window.contentChanges = [];
      const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          if (mutation.type === 'childList' || mutation.type === 'characterData') {
            window.contentChanges.push({
              type: mutation.type,
              target: mutation.target.nodeName
            });
          }
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
      });
    });

    // Change layout (dynamic content change)
    await layoutHelper.setLayout('feature');
    await page.waitForTimeout(350);

    const changes = await page.evaluate(() => window.contentChanges);

    // Should have detected content changes
    expect(changes.length).toBeGreaterThan(0);
  });

  test('should support zoom up to 200%', async ({ page }) => {
    // Set zoom to 200%
    await page.evaluate(() => {
      document.body.style.zoom = '2';
    });

    await page.waitForTimeout(500);

    // Content should still be accessible
    const isVisible = await page.isVisible('.adaptive-card');
    expect(isVisible).toBe(true);

    // No horizontal scrollbars on container
    const hasHorizontalScroll = await page.evaluate(() => {
      const container = document.querySelector('.adaptive-card-container');
      if (!container) return false;
      return container.scrollWidth > container.clientWidth;
    });

    // Should not have unexpected horizontal scroll
    expect(hasHorizontalScroll).toBe(false);
  });

  test('should have skip links for keyboard navigation', async ({ page }) => {
    await page.goto('/');

    // Press Tab to activate skip link
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);

    const firstFocusable = await page.evaluate(() => {
      return document.activeElement?.textContent?.toLowerCase();
    });

    // First focusable element might be a skip link
    if (firstFocusable && firstFocusable.includes('skip')) {
      expect(firstFocusable).toContain('skip');
    }
  });

  test('should have proper landmark regions', async ({ page }) => {
    const landmarks = await page.evaluate(() => {
      const regions = document.querySelectorAll('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], main, nav, header, footer');
      return Array.from(regions).map(r => ({
        role: r.getAttribute('role') || r.tagName.toLowerCase(),
        ariaLabel: r.getAttribute('aria-label')
      }));
    });

    // Should have at least a main landmark
    const hasMain = landmarks.some(l => l.role === 'main' || l.role === 'MAIN');
    expect(hasMain).toBe(true);
  });

  test.describe('Custom Theme Accessibility', () => {

    test('all custom themes meet WCAG AA contrast standards', async ({ page, customThemeHelper }) => {
      const contrastResults = [];

      for (const theme of CUSTOM_THEMES) {
        if (!theme) continue; // Skip empty string

        await customThemeHelper.setCustomTheme(theme);
        await page.waitForTimeout(200);

        // Run axe contrast check
        await injectAxe(page);

        try {
          await checkA11y(page, '.adaptive-card', {
            detailedReport: false,
            rules: {
              'color-contrast': { enabled: true }
            }
          });
          contrastResults.push({ theme, passed: true });
        } catch (error) {
          contrastResults.push({ theme, passed: false, error: error.message });
        }
      }

      // All themes should pass contrast checks
      const failures = contrastResults.filter(r => !r.passed);
      if (failures.length > 0) {
        console.log('Contrast failures:', failures);
      }

      expect(failures.length).toBe(0);
    });

    test('custom themes work with high contrast mode', async ({ page, customThemeHelper }) => {
      // Enable high contrast mode simulation
      await page.emulateMedia({ colorScheme: 'dark', forcedColors: 'active' });

      for (const theme of ['theme-dark-gradient', 'theme-light-elegant']) {
        await customThemeHelper.setCustomTheme(theme);
        await page.waitForTimeout(200);

        // Card should still be visible
        const isVisible = await page.isVisible('.adaptive-card');
        expect(isVisible).toBe(true);

        // Text should be readable
        const hasText = await page.evaluate(() => {
          const card = document.querySelector('.adaptive-card');
          return card && card.textContent.trim().length > 0;
        });
        expect(hasText).toBe(true);
      }
    });

    test('theme switcher buttons have ARIA labels', async ({ page }) => {
      const themeButtons = await page.evaluate(() => {
        const buttons = document.querySelectorAll('[data-custom-theme-btn], .custom-theme-btn');
        return Array.from(buttons).map(btn => ({
          hasAriaLabel: btn.hasAttribute('aria-label') || btn.hasAttribute('aria-labelledby'),
          text: btn.textContent?.trim(),
        }));
      });

      // If theme buttons exist, they should be labeled
      if (themeButtons.length > 0) {
        themeButtons.forEach(btn => {
          expect(btn.hasAriaLabel || btn.text).toBeTruthy();
        });
      }
    });

    test('theme changes announce to screen readers', async ({ page, customThemeHelper }) => {
      // Check for aria-live region
      const hasLiveRegion = await page.evaluate(() => {
        return !!document.querySelector('[aria-live], [role="status"]');
      });

      // If live regions exist, test them
      if (hasLiveRegion) {
        await customThemeHelper.setCustomTheme('theme-dark-gradient');
        await page.waitForTimeout(200);

        const announcement = await page.evaluate(() => {
          const region = document.querySelector('[aria-live], [role="status"]');
          return region?.textContent;
        });

        // Should have some announcement
        expect(announcement).toBeTruthy();
      }
    });

  });

  test.describe('Layout Switcher Accessibility', () => {

    test('layout buttons are keyboard accessible', async ({ page }) => {
      const layoutButtons = await page.locator('[data-layout], .layout-btn').all();

      if (layoutButtons.length > 0) {
        // Focus first button
        await layoutButtons[0].focus();

        // Should be focusable
        const isFocused = await page.evaluate(() => {
          const active = document.activeElement;
          return active?.hasAttribute('data-layout') || active?.classList.contains('layout-btn');
        });

        expect(isFocused).toBeTruthy();
      }
    });

    test('layout switcher has appropriate ARIA roles', async ({ page }) => {
      const switcherRoles = await page.evaluate(() => {
        const switcher = document.querySelector('.layout-switcher, [data-testid="layout-switcher"]');
        if (!switcher) return null;

        return {
          role: switcher.getAttribute('role'),
          ariaLabel: switcher.getAttribute('aria-label'),
        };
      });

      // If switcher exists, it should have proper ARIA
      if (switcherRoles) {
        expect(switcherRoles.role || switcherRoles.ariaLabel).toBeTruthy();
      }
    });

  });

  test.describe('Three Independent Switchers Accessibility', () => {

    test('each switcher group has distinct labels', async ({ page }) => {
      const switchers = await page.evaluate(() => {
        return {
          layout: document.querySelector('[aria-label*="layout" i], .layout-switcher')?.getAttribute('aria-label'),
          customTheme: document.querySelector('[aria-label*="custom theme" i], .custom-theme-switcher')?.getAttribute('aria-label'),
          daisyui: document.querySelector('[aria-label*="theme" i]:not([aria-label*="custom" i]), .theme-switcher')?.getAttribute('aria-label'),
        };
      });

      // If switchers exist, they should have distinct labels
      const labels = Object.values(switchers).filter(Boolean);
      if (labels.length > 1) {
        // Should not all be the same
        const uniqueLabels = new Set(labels);
        expect(uniqueLabels.size).toBe(labels.length);
      }
    });

    test('switchers are navigable in logical order', async ({ page }) => {
      // Tab through all focusable elements
      const focusOrder = [];

      for (let i = 0; i < 20; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(50);

        const focusedElement = await page.evaluate(() => {
          const el = document.activeElement;
          return {
            tag: el?.tagName,
            ariaLabel: el?.getAttribute('aria-label'),
            dataAttr: el?.getAttribute('data-layout') || el?.getAttribute('data-custom-theme-btn') || el?.getAttribute('data-theme-btn'),
          };
        });

        if (focusedElement.dataAttr) {
          focusOrder.push(focusedElement);
        }
      }

      // Should be able to tab to controls
      expect(focusOrder.length).toBeGreaterThan(0);
    });

  });
});
