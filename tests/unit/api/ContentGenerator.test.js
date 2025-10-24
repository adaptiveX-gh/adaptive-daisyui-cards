/**
 * Unit tests for ContentGenerator
 */

import { describe, it, expect } from 'vitest';
import ContentGenerator from '../../api/services/ContentGenerator.js';

describe('ContentGenerator', () => {
  const generator = new ContentGenerator();

  describe('getAvailableTopics', () => {
    it('should return list of available topics', () => {
      const topics = generator.getAvailableTopics();
      expect(topics).toBeInstanceOf(Array);
      expect(topics.length).toBeGreaterThan(0);
      expect(topics).toContain('AI in Product Discovery');
      expect(topics).toContain('Digital Marketing Trends 2025');
      expect(topics).toContain('Remote Team Management');
    });
  });

  describe('getTopicSections', () => {
    it('should return sections for valid topic', () => {
      const sections = generator.getTopicSections('AI in Product Discovery');
      expect(sections).toBeInstanceOf(Array);
      expect(sections.length).toBeGreaterThan(0);
      expect(sections).toContain('title');
      expect(sections).toContain('objectives');
    });

    it('should throw error for invalid topic', () => {
      expect(() => {
        generator.getTopicSections('Invalid Topic');
      }).toThrow();
    });
  });

  describe('generateCardContent', () => {
    it('should generate content for valid topic and layout', () => {
      const result = generator.generateCardContent({
        topic: 'AI in Product Discovery',
        layoutType: 'numbered-list',
        tone: 'professional'
      });

      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('layout');
      expect(result).toHaveProperty('content');
      expect(result.layout).toBe('numbered-list');
    });

    it('should generate hero-overlay for title section', () => {
      const result = generator.generateCardContent({
        topic: 'AI in Product Discovery',
        layoutType: 'hero-overlay',
        contentSections: ['title']
      });

      expect(result.type).toBe('title');
      expect(result.layout).toBe('hero-overlay');
      expect(result.content).toHaveProperty('title');
      expect(result.content.title).toBe('AI in Product Discovery');
    });

    it('should generate numbered-list for objectives', () => {
      const result = generator.generateCardContent({
        topic: 'AI in Product Discovery',
        layoutType: 'numbered-list',
        contentSections: ['objectives']
      });

      expect(result.type).toBe('objectives');
      expect(result.layout).toBe('numbered-list');
      expect(result.content).toHaveProperty('items');
      expect(Array.isArray(result.content.items)).toBe(true);
      expect(result.content.items.length).toBeGreaterThan(0);
    });

    it('should generate grid layout content', () => {
      const result = generator.generateCardContent({
        topic: 'AI in Product Discovery',
        layoutType: 'grid',
        contentSections: ['process']
      });

      expect(result.type).toBe('process');
      expect(result.layout).toBe('grid');
      expect(result.content).toHaveProperty('cells');
      expect(Array.isArray(result.content.cells)).toBe(true);
      expect(result.content.cells.length).toBe(4);
    });

    it('should throw error for invalid topic', () => {
      expect(() => {
        generator.generateCardContent({
          topic: 'Invalid Topic',
          layoutType: 'hero'
        });
      }).toThrow('Unknown topic');
    });
  });

  describe('generatePresentation', () => {
    it('should generate complete presentation', () => {
      const result = generator.generatePresentation({
        topic: 'AI in Product Discovery',
        cardCount: 6,
        style: 'professional'
      });

      expect(result).toHaveProperty('cards');
      expect(result).toHaveProperty('topic');
      expect(result).toHaveProperty('cardCount');
      expect(Array.isArray(result.cards)).toBe(true);
      expect(result.cards.length).toBeLessThanOrEqual(6);
      expect(result.topic).toBe('AI in Product Discovery');
    });

    it('should include image placeholders when requested', () => {
      const result = generator.generatePresentation({
        topic: 'AI in Product Discovery',
        cardCount: 3,
        includeImages: true
      });

      const cardsWithImages = result.cards.filter(card =>
        card.image && card.placeholders
      );

      expect(cardsWithImages.length).toBeGreaterThan(0);
    });

    it('should respect card count limit', () => {
      const result = generator.generatePresentation({
        topic: 'Remote Team Management',
        cardCount: 3
      });

      expect(result.cards.length).toBeLessThanOrEqual(3);
    });

    it('should throw error for invalid topic', () => {
      expect(() => {
        generator.generatePresentation({
          topic: 'Nonexistent Topic'
        });
      }).toThrow('Unknown topic');
    });
  });

  describe('content validation', () => {
    it('should generate valid split layout content', () => {
      const result = generator.generateCardContent({
        topic: 'AI in Product Discovery',
        layoutType: 'split'
      });

      expect(result.content).toHaveProperty('title');
      expect(result.content).toHaveProperty('body');
    });

    it('should generate valid content-bullets layout', () => {
      const result = generator.generateCardContent({
        topic: 'Digital Marketing Trends 2025',
        layoutType: 'content-bullets'
      });

      expect(result.content).toHaveProperty('title');
      expect(result.content).toHaveProperty('bullets');
      expect(Array.isArray(result.content.bullets)).toBe(true);
    });

    it('should generate valid hero layout content', () => {
      const result = generator.generateCardContent({
        topic: 'Remote Team Management',
        layoutType: 'hero'
      });

      expect(result.content).toHaveProperty('title');
      expect(typeof result.content.title).toBe('string');
    });
  });
});
