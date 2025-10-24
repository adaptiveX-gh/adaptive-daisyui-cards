/**
 * StreamingService Unit Tests
 * Phase 3: Streaming Architecture
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StreamingService } from '../../api/services/StreamingService.js';
import { ConnectionStore } from '../../api/services/ConnectionStore.js';

describe('StreamingService', () => {
  let streamingService;
  let mockResponse;
  let connectionStore;

  beforeEach(() => {
    // Create mock response object
    mockResponse = {
      write: vi.fn(() => true),
      writableEnded: false,
      destroyed: false,
      on: vi.fn()
    };

    // Create fresh connection store
    connectionStore = new ConnectionStore();

    // Create streaming service with test config
    streamingService = new StreamingService({
      heartbeatInterval: 100,
      connectionTimeout: 1000,
      stageDelay: 0,
      maxConnections: 10,
      connectionStore
    });
  });

  afterEach(() => {
    streamingService.shutdown();
  });

  describe('Client Connection Management', () => {
    it('should add client successfully', () => {
      const clientId = 'test-client-1';

      const connection = streamingService.addClient(mockResponse, clientId, {
        topic: 'Test Topic'
      });

      expect(connection).toBeDefined();
      expect(connection.id).toBe(clientId);
      expect(connectionStore.get(clientId)).toBeDefined();
    });

    it('should reject connection when max connections reached', () => {
      // Fill up to max connections
      for (let i = 0; i < 10; i++) {
        streamingService.addClient(mockResponse, `client-${i}`);
      }

      // Try to add one more
      expect(() => {
        streamingService.addClient(mockResponse, 'client-11');
      }).toThrow('Maximum connections');
    });

    it('should remove client successfully', () => {
      const clientId = 'test-client-1';
      streamingService.addClient(mockResponse, clientId);

      const removed = streamingService.removeClient(clientId);

      expect(removed).toBe(true);
      expect(connectionStore.get(clientId)).toBeNull();
    });

    it('should initialize sequence counter for new client', () => {
      const clientId = 'test-client-1';
      streamingService.addClient(mockResponse, clientId);

      const sequence = streamingService.getNextSequence(clientId);

      expect(sequence).toBe(1);
    });

    it('should increment sequence counter', () => {
      const clientId = 'test-client-1';
      streamingService.addClient(mockResponse, clientId);

      const seq1 = streamingService.getNextSequence(clientId);
      const seq2 = streamingService.getNextSequence(clientId);
      const seq3 = streamingService.getNextSequence(clientId);

      expect(seq1).toBe(1);
      expect(seq2).toBe(2);
      expect(seq3).toBe(3);
    });
  });

  describe('Message Sending', () => {
    it('should send message to active client', () => {
      const clientId = 'test-client-1';
      streamingService.addClient(mockResponse, clientId);

      const success = streamingService.sendToClient(clientId, 'test message\n\n');

      expect(success).toBe(true);
      expect(mockResponse.write).toHaveBeenCalledWith('test message\n\n');
    });

    it('should fail to send to non-existent client', () => {
      const success = streamingService.sendToClient('non-existent', 'message');

      expect(success).toBe(false);
    });

    it('should fail to send to inactive client', () => {
      const clientId = 'test-client-1';
      streamingService.addClient(mockResponse, clientId);

      // Mark response as ended
      mockResponse.writableEnded = true;

      const success = streamingService.sendToClient(clientId, 'message');

      expect(success).toBe(false);
    });
  });

  describe('Stage Emission', () => {
    let clientId;
    let mockCards;

    beforeEach(() => {
      clientId = 'test-client-1';
      streamingService.addClient(mockResponse, clientId);

      mockCards = [
        {
          id: 'card-1',
          layout: 'split',
          type: 'title',
          content: {
            title: 'Test Title',
            body: 'Test Body'
          },
          theme: { name: 'professional' }
        }
      ];
    });

    it('should emit skeleton stage', async () => {
      const success = await streamingService.emitSkeleton(clientId, mockCards);

      expect(success).toBe(true);
      expect(mockResponse.write).toHaveBeenCalled();

      const writtenData = mockResponse.write.mock.calls[0][0];
      expect(writtenData).toContain('event: message');
      expect(writtenData).toContain('skeleton');
      expect(writtenData).toContain('card-1');
    });

    it('should emit content stage', async () => {
      const card = mockCards[0];
      const success = await streamingService.emitContent(
        clientId,
        card,
        'title',
        'Test Title'
      );

      expect(success).toBe(true);
      expect(mockResponse.write).toHaveBeenCalled();

      const writtenData = mockResponse.write.mock.calls[0][0];
      expect(writtenData).toContain('content');
      expect(writtenData).toContain('card-1');
      expect(writtenData).toContain('title');
    });

    it('should emit all card content sections', async () => {
      const card = mockCards[0];
      const emitted = await streamingService.emitCardContent(clientId, card);

      expect(emitted).toBe(2); // title and body
      expect(mockResponse.write).toHaveBeenCalledTimes(2);
    });

    it('should emit style stage', async () => {
      const card = mockCards[0];
      const success = await streamingService.emitStyle(clientId, card);

      expect(success).toBe(true);

      const writtenData = mockResponse.write.mock.calls[0][0];
      expect(writtenData).toContain('style');
      expect(writtenData).toContain('card-1');
    });

    it('should emit placeholder stage', async () => {
      const card = {
        ...mockCards[0],
        image: {
          placeholder: {
            type: 'geometric',
            loadingState: true
          }
        }
      };

      const success = await streamingService.emitPlaceholder(clientId, card);

      expect(success).toBe(true);

      const writtenData = mockResponse.write.mock.calls[0][0];
      expect(writtenData).toContain('placeholder');
      expect(writtenData).toContain('geometric');
    });

    it('should emit image stage', async () => {
      const imageData = {
        url: 'https://example.com/image.jpg',
        provider: 'gemini'
      };

      const success = await streamingService.emitImage(
        clientId,
        mockCards[0],
        imageData
      );

      expect(success).toBe(true);

      const writtenData = mockResponse.write.mock.calls[0][0];
      expect(writtenData).toContain('image');
      expect(writtenData).toContain('example.com');
    });

    it('should emit complete message', () => {
      const success = streamingService.emitComplete(clientId, {
        cardCount: 3
      });

      expect(success).toBe(true);

      const writtenData = mockResponse.write.mock.calls[0][0];
      expect(writtenData).toContain('event: complete');
      expect(writtenData).toContain('cardCount');
    });

    it('should emit error message', () => {
      const error = new Error('Test error');
      error.code = 'TEST_ERROR';

      const success = streamingService.emitError(clientId, 'content', error);

      expect(success).toBe(true);

      const writtenData = mockResponse.write.mock.calls[0][0];
      expect(writtenData).toContain('event: error');
      expect(writtenData).toContain('TEST_ERROR');
    });

    it('should emit progress message', () => {
      const success = streamingService.emitProgress(
        clientId,
        'content',
        50,
        'Processing content'
      );

      expect(success).toBe(true);

      const writtenData = mockResponse.write.mock.calls[0][0];
      expect(writtenData).toContain('event: progress');
      expect(writtenData).toContain('50');
    });
  });

  describe('Heartbeat Management', () => {
    it('should start heartbeat for client', () => {
      const clientId = 'test-client-1';
      streamingService.addClient(mockResponse, clientId);

      expect(streamingService.heartbeats.has(clientId)).toBe(true);
    });

    it('should stop heartbeat for client', () => {
      const clientId = 'test-client-1';
      streamingService.addClient(mockResponse, clientId);

      streamingService.stopHeartbeat(clientId);

      expect(streamingService.heartbeats.has(clientId)).toBe(false);
    });

    it('should send heartbeat messages', async () => {
      const clientId = 'test-client-1';
      streamingService.addClient(mockResponse, clientId);

      // Wait for heartbeat interval
      await new Promise(resolve => setTimeout(resolve, 150));

      // Should have sent at least one heartbeat
      expect(mockResponse.write).toHaveBeenCalled();

      const calls = mockResponse.write.mock.calls;
      const hasHeartbeat = calls.some(call =>
        call[0].includes(': heartbeat')
      );

      expect(hasHeartbeat).toBe(true);
    });

    it('should cleanup heartbeat on disconnect', async () => {
      const clientId = 'test-client-1';
      streamingService.addClient(mockResponse, clientId);

      // Mark as inactive
      mockResponse.writableEnded = true;

      // Wait for heartbeat to detect disconnect
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(streamingService.heartbeats.has(clientId)).toBe(false);
    });
  });

  describe('Broadcasting', () => {
    it('should broadcast to all active clients', () => {
      const mockRes1 = { ...mockResponse, write: vi.fn(() => true) };
      const mockRes2 = { ...mockResponse, write: vi.fn(() => true) };
      const mockRes3 = { ...mockResponse, write: vi.fn(() => true) };

      streamingService.addClient(mockRes1, 'client-1');
      streamingService.addClient(mockRes2, 'client-2');
      streamingService.addClient(mockRes3, 'client-3');

      const sent = streamingService.broadcast('test broadcast\n\n');

      expect(sent).toBe(3);
      expect(mockRes1.write).toHaveBeenCalled();
      expect(mockRes2.write).toHaveBeenCalled();
      expect(mockRes3.write).toHaveBeenCalled();
    });
  });

  describe('Event Emission', () => {
    it('should emit client:connected event', (done) => {
      streamingService.on('client:connected', ({ clientId }) => {
        expect(clientId).toBe('test-client-1');
        done();
      });

      streamingService.addClient(mockResponse, 'test-client-1');
    });

    it('should emit client:disconnected event', (done) => {
      streamingService.on('client:disconnected', ({ clientId }) => {
        expect(clientId).toBe('test-client-1');
        done();
      });

      streamingService.addClient(mockResponse, 'test-client-1');
      streamingService.removeClient('test-client-1');
    });

    it('should emit stage events', async (done) => {
      const clientId = 'test-client-1';
      streamingService.addClient(mockResponse, clientId);

      const events = [];

      streamingService.on('stage:skeleton', (e) => events.push(e));
      streamingService.on('stage:content', (e) => events.push(e));
      streamingService.on('stage:style', (e) => events.push(e));

      const card = {
        id: 'card-1',
        layout: 'split',
        content: { title: 'Test' },
        theme: {}
      };

      await streamingService.emitSkeleton(clientId, [card]);
      await streamingService.emitContent(clientId, card, 'title', 'Test');
      await streamingService.emitStyle(clientId, card);

      expect(events.length).toBe(3);
      done();
    });
  });

  describe('Statistics', () => {
    it('should return service statistics', () => {
      streamingService.addClient(mockResponse, 'client-1');

      const stats = streamingService.getStats();

      expect(stats).toHaveProperty('config');
      expect(stats).toHaveProperty('connections');
      expect(stats).toHaveProperty('activeHeartbeats');
      expect(stats.connections.activeConnections).toBe(1);
      expect(stats.activeHeartbeats).toBe(1);
    });
  });

  describe('Shutdown', () => {
    it('should cleanup all resources on shutdown', () => {
      streamingService.addClient(mockResponse, 'client-1');
      streamingService.addClient(mockResponse, 'client-2');

      streamingService.shutdown();

      expect(streamingService.heartbeats.size).toBe(0);
      expect(connectionStore.size()).toBe(0);
    });
  });

  describe('Stage Delay', () => {
    it('should apply stage delay when configured', async () => {
      const delayService = new StreamingService({
        stageDelay: 100,
        connectionStore: new ConnectionStore()
      });

      const clientId = 'test-client-1';
      delayService.addClient(mockResponse, clientId);

      const startTime = Date.now();
      await delayService.emitSkeleton(clientId, [{ id: 'card-1' }]);
      const duration = Date.now() - startTime;

      expect(duration).toBeGreaterThanOrEqual(100);

      delayService.shutdown();
    });
  });
});
