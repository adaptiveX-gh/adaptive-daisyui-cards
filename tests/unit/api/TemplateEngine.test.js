/**
 * Unit tests for TemplateEngine
 */

import { describe, it, expect } from 'vitest';
import TemplateEngine from '../../api/services/TemplateEngine.js';
import { Card } from '../../api/models/Card.js';

describe('TemplateEngine', () => {
  const engine = new TemplateEngine();

  describe('template loading', () => {
    it('should load all layout templates', () => {
      expect(engine.templates).toHaveProperty('split');
      expect(engine.templates).toHaveProperty('numbered-list');
      expect(engine.templates).toHaveProperty('grid');
      expect(engine.templates).toHaveProperty('hero');
      expect(engine.templates).toHaveProperty('hero-overlay');
      expect(engine.templates).toHaveProperty('content-bullets');
    });
  });

  describe('render', () => {
    it('should render split layout', () => {
      const card = new Card({
        type: 'test',
        layout: 'split',
        content: {
          title: 'Test Title',
          body: 'Test body content'
        },
        theme: { name: 'light' }
      });

      const html = engine.render(card);
      expect(html).toContain('split-layout');
      expect(html).toContain('Test Title');
      expect(html).toContain('Test body content');
      expect(html).toContain(card.id);
    });

    it('should render numbered-list layout', () => {
      const card = new Card({
        type: 'objectives',
        layout: 'numbered-list',
        content: {
          intro: 'Learning objectives:',
          items: ['Item 1', 'Item 2', 'Item 3']
        },
        theme: { name: 'light' }
      });

      const html = engine.render(card);
      expect(html).toContain('numbered-list');
      expect(html).toContain('Learning objectives:');
      expect(html).toContain('Item 1');
      expect(html).toContain('Item 2');
      expect(html).toContain('Item 3');
    });

    it('should render grid layout', () => {
      const card = new Card({
        type: 'features',
        layout: 'grid',
        content: {
          title: 'Key Features',
          cells: [
            { title: 'Feature 1', body: 'Description 1' },
            { title: 'Feature 2', body: 'Description 2' },
            { title: 'Feature 3', body: 'Description 3' },
            { title: 'Feature 4', body: 'Description 4' }
          ]
        },
        theme: { name: 'light' }
      });

      const html = engine.render(card);
      expect(html).toContain('grid');
      expect(html).toContain('Key Features');
      expect(html).toContain('Feature 1');
      expect(html).toContain('Description 1');
      expect(html).toContain('Feature 4');
    });

    it('should render hero layout', () => {
      const card = new Card({
        type: 'title',
        layout: 'hero',
        content: {
          title: 'Welcome',
          subtitle: 'To our presentation',
          kicker: 'Introduction'
        },
        theme: { name: 'light' }
      });

      const html = engine.render(card);
      expect(html).toContain('hero-layout');
      expect(html).toContain('Welcome');
      expect(html).toContain('To our presentation');
      expect(html).toContain('Introduction');
    });

    it('should render hero-overlay layout', () => {
      const card = new Card({
        type: 'title',
        layout: 'hero-overlay',
        content: {
          title: 'Big Announcement',
          subtitle: 'Something exciting'
        },
        theme: { name: 'dark' }
      });

      const html = engine.render(card);
      expect(html).toContain('hero-layout');
      expect(html).toContain('overlay');
      expect(html).toContain('Big Announcement');
      expect(html).toContain('Something exciting');
    });

    it('should render content-bullets layout', () => {
      const card = new Card({
        type: 'benefits',
        layout: 'content-bullets',
        content: {
          title: 'Key Benefits',
          bullets: ['Benefit 1', 'Benefit 2', 'Benefit 3'],
          footnote: 'Terms apply'
        },
        theme: { name: 'light' }
      });

      const html = engine.render(card);
      expect(html).toContain('content-bullets');
      expect(html).toContain('Key Benefits');
      expect(html).toContain('Benefit 1');
      expect(html).toContain('Terms apply');
    });

    it('should handle array body in split layout', () => {
      const card = new Card({
        type: 'process',
        layout: 'split',
        content: {
          title: 'Process Steps',
          body: ['Step 1', 'Step 2', 'Step 3']
        },
        theme: { name: 'light' }
      });

      const html = engine.render(card);
      expect(html).toContain('Step 1');
      expect(html).toContain('Step 2');
      expect(html).toContain('Step 3');
    });

    it('should throw error for unknown layout', () => {
      const card = new Card({
        type: 'test',
        layout: 'unknown-layout',
        content: { title: 'Test' },
        theme: { name: 'light' }
      });

      expect(() => {
        engine.render(card);
      }).toThrow('Template not found');
    });
  });

  describe('renderCards', () => {
    it('should render multiple cards', () => {
      const cards = [
        new Card({
          type: 'title',
          layout: 'hero',
          content: { title: 'Card 1' },
          theme: { name: 'light' }
        }),
        new Card({
          type: 'content',
          layout: 'content-bullets',
          content: { title: 'Card 2', bullets: ['Item 1'] },
          theme: { name: 'light' }
        })
      ];

      const html = engine.renderCards(cards);
      expect(html).toContain('Card 1');
      expect(html).toContain('Card 2');
      expect(html).toContain('card-container');
    });
  });

  describe('renderPage', () => {
    it('should render complete HTML page', () => {
      const cards = [
        new Card({
          type: 'title',
          layout: 'hero',
          content: { title: 'Test Presentation' },
          theme: { name: 'light' }
        })
      ];

      const html = engine.renderPage(cards, {
        title: 'My Presentation',
        theme: 'corporate'
      });

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('My Presentation');
      expect(html).toContain('data-theme="corporate"');
      expect(html).toContain('Test Presentation');
    });

    it('should include controls when requested', () => {
      const cards = [
        new Card({
          type: 'title',
          layout: 'hero',
          content: { title: 'Test' },
          theme: { name: 'light' }
        })
      ];

      const html = engine.renderPage(cards, {
        includeControls: true
      });

      expect(html).toContain('theme-select');
      expect(html).toContain('width-slider');
    });
  });

  describe('renderSkeleton', () => {
    it('should render skeleton placeholder', () => {
      const html = engine.renderSkeleton('hero', 'test-id-123');
      expect(html).toContain('animate-pulse');
      expect(html).toContain('test-id-123');
      expect(html).toContain('data-layout="hero"');
    });
  });

  describe('exportJSON', () => {
    it('should export cards as JSON', () => {
      const cards = [
        new Card({
          type: 'title',
          layout: 'hero',
          content: { title: 'Test' },
          theme: { name: 'light' }
        }).toJSON()
      ];

      const json = engine.exportJSON(cards);
      expect(json).toBeTruthy();
      expect(typeof json).toBe('string');

      const parsed = JSON.parse(json);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed[0]).toHaveProperty('id');
      expect(parsed[0]).toHaveProperty('layout');
    });
  });

  describe('exportBundle', () => {
    it('should export static HTML bundle', () => {
      const cards = [
        new Card({
          type: 'title',
          layout: 'hero',
          content: { title: 'Test' },
          theme: { name: 'light' }
        }).toJSON()
      ];

      const bundle = engine.exportBundle(cards);
      expect(bundle).toHaveProperty('index.html');
      expect(bundle).toHaveProperty('readme.txt');
      expect(bundle['index.html']).toContain('<!DOCTYPE html>');
      expect(bundle['index.html']).toContain('./output.css');
    });
  });

  describe('CSS classes', () => {
    it('should include container-query classes', () => {
      const card = new Card({
        type: 'test',
        layout: 'split',
        content: { title: 'Test', body: 'Body' },
        theme: { name: 'light' }
      });

      const html = engine.render(card);
      expect(html).toContain('adaptive-text');
    });

    it('should include layout-specific classes', () => {
      const card = new Card({
        type: 'test',
        layout: 'hero',
        content: { title: 'Test' },
        theme: { name: 'light' }
      });

      const html = engine.render(card);
      expect(html).toContain('hero-title');
      expect(html).toContain('hero-content');
    });
  });
});
