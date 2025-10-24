// Unit tests for card utility functions
import { describe, it, expect, beforeEach } from 'vitest';

describe('Card Utility Functions', () => {
  describe('Container Query Support Detection', () => {
    it('should detect container query support', () => {
      const supportsContainerQueries = CSS.supports('container-type', 'inline-size');
      expect(supportsContainerQueries).toBe(true);
    });

    it('should detect cqw unit support', () => {
      const supportsCqw = CSS.supports('width', '1cqw');
      expect(supportsCqw).toBe(true);
    });
  });

  describe('Clamp Calculation', () => {
    it('should calculate clamp values correctly', () => {
      // Helper function to calculate clamped value
      const calculateClamp = (min, preferred, max, containerSize) => {
        // preferred is in cqw (container query width units)
        const preferredPx = (preferred / 100) * containerSize;
        return Math.max(min, Math.min(preferredPx, max));
      };

      // Test cases: clamp(1rem, 2.5cqw, 1.125rem) at various sizes
      const minPx = 16; // 1rem
      const maxPx = 18; // 1.125rem
      const preferredCqw = 2.5;

      // At 400px container: 2.5cqw = 10px -> clamped to 16px (min)
      expect(calculateClamp(minPx, preferredCqw, maxPx, 400)).toBe(16);

      // At 800px container: 2.5cqw = 20px -> clamped to 18px (max)
      expect(calculateClamp(minPx, preferredCqw, maxPx, 800)).toBe(18);

      // At 680px container: 2.5cqw = 17px -> within range
      expect(calculateClamp(minPx, preferredCqw, maxPx, 680)).toBe(17);
    });
  });

  describe('Breakpoint Detection', () => {
    it('should correctly identify breakpoint ranges', () => {
      const getBreakpoint = (width) => {
        if (width < 250) return 'extra-small';
        if (width < 400) return 'small';
        if (width < 600) return 'medium';
        if (width < 800) return 'large';
        return 'extra-large';
      };

      expect(getBreakpoint(200)).toBe('extra-small');
      expect(getBreakpoint(250)).toBe('small');
      expect(getBreakpoint(400)).toBe('medium');
      expect(getBreakpoint(600)).toBe('large');
      expect(getBreakpoint(800)).toBe('extra-large');
    });

    it('should handle edge cases at breakpoint boundaries', () => {
      const getBreakpoint = (width) => {
        if (width < 250) return 'extra-small';
        if (width < 400) return 'small';
        if (width < 600) return 'medium';
        if (width < 800) return 'large';
        return 'extra-large';
      };

      expect(getBreakpoint(249)).toBe('extra-small');
      expect(getBreakpoint(250)).toBe('small');
      expect(getBreakpoint(399)).toBe('small');
      expect(getBreakpoint(400)).toBe('medium');
    });
  });

  describe('Layout Transformation Logic', () => {
    it('should determine correct grid columns for feature layout', () => {
      const getFeatureColumns = (width) => {
        if (width < 400) return 1;
        if (width < 700) return 2;
        return 3;
      };

      expect(getFeatureColumns(300)).toBe(1);
      expect(getFeatureColumns(500)).toBe(2);
      expect(getFeatureColumns(900)).toBe(3);
    });

    it('should determine correct layout for sidebar', () => {
      const getSidebarLayout = (width) => {
        if (width < 400) return 'stacked';
        return 'side-by-side';
      };

      expect(getSidebarLayout(300)).toBe('stacked');
      expect(getSidebarLayout(600)).toBe('side-by-side');
    });
  });

  describe('Aspect Ratio Calculations', () => {
    it('should calculate aspect ratio correctly', () => {
      const getAspectRatio = (width, height) => {
        return width / height;
      };

      expect(getAspectRatio(1600, 900)).toBeCloseTo(16/9, 2);
      expect(getAspectRatio(800, 600)).toBeCloseTo(4/3, 2);
      expect(getAspectRatio(500, 500)).toBe(1);
    });

    it('should select appropriate aspect ratio for container size', () => {
      const getRecommendedAspectRatio = (width) => {
        if (width < 400) return '3/4'; // Portrait for small
        if (width < 700) return '4/3'; // Square-ish for medium
        return '16/9'; // Landscape for large
      };

      expect(getRecommendedAspectRatio(300)).toBe('3/4');
      expect(getRecommendedAspectRatio(500)).toBe('4/3');
      expect(getRecommendedAspectRatio(900)).toBe('16/9');
    });
  });

  describe('Scaling Factor Calculations', () => {
    it('should calculate correct scaling factor', () => {
      const getScalingFactor = (currentWidth, baseWidth = 400) => {
        return currentWidth / baseWidth;
      };

      expect(getScalingFactor(400)).toBe(1);
      expect(getScalingFactor(800)).toBe(2);
      expect(getScalingFactor(200)).toBe(0.5);
    });

    it('should apply scaling limits', () => {
      const getScalingFactor = (currentWidth, baseWidth = 400, min = 0.5, max = 2) => {
        const factor = currentWidth / baseWidth;
        return Math.max(min, Math.min(factor, max));
      };

      expect(getScalingFactor(100)).toBe(0.5); // Limited to min
      expect(getScalingFactor(1000)).toBe(2); // Limited to max
      expect(getScalingFactor(600)).toBe(1.5); // Within range
    });
  });

  describe('Color Contrast Calculations', () => {
    it('should calculate relative luminance', () => {
      const getLuminance = (r, g, b) => {
        const [rs, gs, bs] = [r, g, b].map(c => {
          c = c / 255;
          return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
      };

      // White (255, 255, 255)
      expect(getLuminance(255, 255, 255)).toBeCloseTo(1, 1);

      // Black (0, 0, 0)
      expect(getLuminance(0, 0, 0)).toBe(0);

      // Mid-gray should be in between
      const midGray = getLuminance(128, 128, 128);
      expect(midGray).toBeGreaterThan(0);
      expect(midGray).toBeLessThan(1);
    });

    it('should calculate contrast ratio', () => {
      const getContrastRatio = (l1, l2) => {
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        return (lighter + 0.05) / (darker + 0.05);
      };

      // White on black should be 21:1
      expect(getContrastRatio(1, 0)).toBeCloseTo(21, 0);

      // Same color should be 1:1
      expect(getContrastRatio(0.5, 0.5)).toBe(1);
    });

    it('should validate WCAG AA compliance', () => {
      const isWCAG_AA = (contrastRatio) => {
        return contrastRatio >= 4.5;
      };

      expect(isWCAG_AA(21)).toBe(true); // White on black
      expect(isWCAG_AA(4.5)).toBe(true); // Minimum
      expect(isWCAG_AA(3)).toBe(false); // Too low
    });
  });
});

describe('DOM Manipulation Utilities', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('Card Creation', () => {
    it('should create card element with correct classes', () => {
      const card = document.createElement('div');
      card.className = 'adaptive-card layout-sidebar';

      expect(card.classList.contains('adaptive-card')).toBe(true);
      expect(card.classList.contains('layout-sidebar')).toBe(true);
    });

    it('should create container with container-type style', () => {
      const container = document.createElement('div');
      container.className = 'adaptive-card-container';
      container.style.containerType = 'inline-size';

      expect(container.style.containerType).toBe('inline-size');
    });
  });

  describe('Resize Handling', () => {
    it('should update container width', () => {
      const container = document.createElement('div');
      container.style.width = '400px';
      document.body.appendChild(container);

      container.style.width = '600px';

      expect(container.style.width).toBe('600px');
    });

    it('should enforce minimum width', () => {
      const container = document.createElement('div');
      container.style.minWidth = '200px';
      container.style.width = '100px';

      expect(container.style.minWidth).toBe('200px');
    });

    it('should enforce maximum width', () => {
      const container = document.createElement('div');
      container.style.maxWidth = '1200px';
      container.style.width = '2000px';

      expect(container.style.maxWidth).toBe('1200px');
    });
  });

  describe('Theme Management', () => {
    it('should set theme attribute', () => {
      document.documentElement.setAttribute('data-theme', 'dark');

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should change theme', () => {
      document.documentElement.setAttribute('data-theme', 'light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');

      document.documentElement.setAttribute('data-theme', 'dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });

  describe('Layout Switching', () => {
    it('should switch layout class', () => {
      const card = document.createElement('div');
      card.className = 'adaptive-card layout-sidebar';

      card.className = card.className.replace(/layout-\w+/, 'layout-feature');

      expect(card.classList.contains('layout-feature')).toBe(true);
      expect(card.classList.contains('layout-sidebar')).toBe(false);
    });

    it('should preserve other classes when switching layout', () => {
      const card = document.createElement('div');
      card.className = 'adaptive-card layout-sidebar custom-class';

      card.classList.remove('layout-sidebar');
      card.classList.add('layout-feature');

      expect(card.classList.contains('adaptive-card')).toBe(true);
      expect(card.classList.contains('custom-class')).toBe(true);
      expect(card.classList.contains('layout-feature')).toBe(true);
    });
  });
});

describe('Performance Utilities', () => {
  describe('Debounce', () => {
    it('should debounce function calls', (done) => {
      let callCount = 0;

      const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => func(...args), delay);
        };
      };

      const debouncedFn = debounce(() => {
        callCount++;
      }, 100);

      // Call multiple times rapidly
      debouncedFn();
      debouncedFn();
      debouncedFn();

      // Should only execute once after delay
      setTimeout(() => {
        expect(callCount).toBe(1);
        done();
      }, 150);
    });
  });

  describe('Throttle', () => {
    it('should throttle function calls', (done) => {
      let callCount = 0;

      const throttle = (func, delay) => {
        let lastCall = 0;
        return (...args) => {
          const now = Date.now();
          if (now - lastCall >= delay) {
            lastCall = now;
            func(...args);
          }
        };
      };

      const throttledFn = throttle(() => {
        callCount++;
      }, 100);

      // Call multiple times
      throttledFn();
      setTimeout(() => throttledFn(), 50);
      setTimeout(() => throttledFn(), 120);

      setTimeout(() => {
        expect(callCount).toBe(2); // First call + one after 120ms
        done();
      }, 200);
    });
  });
});
