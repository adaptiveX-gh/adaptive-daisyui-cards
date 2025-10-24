/**
 * Unit tests for ThemeService
 */

import { describe, it, expect } from 'vitest';
import ThemeService from '../../api/services/ThemeService.js';

describe('ThemeService', () => {
  const service = new ThemeService();

  describe('getTheme', () => {
    it('should return theme by name', () => {
      const theme = service.getTheme('corporate');
      expect(theme).toHaveProperty('name', 'corporate');
      expect(theme).toHaveProperty('colors');
      expect(theme).toHaveProperty('scale');
      expect(theme).toHaveProperty('typography');
    });

    it('should return default theme for unknown name', () => {
      const theme = service.getTheme('unknown-theme');
      expect(theme).toHaveProperty('name', 'light');
    });

    it('should return theme with color palette', () => {
      const theme = service.getTheme('cyberpunk');
      expect(theme.colors).toHaveProperty('primary');
      expect(theme.colors).toHaveProperty('secondary');
      expect(theme.colors).toHaveProperty('accent');
    });
  });

  describe('getAllThemes', () => {
    it('should return array of theme names', () => {
      const themes = service.getAllThemes();
      expect(Array.isArray(themes)).toBe(true);
      expect(themes.length).toBeGreaterThan(0);
      expect(themes).toContain('light');
      expect(themes).toContain('dark');
      expect(themes).toContain('corporate');
      expect(themes).toContain('cyberpunk');
    });
  });

  describe('getThemeByStyle', () => {
    it('should return professional theme for professional style', () => {
      const theme = service.getThemeByStyle('professional');
      expect(theme.name).toMatch(/corporate|business|light|dark/);
    });

    it('should return playful theme for playful style', () => {
      const theme = service.getThemeByStyle('playful');
      expect(theme.name).toMatch(/cupcake|pastel|valentine|retro/);
    });

    it('should return bold theme for bold style', () => {
      const theme = service.getThemeByStyle('bold');
      expect(theme.name).toMatch(/cyberpunk|synthwave|dracula/);
    });

    it('should default to professional for unknown style', () => {
      const theme = service.getThemeByStyle('unknown-style');
      expect(theme).toHaveProperty('name');
    });
  });

  describe('normalizeTheme', () => {
    it('should normalize string theme name', () => {
      const theme = service.normalizeTheme('dark');
      expect(theme).toHaveProperty('name', 'dark');
      expect(theme).toHaveProperty('colors');
    });

    it('should normalize theme object with name', () => {
      const input = {
        name: 'corporate'
      };
      const theme = service.normalizeTheme(input);
      expect(theme.name).toBe('corporate');
    });

    it('should merge custom colors', () => {
      const input = {
        name: 'light',
        colors: {
          primary: '#custom-color'
        }
      };
      const theme = service.normalizeTheme(input);
      expect(theme.colors.primary).toBe('#custom-color');
      expect(theme.colors.secondary).toBeTruthy(); // Should still have base colors
    });

    it('should override scale', () => {
      const input = {
        name: 'light',
        scale: 'lg'
      };
      const theme = service.normalizeTheme(input);
      expect(theme.scale).toBe('lg');
    });

    it('should return default for invalid input', () => {
      const theme = service.normalizeTheme({});
      expect(theme.name).toBe('light');
    });
  });

  describe('getTypographyClass', () => {
    it('should return classic for professional themes', () => {
      const typographyClass = service.getTypographyClass('corporate');
      expect(typographyClass).toBe('classic');
    });

    it('should return bold for cyberpunk theme', () => {
      const typographyClass = service.getTypographyClass('cyberpunk');
      expect(typographyClass).toBe('bold');
    });

    it('should return soft for pastel themes', () => {
      const typographyClass = service.getTypographyClass('cupcake');
      expect(typographyClass).toBe('soft');
    });

    it('should return quirky for retro theme', () => {
      const typographyClass = service.getTypographyClass('retro');
      expect(typographyClass).toBe('quirky');
    });
  });

  describe('getRecommendedThemes', () => {
    it('should recommend themes for presentation use case', () => {
      const themes = service.getRecommendedThemes('presentation');
      expect(Array.isArray(themes)).toBe(true);
      expect(themes.length).toBeGreaterThan(0);
      expect(themes).toContain('corporate');
    });

    it('should recommend themes for marketing use case', () => {
      const themes = service.getRecommendedThemes('marketing');
      expect(Array.isArray(themes)).toBe(true);
      expect(themes.some(t => ['synthwave', 'cyberpunk', 'valentine'].includes(t))).toBe(true);
    });

    it('should default to presentation themes for unknown use case', () => {
      const themes = service.getRecommendedThemes('unknown');
      expect(Array.isArray(themes)).toBe(true);
    });
  });

  describe('theme properties', () => {
    it('should have typography property for all themes', () => {
      const themes = service.getAllThemes();
      themes.forEach(themeName => {
        const theme = service.getTheme(themeName);
        expect(theme).toHaveProperty('typography');
        expect(['classic', 'bold', 'soft', 'quirky']).toContain(theme.typography);
      });
    });

    it('should have valid scale for all themes', () => {
      const themes = service.getAllThemes();
      themes.forEach(themeName => {
        const theme = service.getTheme(themeName);
        expect(theme).toHaveProperty('scale');
        expect(['sm', 'md', 'lg']).toContain(theme.scale);
      });
    });

    it('should have complete color palette', () => {
      const theme = service.getTheme('corporate');
      expect(theme.colors).toHaveProperty('primary');
      expect(theme.colors).toHaveProperty('secondary');
      expect(theme.colors).toHaveProperty('accent');
      expect(theme.colors).toHaveProperty('neutral');
      expect(theme.colors).toHaveProperty('base-100');
    });
  });
});
