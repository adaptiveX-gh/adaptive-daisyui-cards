/**
 * Prompt Enhancer Unit Tests
 */

import { describe, it, expect } from 'vitest';
import {
  enhancePrompt,
  sanitizePrompt,
  validatePrompt,
  generateImagePromptFromCard
} from '../../../api/utils/promptEnhancer.js';

describe('promptEnhancer', () => {
  describe('enhancePrompt', () => {
    it('should enhance basic prompt', () => {
      const result = enhancePrompt('AI technology', 'professional-presentation');

      expect(result).toContain('AI technology');
      expect(result).toContain('Professional presentation');
      expect(result).toContain('high quality');
    });

    it('should add style-specific enhancements', () => {
      const professional = enhancePrompt('test', 'professional-presentation');
      const abstract = enhancePrompt('test', 'abstract');

      expect(professional).toContain('professional');
      expect(abstract).toContain('abstract');
    });

    it('should add theme enhancements', () => {
      const result = enhancePrompt('test', 'professional', 'cyberpunk');

      expect(result).toContain('cyberpunk');
    });

    it('should detect content keywords', () => {
      const aiPrompt = enhancePrompt('AI technology', 'professional');
      const dataPrompt = enhancePrompt('data analytics', 'professional');

      expect(aiPrompt.toLowerCase()).toContain('ai');
      expect(dataPrompt.toLowerCase()).toContain('data');
    });

    it('should throw for empty prompt', () => {
      expect(() => enhancePrompt('')).toThrow();
    });
  });

  describe('sanitizePrompt', () => {
    it('should remove dangerous characters', () => {
      const result = sanitizePrompt('test<script>alert()</script>test');

      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });

    it('should limit length', () => {
      const longPrompt = 'a'.repeat(1000);
      const result = sanitizePrompt(longPrompt);

      expect(result.length).toBeLessThanOrEqual(500);
    });

    it('should normalize whitespace', () => {
      const result = sanitizePrompt('test    multiple     spaces');

      expect(result).toBe('test multiple spaces');
    });

    it('should handle empty input', () => {
      expect(sanitizePrompt('')).toBe('');
      expect(sanitizePrompt(null)).toBe('');
    });
  });

  describe('validatePrompt', () => {
    it('should validate correct prompts', () => {
      const result = validatePrompt('Valid prompt here');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty prompts', () => {
      const result = validatePrompt('');

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject too short prompts', () => {
      const result = validatePrompt('ab');

      expect(result.valid).toBe(false);
    });

    it('should reject too long prompts', () => {
      const longPrompt = 'a'.repeat(600);
      const result = validatePrompt(longPrompt);

      expect(result.valid).toBe(false);
    });

    it('should reject non-string input', () => {
      const result = validatePrompt(null);

      expect(result.valid).toBe(false);
    });
  });

  describe('generateImagePromptFromCard', () => {
    it('should generate prompt from hero card', () => {
      const card = {
        type: 'hero',
        layout: 'hero',
        content: {
          title: 'AI in Product Discovery',
          subtitle: 'Transform ideas'
        }
      };

      const prompt = generateImagePromptFromCard(card);

      expect(prompt).toContain('AI in Product Discovery');
    });

    it('should use explicit imagePrompt if provided', () => {
      const card = {
        type: 'hero',
        content: {
          imagePrompt: 'Custom prompt here'
        }
      };

      const prompt = generateImagePromptFromCard(card);

      expect(prompt).toBe('Custom prompt here');
    });

    it('should handle different card types', () => {
      const types = ['title', 'objectives', 'grid', 'content-bullets'];

      for (const type of types) {
        const card = {
          type,
          layout: type,
          content: {
            title: 'Test Title',
            intro: 'Test intro'
          }
        };

        const prompt = generateImagePromptFromCard(card);
        expect(prompt).toBeDefined();
        expect(prompt.length).toBeGreaterThan(0);
      }
    });

    it('should provide fallback for unknown types', () => {
      const card = {
        type: 'unknown',
        content: {
          title: 'Fallback Test'
        }
      };

      const prompt = generateImagePromptFromCard(card);

      expect(prompt).toContain('Fallback Test');
    });
  });
});
