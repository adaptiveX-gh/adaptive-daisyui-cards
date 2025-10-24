/**
 * PlaceholderService Unit Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import PlaceholderService from '../../../api/services/PlaceholderService.js';

describe('PlaceholderService', () => {
  let service;
  let testTheme;

  beforeEach(() => {
    service = new PlaceholderService();
    testTheme = {
      colors: {
        primary: '#3b82f6',
        secondary: '#1e40af',
        accent: '#60a5fa',
        background: '#f3f4f6',
        text: '#1f2937'
      }
    };
  });

  describe('selectPlaceholder', () => {
    it('should return placeholder specification', () => {
      const result = service.selectPlaceholder(testTheme, '16:9', 'test content');

      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('color', 'based-on-theme');
      expect(result).toHaveProperty('loadingState', true);
      expect(result).toHaveProperty('aspectRatio', '16:9');
      expect(result).toHaveProperty('svg');
    });

    it('should be deterministic - same input produces same output', () => {
      const result1 = service.selectPlaceholder(testTheme, '16:9', 'test');
      const result2 = service.selectPlaceholder(testTheme, '16:9', 'test');

      expect(result1.type).toBe(result2.type);
      expect(result1.svg).toBe(result2.svg);
    });

    it('should produce different outputs for different prompts', () => {
      const result1 = service.selectPlaceholder(testTheme, '16:9', 'AI Technology');
      const result2 = service.selectPlaceholder(testTheme, '16:9', 'Marketing Trends');

      // May be same type occasionally due to hash collision, but SVG should differ
      expect(result1.svg).not.toBe(result2.svg);
    });

    it('should select from three pattern types', () => {
      const types = new Set();
      const prompts = [
        'AI Technology', 'Marketing Trends', 'Data Analytics',
        'Product Discovery', 'Team Management', 'Digital Strategy',
        'Innovation', 'Growth', 'Success'
      ];

      for (const prompt of prompts) {
        const result = service.selectPlaceholder(testTheme, '16:9', prompt);
        types.add(result.type);
      }

      // Should have variety in types
      expect(types.size).toBeGreaterThan(1);

      // All types should be valid
      for (const type of types) {
        expect(['geometric', 'pattern', 'solid']).toContain(type);
      }
    });
  });

  describe('generateGeometric', () => {
    it('should generate valid SVG', () => {
      const svg = service.generateGeometric({
        theme: testTheme,
        aspectRatio: '16:9',
        contentPrompt: 'test'
      });

      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
      expect(svg).toContain('width="1600"');
      expect(svg).toContain('height="900"');
    });

    it('should include theme colors', () => {
      const svg = service.generateGeometric({
        theme: testTheme,
        aspectRatio: '16:9',
        contentPrompt: 'test'
      });

      // Should contain at least one theme color
      const hasThemeColor =
        svg.includes(testTheme.colors.primary) ||
        svg.includes(testTheme.colors.secondary) ||
        svg.includes(testTheme.colors.accent);

      expect(hasThemeColor).toBe(true);
    });

    it('should support different aspect ratios', () => {
      const ratios = ['16:9', '1:1', '4:3', '9:16', '3:4'];
      const expectedDimensions = {
        '16:9': { width: 1600, height: 900 },
        '1:1': { width: 1000, height: 1000 },
        '4:3': { width: 1200, height: 900 },
        '9:16': { width: 900, height: 1600 },
        '3:4': { width: 900, height: 1200 }
      };

      for (const ratio of ratios) {
        const svg = service.generateGeometric({
          theme: testTheme,
          aspectRatio: ratio
        });

        const dims = expectedDimensions[ratio];
        expect(svg).toContain(`width="${dims.width}"`);
        expect(svg).toContain(`height="${dims.height}"`);
      }
    });
  });

  describe('generatePattern', () => {
    it('should generate valid SVG', () => {
      const svg = service.generatePattern({
        theme: testTheme,
        aspectRatio: '16:9',
        contentPrompt: 'test'
      });

      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
    });

    it('should be deterministic', () => {
      const svg1 = service.generatePattern({
        theme: testTheme,
        aspectRatio: '16:9',
        contentPrompt: 'test'
      });

      const svg2 = service.generatePattern({
        theme: testTheme,
        aspectRatio: '16:9',
        contentPrompt: 'test'
      });

      expect(svg1).toBe(svg2);
    });
  });

  describe('generateSolid', () => {
    it('should generate gradient SVG', () => {
      const svg = service.generateSolid({
        theme: testTheme,
        aspectRatio: '16:9'
      });

      expect(svg).toContain('<svg');
      expect(svg).toContain('linearGradient');
      expect(svg).toContain(testTheme.colors.primary);
      expect(svg).toContain(testTheme.colors.secondary);
    });

    it('should use provided dimensions', () => {
      const svg = service.generateSolid({
        theme: testTheme,
        aspectRatio: '1:1'
      });

      expect(svg).toContain('width="1000"');
      expect(svg).toContain('height="1000"');
    });
  });

  describe('simpleHash', () => {
    it('should generate consistent hash for same input', () => {
      const hash1 = service.simpleHash('test string');
      const hash2 = service.simpleHash('test string');

      expect(hash1).toBe(hash2);
    });

    it('should generate different hashes for different inputs', () => {
      const hash1 = service.simpleHash('string 1');
      const hash2 = service.simpleHash('string 2');

      expect(hash1).not.toBe(hash2);
    });

    it('should return non-negative integers', () => {
      const hash = service.simpleHash('test');

      expect(hash).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(hash)).toBe(true);
    });
  });

  describe('getThemeColors', () => {
    it('should extract colors from theme', () => {
      const colors = service.getThemeColors(testTheme);

      expect(colors.primary).toBe(testTheme.colors.primary);
      expect(colors.secondary).toBe(testTheme.colors.secondary);
      expect(colors.accent).toBe(testTheme.colors.accent);
      expect(colors.background).toBe(testTheme.colors.background);
      expect(colors.all).toHaveLength(3);
    });

    it('should use defaults for missing theme', () => {
      const colors = service.getThemeColors({});

      expect(colors.primary).toBeDefined();
      expect(colors.secondary).toBeDefined();
      expect(colors.all).toHaveLength(3);
    });
  });

  describe('parseAspectRatio', () => {
    it('should parse standard ratios correctly', () => {
      expect(service.parseAspectRatio('16:9')).toEqual([1600, 900]);
      expect(service.parseAspectRatio('1:1')).toEqual([1000, 1000]);
      expect(service.parseAspectRatio('4:3')).toEqual([1200, 900]);
      expect(service.parseAspectRatio('9:16')).toEqual([900, 1600]);
      expect(service.parseAspectRatio('3:4')).toEqual([900, 1200]);
    });

    it('should default to 16:9 for unknown ratios', () => {
      expect(service.parseAspectRatio('unknown')).toEqual([1600, 900]);
    });
  });

  describe('SVG generation methods', () => {
    it('generateTriangles should create triangle elements', () => {
      const svg = service.generateTriangles(1600, 900, {
        all: ['#000', '#111', '#222'],
        background: '#fff'
      }, 12345);

      expect(svg).toContain('<polygon');
      expect(svg).toContain('points=');
    });

    it('generateCircles should create circle elements', () => {
      const svg = service.generateCircles(1600, 900, {
        all: ['#000', '#111', '#222'],
        background: '#fff'
      }, 12345);

      expect(svg).toContain('<circle');
      expect(svg).toContain('cx=');
      expect(svg).toContain('cy=');
      expect(svg).toContain('r=');
    });

    it('generateDots should create dot grid', () => {
      const svg = service.generateDots(1600, 900, {
        all: ['#000', '#111', '#222'],
        background: '#fff'
      }, 12345);

      expect(svg).toContain('<circle');
    });

    it('generateWaves should create wave paths', () => {
      const svg = service.generateWaves(1600, 900, {
        all: ['#000', '#111', '#222'],
        background: '#fff'
      }, 12345);

      expect(svg).toContain('<path');
      expect(svg).toContain('d="M');
    });
  });

  describe('Integration with PlaceholderAdapter', () => {
    it('should generate SVG suitable for data URL encoding', () => {
      const svg = service.generateGeometric({
        theme: testTheme,
        aspectRatio: '16:9',
        contentPrompt: 'test'
      });

      // Should be valid for base64 encoding
      expect(() => Buffer.from(svg).toString('base64')).not.toThrow();

      // Should not contain problematic characters for data URL
      expect(svg).not.toContain('<script');
      expect(svg).not.toContain('javascript:');
    });
  });
});
