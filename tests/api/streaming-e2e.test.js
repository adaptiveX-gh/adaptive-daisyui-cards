/**
 * SSE Streaming End-to-End Integration Tests
 * Phase 3: Streaming Architecture
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import app from '../../api/server.js';

const PORT = 3001; // Use different port for tests
const BASE_URL = `http://localhost:${PORT}`;

let server;

beforeAll(() => {
  return new Promise((resolve) => {
    server = app.listen(PORT, () => {
      console.log(`Test server running on port ${PORT}`);
      resolve();
    });
  });
});

afterAll(() => {
  return new Promise((resolve) => {
    if (server) {
      server.close(() => {
        console.log('Test server stopped');
        resolve();
      });
    } else {
      resolve();
    }
  });
});

describe('SSE Streaming Integration Tests', () => {
  describe('POST /api/presentations/stream', () => {
    it('should stream presentation with all stages', async () => {
      const response = await fetch(`${BASE_URL}/api/presentations/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify({
          topic: 'Test Topic',
          cardCount: 2,
          style: 'professional',
          includeImages: false,
          streamDelay: 10
        })
      });

      expect(response.ok).toBe(true);
      expect(response.headers.get('content-type')).toBe('text/event-stream');

      // Read stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const events = [];
      let buffer = '';

      let attempts = 0;
      const maxAttempts = 50;

      while (attempts < maxAttempts) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              events.push(data);

              // Stop when we receive complete event
              if (data.stage === undefined && data.completedAt) {
                reader.cancel();
                break;
              }
            } catch (e) {
              // Skip unparseable lines
            }
          }
        }

        attempts++;
      }

      // Verify we received events
      expect(events.length).toBeGreaterThan(0);

      // Verify stage order
      const stages = events.filter(e => e.stage).map(e => e.stage);
      expect(stages).toContain('skeleton');
      expect(stages).toContain('content');
      expect(stages).toContain('style');

      // Verify skeleton has cards
      const skeletonEvent = events.find(e => e.stage === 'skeleton');
      expect(skeletonEvent).toBeDefined();
      expect(skeletonEvent.cards).toBeInstanceOf(Array);
      expect(skeletonEvent.cardCount).toBe(2);

      // Verify content events have cardId and section
      const contentEvents = events.filter(e => e.stage === 'content');
      expect(contentEvents.length).toBeGreaterThan(0);
      contentEvents.forEach(event => {
        expect(event.cardId).toBeDefined();
        expect(event.section).toBeDefined();
        expect(event.content).toBeDefined();
      });

      // Verify style events
      const styleEvents = events.filter(e => e.stage === 'style');
      expect(styleEvents.length).toBe(2); // One per card
      styleEvents.forEach(event => {
        expect(event.cardId).toBeDefined();
        expect(event.styles).toBeDefined();
      });

      // Verify completion
      const completeEvent = events.find(e => e.completedAt);
      expect(completeEvent).toBeDefined();
    }, 10000); // 10 second timeout

    it('should include placeholder and image stages when requested', async () => {
      const response = await fetch(`${BASE_URL}/api/presentations/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify({
          topic: 'Test Topic',
          cardCount: 1,
          style: 'professional',
          includeImages: true,
          provider: 'placeholder', // Use placeholder for fast test
          streamDelay: 10
        })
      });

      expect(response.ok).toBe(true);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const events = [];
      let buffer = '';

      let attempts = 0;
      const maxAttempts = 50;

      while (attempts < maxAttempts) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              events.push(data);

              if (data.completedAt) {
                reader.cancel();
                break;
              }
            } catch (e) {
              // Skip
            }
          }
        }

        attempts++;
      }

      const stages = events.filter(e => e.stage).map(e => e.stage);
      expect(stages).toContain('placeholder');
    }, 10000);

    it('should handle invalid requests', async () => {
      const response = await fetch(`${BASE_URL}/api/presentations/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          // Missing topic
          cardCount: 5
        })
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
    });

    it('should validate Accept header', async () => {
      const response = await fetch(`${BASE_URL}/api/presentations/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json' // Wrong accept header
        },
        body: JSON.stringify({
          topic: 'Test',
          cardCount: 1
        })
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(406);
    });
  });

  describe('POST /api/cards/stream', () => {
    it('should stream single card generation', async () => {
      const response = await fetch(`${BASE_URL}/api/cards/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify({
          topic: 'Single Card Test',
          layoutType: 'split',
          style: 'professional',
          includeImages: false
        })
      });

      expect(response.ok).toBe(true);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const events = [];
      let buffer = '';

      let attempts = 0;
      const maxAttempts = 30;

      while (attempts < maxAttempts) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              events.push(data);

              if (data.completedAt) {
                reader.cancel();
                break;
              }
            } catch (e) {
              // Skip
            }
          }
        }

        attempts++;
      }

      expect(events.length).toBeGreaterThan(0);

      const stages = events.filter(e => e.stage).map(e => e.stage);
      expect(stages).toContain('skeleton');
      expect(stages).toContain('content');
    }, 10000);
  });

  describe('GET /api/stream/demo', () => {
    it('should stream demo with delays', async () => {
      const response = await fetch(`${BASE_URL}/api/stream/demo?delay=50`, {
        method: 'GET',
        headers: {
          'Accept': 'text/event-stream'
        }
      });

      expect(response.ok).toBe(true);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const events = [];
      let buffer = '';

      let attempts = 0;
      const maxAttempts = 50;

      while (attempts < maxAttempts) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              events.push(data);

              if (data.completedAt) {
                reader.cancel();
                break;
              }
            } catch (e) {
              // Skip
            }
          }
        }

        attempts++;
      }

      expect(events.length).toBeGreaterThan(0);
    }, 10000);
  });

  describe('Sequence Numbers', () => {
    it('should include sequence numbers in messages', async () => {
      const response = await fetch(`${BASE_URL}/api/presentations/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify({
          topic: 'Sequence Test',
          cardCount: 1,
          includeImages: false,
          streamDelay: 10
        })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const events = [];
      let buffer = '';

      let attempts = 0;
      while (attempts < 30) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              events.push(data);

              if (data.completedAt) {
                reader.cancel();
                break;
              }
            } catch (e) {
              // Skip
            }
          }
        }

        attempts++;
      }

      // Check sequence numbers
      const sequences = events
        .filter(e => e.sequence !== undefined)
        .map(e => e.sequence);

      expect(sequences.length).toBeGreaterThan(0);

      // Verify sequences are incrementing
      for (let i = 1; i < sequences.length; i++) {
        expect(sequences[i]).toBeGreaterThan(sequences[i - 1]);
      }
    }, 10000);
  });

  describe('Progress Events', () => {
    it('should receive progress events during streaming', async () => {
      const response = await fetch(`${BASE_URL}/api/presentations/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify({
          topic: 'Progress Test',
          cardCount: 3,
          includeImages: false,
          streamDelay: 10
        })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let hasProgressEvent = false;

      let attempts = 0;
      while (attempts < 50) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event: progress')) {
            hasProgressEvent = true;
            reader.cancel();
            break;
          }
        }

        if (hasProgressEvent) break;
        attempts++;
      }

      expect(hasProgressEvent).toBe(true);
    }, 10000);
  });

  describe('Error Handling', () => {
    it('should handle card count validation', async () => {
      const response = await fetch(`${BASE_URL}/api/presentations/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topic: 'Test',
          cardCount: 999 // Invalid count
        })
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
    });
  });
});

describe('SSE Message Format Validation', () => {
  it('should send properly formatted SSE messages', async () => {
    const response = await fetch(`${BASE_URL}/api/stream/demo?delay=10`, {
      headers: { 'Accept': 'text/event-stream' }
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let foundValidMessage = false;

    let attempts = 0;
    while (attempts < 20) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Check for valid SSE format
      if (buffer.includes('event: ') && buffer.includes('data: ') && buffer.includes('\n\n')) {
        foundValidMessage = true;
        reader.cancel();
        break;
      }

      attempts++;
    }

    expect(foundValidMessage).toBe(true);
  }, 5000);
});
