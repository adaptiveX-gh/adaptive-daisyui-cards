/**
 * Mock SSE Server for Testing Progressive Card Rendering
 *
 * Simulates realistic SSE streaming with configurable:
 * - Chunk boundaries (progress in chunk #1, skeleton in chunk #2+)
 * - Multi-line JSON data
 * - CRLF vs LF line endings
 * - Delayed events
 * - Error scenarios
 *
 * Usage:
 *   node tests/api/mock-sse-server.js
 *
 * Test endpoints:
 *   GET /mock/stream?delay=500&cards=3&mode=chunked
 *   GET /mock/stream?mode=multiline     # Multi-line JSON test
 *   GET /mock/stream?mode=crlf          # CRLF line endings
 *   GET /mock/stream?mode=error         # Simulate error mid-stream
 */

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

/**
 * Mock streaming endpoint with configurable behavior
 */
app.get('/mock/stream', (req, res) => {
  const {
    delay = 500,        // Delay between chunks (ms)
    cards = 3,          // Number of cards to generate
    mode = 'chunked',   // Mode: chunked, multiline, crlf, error, fast
    includeHeartbeat = 'false'
  } = req.query;

  const chunkDelay = parseInt(delay);
  const cardCount = parseInt(cards);
  const useHeartbeat = includeHeartbeat === 'true';

  console.log(`[MOCK] Starting stream: ${cardCount} cards, ${chunkDelay}ms delay, mode=${mode}`);

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  // Flush headers immediately
  res.flushHeaders?.();

  const lineEnding = mode === 'crlf' ? '\r\n' : '\n';
  let messageId = 0;

  const writeEvent = (event, data, id = null) => {
    const idLine = id ? `id: ${id}${lineEnding}` : '';
    const eventLine = event ? `event: ${event}${lineEnding}` : '';
    const dataLine = `data: ${JSON.stringify(data)}${lineEnding}`;
    const message = `${idLine}${eventLine}${dataLine}${lineEnding}`;

    console.log(`[MOCK] Sending: ${event || 'message'} (${data.stage || 'N/A'})`);
    res.write(message);
  };

  const writeMultilineEvent = (event, data, id = null) => {
    const idLine = id ? `id: ${id}${lineEnding}` : '';
    const eventLine = event ? `event: ${event}${lineEnding}` : '';

    // Split JSON into multiple data: lines
    const jsonStr = JSON.stringify(data, null, 2);
    const lines = jsonStr.split('\n');
    const dataLines = lines.map(line => `data: ${line}${lineEnding}`).join('');

    const message = `${idLine}${eventLine}${dataLines}${lineEnding}`;

    console.log(`[MOCK] Sending multi-line: ${event || 'message'} (${lines.length} lines)`);
    res.write(message);
  };

  const writeComment = (text) => {
    res.write(`: ${text}${lineEnding}${lineEnding}`);
  };

  // Generate mock card data
  const generateCards = (count) => {
    const layouts = ['hero', 'split', 'sidebar', 'feature'];
    return Array.from({ length: count }, (_, i) => ({
      id: `mock-card-${i + 1}`,
      layout: layouts[i % layouts.length],
      type: i === 0 ? 'title' : 'content'
    }));
  };

  const mockCards = generateCards(cardCount);
  let currentChunk = 0;

  const streamSequence = async () => {
    try {
      // Heartbeat (optional)
      if (useHeartbeat) {
        writeComment('heartbeat');
      }

      // CHUNK #1: Progress event (skeleton stage starting)
      currentChunk++;
      console.log(`[MOCK] === CHUNK #${currentChunk} ===`);
      writeEvent('progress', {
        stage: 'skeleton',
        progress: 10,
        message: 'Generating card structure',
        timestamp: new Date().toISOString()
      }, ++messageId);

      await sleep(chunkDelay);

      // CHUNK #2: Skeleton event with cards (THE IMPORTANT ONE!)
      currentChunk++;
      console.log(`[MOCK] === CHUNK #${currentChunk} ===`);

      if (mode === 'multiline') {
        writeMultilineEvent('message', {
          stage: 'skeleton',
          clientId: 'mock-client-123',
          cardCount: mockCards.length,
          cards: mockCards,
          timestamp: new Date().toISOString(),
          sequence: ++messageId
        }, messageId);
      } else {
        writeEvent('message', {
          stage: 'skeleton',
          clientId: 'mock-client-123',
          cardCount: mockCards.length,
          cards: mockCards,
          timestamp: new Date().toISOString(),
          sequence: messageId
        }, ++messageId);
      }

      await sleep(chunkDelay);

      // CHUNK #3: Progress for content stage
      currentChunk++;
      console.log(`[MOCK] === CHUNK #${currentChunk} ===`);
      writeEvent('progress', {
        stage: 'content',
        progress: 50,
        message: 'Generating content',
        timestamp: new Date().toISOString()
      }, ++messageId);

      await sleep(chunkDelay / 2);

      // CHUNK #4-N: Content events for each card
      for (const [index, card] of mockCards.entries()) {
        currentChunk++;
        console.log(`[MOCK] === CHUNK #${currentChunk} ===`);

        // Title
        writeEvent('message', {
          stage: 'content',
          cardId: card.id,
          section: 'title',
          content: `Mock Card ${index + 1} Title`,
          timestamp: new Date().toISOString()
        }, ++messageId);

        await sleep(chunkDelay / 4);

        // Body
        writeEvent('message', {
          stage: 'content',
          cardId: card.id,
          section: 'body',
          content: `This is mock content for card ${index + 1}. It demonstrates progressive streaming with realistic delays.`,
          timestamp: new Date().toISOString()
        }, ++messageId);

        await sleep(chunkDelay / 4);
      }

      // Check for error mode
      if (mode === 'error') {
        currentChunk++;
        console.log(`[MOCK] === CHUNK #${currentChunk} (ERROR) ===`);
        writeEvent('error', {
          stage: 'content',
          message: 'Simulated error during content generation',
          errorCode: 'MOCK_ERROR',
          timestamp: new Date().toISOString()
        }, ++messageId);
        res.end();
        return;
      }

      // Progress for style stage
      currentChunk++;
      console.log(`[MOCK] === CHUNK #${currentChunk} ===`);
      writeEvent('progress', {
        stage: 'style',
        progress: 90,
        message: 'Applying styles',
        timestamp: new Date().toISOString()
      }, ++messageId);

      await sleep(chunkDelay / 2);

      // Style events for each card
      for (const card of mockCards) {
        currentChunk++;
        console.log(`[MOCK] === CHUNK #${currentChunk} ===`);

        writeEvent('message', {
          stage: 'style',
          cardId: card.id,
          styles: {
            theme: {
              colors: {
                primary: '#3b82f6',
                secondary: '#8b5cf6',
                accent: '#ec4899'
              }
            },
            layout: card.layout
          },
          timestamp: new Date().toISOString()
        }, ++messageId);

        await sleep(chunkDelay / 4);
      }

      // Final complete event
      currentChunk++;
      console.log(`[MOCK] === CHUNK #${currentChunk} (COMPLETE) ===`);
      writeEvent('complete', {
        clientId: 'mock-client-123',
        cardCount: mockCards.length,
        stages: 3,
        totalTime: chunkDelay * currentChunk,
        completedAt: new Date().toISOString()
      }, ++messageId);

      console.log(`[MOCK] Stream complete: ${currentChunk} chunks, ${messageId} messages`);
      res.end();

    } catch (error) {
      console.error('[MOCK] Error during streaming:', error);
      try {
        writeEvent('error', {
          stage: 'unknown',
          message: error.message,
          timestamp: new Date().toISOString()
        }, ++messageId);
      } catch (e) {
        console.error('[MOCK] Failed to send error event:', e);
      }
      res.end();
    }
  };

  // Start streaming
  streamSequence();

  // Handle client disconnect
  req.on('close', () => {
    console.log('[MOCK] Client disconnected');
  });
});

/**
 * POST endpoint for testing with request body
 */
app.post('/mock/stream', (req, res) => {
  const {
    topic = 'Mock Topic',
    cardCount = 3,
    style = 'professional',
    includeImages = false,
    streamDelay = 500
  } = req.body;

  console.log(`[MOCK] POST stream request:`, { topic, cardCount, style, streamDelay });

  // Redirect to GET with query params
  const query = new URLSearchParams({
    cards: cardCount,
    delay: streamDelay,
    mode: 'chunked'
  });

  res.redirect(307, `/mock/stream?${query}`);
});

/**
 * Simple demo endpoint for quick testing
 */
app.get('/mock/demo', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.flushHeaders?.();

  let count = 0;
  const interval = setInterval(() => {
    res.write(`data: {"count":${++count},"timestamp":"${new Date().toISOString()}"}\n\n`);

    if (count >= 5) {
      clearInterval(interval);
      res.end();
    }
  }, 1000);

  req.on('close', () => {
    clearInterval(interval);
    console.log('[MOCK] Demo client disconnected');
  });
});

/**
 * Health check endpoint
 */
app.get('/mock/health', (req, res) => {
  res.json({
    status: 'ok',
    server: 'mock-sse-server',
    endpoints: [
      'GET /mock/stream?delay=500&cards=3&mode=chunked',
      'GET /mock/stream?mode=multiline',
      'GET /mock/stream?mode=crlf',
      'GET /mock/stream?mode=error',
      'POST /mock/stream',
      'GET /mock/demo',
      'GET /mock/health'
    ]
  });
});

// Utility sleep function
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║  Mock SSE Server Running on http://localhost:${PORT}       ║
╚════════════════════════════════════════════════════════════╝

Test endpoints:
  GET  http://localhost:${PORT}/mock/stream?delay=500&cards=3
  GET  http://localhost:${PORT}/mock/stream?mode=multiline
  GET  http://localhost:${PORT}/mock/stream?mode=crlf
  GET  http://localhost:${PORT}/mock/stream?mode=error
  POST http://localhost:${PORT}/mock/stream
  GET  http://localhost:${PORT}/mock/demo
  GET  http://localhost:${PORT}/mock/health

Query Parameters:
  delay        - Delay between chunks in ms (default: 500)
  cards        - Number of cards to generate (default: 3)
  mode         - chunked, multiline, crlf, error, fast
  includeHeartbeat - true/false (default: false)

Example:
  curl http://localhost:${PORT}/mock/stream?delay=200&cards=2
  `);
});

export default app;
