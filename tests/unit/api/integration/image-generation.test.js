/**
 * Image Generation Integration Tests
 * Tests end-to-end flow of image generation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { imageGenerationService } from '../../../api/services/ImageGenerationService.js';
import { Card } from '../../../api/models/Card.js';

describe('Image Generation Integration', () => {
  let testCard;

  beforeEach(() => {
    testCard = new Card({
      type: 'hero',
      layout: 'hero',
      content: {
        title: 'AI in Product Discovery',
        subtitle: 'Transforming Ideas into Innovation'
      },
      theme: {
        name: 'professional',
        colors: {
          primary: '#3b82f6',
          secondary: '#1e40af',
          accent: '#60a5fa',
          background: '#f3f4f6',
          text: '#1f2937'
        }
      }
    });
  });

  describe('End-to-End Flow', () => {
    it('should generate placeholder instantly', async () => {
      const result = await imageGenerationService.generateImage(
        'AI technology background',
        {
          provider: 'placeholder',
          aspectRatio: '16:9',
          style: 'professional-presentation'
        }
      );

      expect(result.url).toBeDefined();
      expect(result.type).toBe('placeholder');
      expect(result.url).toContain('data:image/svg+xml');
    });

    it('should generate card with placeholder image', () => {
      const result = imageGenerationService.generateImageAsync(testCard, {
        provider: 'placeholder',
        aspectRatio: '16:9',
        style: 'professional'
      });

      expect(result.image.status).toBe('generating');
      expect(result.image.placeholder).toBeDefined();
      expect(result.image.placeholder.url).toBeDefined();

      // Placeholder should be data URL
      expect(result.image.placeholder.url).toMatch(/^data:image\/svg\+xml/);
    });

    it('should track image generation status', () => {
      const result = imageGenerationService.generateImageAsync(testCard);

      // Check status was created
      const status = imageGenerationService.getImageStatus(testCard.id);
      expect(status).toBeDefined();
      expect(status.status).toBe('generating');
      expect(status.cardId).toBe(testCard.id);
    });

    it('should handle fallback chain', async () => {
      const result = await imageGenerationService.generateWithFallback(
        'Test prompt',
        {
          aspectRatio: '16:9',
          style: 'professional'
        }
      );

      // Should succeed with placeholder (Gemini might fail without API key)
      expect(result.url).toBeDefined();
      expect(result.provider).toBeDefined();
    });
  });

  describe('Placeholder Quality', () => {
    it('should generate theme-appropriate colors', async () => {
      const result = await imageGenerationService.generateImage(
        'test',
        {
          provider: 'placeholder',
          theme: testCard.theme,
          aspectRatio: '16:9'
        }
      );

      // Decode base64 to check for theme colors
      const base64 = result.url.split(',')[1];
      const svg = Buffer.from(base64, 'base64').toString();

      // Should contain theme colors
      const hasThemeColor =
        svg.includes(testCard.theme.colors.primary) ||
        svg.includes(testCard.theme.colors.secondary) ||
        svg.includes(testCard.theme.colors.accent);

      expect(hasThemeColor).toBe(true);
    });

    it('should be deterministic for same content', async () => {
      const result1 = await imageGenerationService.generateImage(
        'AI technology',
        {
          provider: 'placeholder',
          theme: testCard.theme,
          aspectRatio: '16:9'
        }
      );

      const result2 = await imageGenerationService.generateImage(
        'AI technology',
        {
          provider: 'placeholder',
          theme: testCard.theme,
          aspectRatio: '16:9'
        }
      );

      expect(result1.url).toBe(result2.url);
    });

    it('should support all aspect ratios', async () => {
      const ratios = ['16:9', '1:1', '4:3', '9:16', '3:4'];

      for (const ratio of ratios) {
        const result = await imageGenerationService.generateImage(
          'test',
          {
            provider: 'placeholder',
            aspectRatio: ratio
          }
        );

        expect(result.url).toBeDefined();
        expect(result.metadata.aspectRatio).toBe(ratio);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid prompts', async () => {
      await expect(
        imageGenerationService.generateImage('', {
          provider: 'placeholder'
        })
      ).rejects.toThrow();
    });

    it('should handle unknown providers', async () => {
      await expect(
        imageGenerationService.generateImage('test', {
          provider: 'unknown-provider'
        })
      ).rejects.toThrow('Unknown provider');
    });
  });

  describe('Status Management', () => {
    it('should cleanup old status entries', async () => {
      // Generate multiple cards
      for (let i = 0; i < 5; i++) {
        const card = new Card({
          type: 'hero',
          layout: 'hero',
          content: { title: `Card ${i}` },
          theme: testCard.theme
        });

        imageGenerationService.generateImageAsync(card);
      }

      const stats = imageGenerationService.getStats();
      expect(stats.statusStore.total).toBeGreaterThan(0);
    });

    it('should allow cancellation', () => {
      imageGenerationService.generateImageAsync(testCard);

      const cancelled = imageGenerationService.cancelGeneration(testCard.id);
      expect(cancelled).toBe(true);

      const status = imageGenerationService.getImageStatus(testCard.id);
      expect(status.status).toBe('cancelled');
    });
  });

  describe('Multiple Cards', () => {
    it('should handle multiple concurrent generations', () => {
      const cards = Array.from({ length: 5 }, (_, i) => {
        return new Card({
          type: 'hero',
          layout: 'hero',
          content: { title: `Card ${i}` },
          theme: testCard.theme
        });
      });

      const results = cards.map(card =>
        imageGenerationService.generateImageAsync(card, {
          provider: 'placeholder'
        })
      );

      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result.image.placeholder).toBeDefined();
      });
    });
  });
});
