/**
 * ImageGenerationService Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import ImageGenerationService from '../../../api/services/ImageGenerationService.js';
import ImageStatusStore from '../../../api/services/ImageStatusStore.js';

describe('ImageGenerationService', () => {
  let service;
  let statusStore;

  beforeEach(() => {
    statusStore = new ImageStatusStore();
    service = new ImageGenerationService({
      statusStore,
      fallbackEnabled: true
    });
  });

  describe('constructor', () => {
    it('should initialize with default providers', () => {
      expect(service.providers).toHaveProperty('gemini');
      expect(service.providers).toHaveProperty('placeholder');
    });

    it('should initialize with default fallback chain', () => {
      expect(service.fallbackChain).toEqual(['gemini', 'placeholder']);
    });

    it('should have fallback enabled by default', () => {
      expect(service.fallbackEnabled).toBe(true);
    });
  });

  describe('generateImage', () => {
    it('should generate with placeholder provider', async () => {
      const result = await service.generateImage('test prompt', {
        provider: 'placeholder',
        aspectRatio: '16:9',
        style: 'professional-presentation'
      });

      expect(result.url).toBeDefined();
      expect(result.type).toBe('placeholder');
      expect(result.provider).toBe('placeholder');
    });

    it('should throw error for unknown provider', async () => {
      await expect(
        service.generateImage('test', { provider: 'unknown' })
      ).rejects.toThrow('Unknown provider');
    });

    it('should sanitize prompt', async () => {
      const result = await service.generateImage('  test  ', {
        provider: 'placeholder'
      });

      expect(result).toBeDefined();
    });
  });

  describe('generateWithFallback', () => {
    it('should try providers in fallback chain', async () => {
      // Mock Gemini to fail, placeholder to succeed
      const mockGemini = vi.spyOn(service.providers.gemini, 'generateWithRetry')
        .mockRejectedValue(new Error('Gemini failed'));

      const result = await service.generateWithFallback('test prompt');

      expect(mockGemini).toHaveBeenCalled();
      expect(result.provider).toBe('placeholder'); // Fell back to placeholder
    });

    it('should succeed with first working provider', async () => {
      const result = await service.generateWithFallback('test prompt', {
        fallbackChain: ['placeholder']  // Skip Gemini
      });

      expect(result.provider).toBe('placeholder');
    });

    it('should throw if all providers fail when fallback disabled', async () => {
      service.fallbackEnabled = false;

      const mockGemini = vi.spyOn(service.providers.gemini, 'generateWithRetry')
        .mockRejectedValue(new Error('Gemini failed'));

      await expect(
        service.generateWithFallback('test')
      ).rejects.toThrow();
    });
  });

  describe('generateImageAsync', () => {
    it('should return placeholder immediately', () => {
      const card = {
        id: 'test-card-123',
        type: 'hero',
        layout: 'hero',
        content: {
          title: 'Test Title'
        },
        theme: {
          colors: {
            primary: '#3b82f6'
          }
        }
      };

      const result = service.generateImageAsync(card, {
        provider: 'gemini',
        aspectRatio: '16:9',
        style: 'professional'
      });

      expect(result.image.status).toBe('generating');
      expect(result.image.placeholder).toBeDefined();
      expect(result.image.placeholder.type).toBeDefined();
      expect(result.image.placeholder.url).toBeDefined();
    });

    it('should create status entry', () => {
      const card = {
        id: 'test-card-456',
        content: { title: 'Test' },
        theme: { colors: { primary: '#000' } }
      };

      service.generateImageAsync(card);

      const status = statusStore.get('test-card-456');
      expect(status).toBeDefined();
      expect(status.status).toBe('generating');
      expect(status.provider).toBeDefined();
    });
  });

  describe('getImageStatus', () => {
    it('should return null for non-existent card', () => {
      const status = service.getImageStatus('non-existent');
      expect(status).toBeNull();
    });

    it('should return status for existing card', () => {
      statusStore.set('test-card', {
        status: 'generating',
        provider: 'gemini',
        startedAt: new Date().toISOString()
      });

      const status = service.getImageStatus('test-card');
      expect(status).toBeDefined();
      expect(status.cardId).toBe('test-card');
      expect(status.status).toBe('generating');
    });
  });

  describe('cancelGeneration', () => {
    it('should return false for non-existent card', () => {
      const result = service.cancelGeneration('non-existent');
      expect(result).toBe(false);
    });

    it('should cancel existing generation', () => {
      statusStore.set('test-card', {
        status: 'generating',
        provider: 'gemini'
      });

      const result = service.cancelGeneration('test-card');
      expect(result).toBe(true);

      const status = statusStore.get('test-card');
      expect(status.status).toBe('cancelled');
    });
  });

  describe('getProviderStatuses', () => {
    it('should return status for all providers', () => {
      const statuses = service.getProviderStatuses();

      expect(statuses).toHaveProperty('gemini');
      expect(statuses).toHaveProperty('placeholder');
      expect(statuses.placeholder.available).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should return service statistics', () => {
      const stats = service.getStats();

      expect(stats).toHaveProperty('providers');
      expect(stats).toHaveProperty('fallbackChain');
      expect(stats).toHaveProperty('fallbackEnabled');
      expect(stats).toHaveProperty('statusStore');
    });
  });

  describe('testProvider', () => {
    it('should return success for placeholder', async () => {
      const result = await service.testProvider('placeholder');

      expect(result.provider).toBe('placeholder');
      expect(result.success).toBe(true);
    });

    it('should return error for unknown provider', async () => {
      const result = await service.testProvider('unknown');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Provider not found');
    });
  });
});
