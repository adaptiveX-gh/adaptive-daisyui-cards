/**
 * StreamingService - Core SSE streaming service for card generation
 * Phase 3: Streaming Architecture
 *
 * Manages SSE connections and emits stage-based messages:
 * 1. skeleton → layout structure
 * 2. content → text content
 * 3. style → styled components
 * 4. placeholder → placeholder images
 * 5. image → final generated images
 */

import { EventEmitter } from 'events';
import { connectionStore } from './ConnectionStore.js';
import {
  formatSkeletonMessage,
  formatContentMessage,
  formatStyleMessage,
  formatPlaceholderMessage,
  formatImageMessage,
  formatCompleteMessage,
  formatErrorMessage,
  formatProgressMessage,
  sendHeartbeat,
  writeSSE
} from '../utils/sseFormatter.js';

export class StreamingService extends EventEmitter {
  constructor(config = {}) {
    super();

    this.config = {
      heartbeatInterval: config.heartbeatInterval ||
                        parseInt(process.env.SSE_HEARTBEAT_INTERVAL || '15000'),
      connectionTimeout: config.connectionTimeout ||
                        parseInt(process.env.SSE_CONNECTION_TIMEOUT || '120000'),
      stageDelay: config.stageDelay ||
                  parseInt(process.env.SSE_STAGE_DELAY || '0'),
      maxConnections: config.maxConnections ||
                     parseInt(process.env.SSE_MAX_CONNECTIONS || '100')
    };

    this.connectionStore = config.connectionStore || connectionStore;

    // Heartbeat intervals
    this.heartbeats = new Map();

    // Sequence counters per client
    this.sequences = new Map();

    // Cleanup interval
    this.cleanupInterval = setInterval(() => {
      this.connectionStore.cleanup(this.config.connectionTimeout);
    }, 60000); // Cleanup every minute

    console.log('StreamingService initialized with config:', this.config);
  }

  /**
   * Add a new SSE client
   *
   * @param {Response} res - Express response object
   * @param {string} clientId - Unique client identifier
   * @param {Object} metadata - Additional metadata
   * @returns {Object} - Connection object
   */
  addClient(res, clientId, metadata = {}) {
    // Check max connections
    if (this.connectionStore.size() >= this.config.maxConnections) {
      throw new Error(`Maximum connections (${this.config.maxConnections}) reached`);
    }

    // Add to connection store
    const connection = this.connectionStore.add(clientId, res, metadata);

    // Initialize sequence counter
    this.sequences.set(clientId, 0);

    // Start heartbeat
    this.startHeartbeat(clientId);

    this.emit('client:connected', { clientId, metadata });

    return connection;
  }

  /**
   * Remove a client connection
   *
   * @param {string} clientId - Client identifier
   * @returns {boolean} - True if removed
   */
  removeClient(clientId) {
    // Stop heartbeat
    this.stopHeartbeat(clientId);

    // Remove sequence counter
    this.sequences.delete(clientId);

    // Remove from connection store
    const removed = this.connectionStore.remove(clientId);

    if (removed) {
      this.emit('client:disconnected', { clientId });
    }

    return removed;
  }

  /**
   * Get next sequence number for client
   *
   * @param {string} clientId - Client identifier
   * @returns {number} - Sequence number
   */
  getNextSequence(clientId) {
    const current = this.sequences.get(clientId) || 0;
    const next = current + 1;
    this.sequences.set(clientId, next);
    return next;
  }

  /**
   * Send message to specific client
   *
   * @param {string} clientId - Client identifier
   * @param {string} message - Formatted SSE message
   * @returns {boolean} - True if sent successfully
   */
  sendToClient(clientId, message) {
    const connection = this.connectionStore.get(clientId);

    if (!connection) {
      console.warn(`StreamingService: Client ${clientId} not found`);
      return false;
    }

    if (!this.connectionStore.isActive(clientId)) {
      console.warn(`StreamingService: Client ${clientId} is inactive`);
      this.removeClient(clientId);
      return false;
    }

    // Update last activity
    this.connectionStore.update(clientId, {
      lastActivity: new Date().toISOString()
    });

    return writeSSE(connection.res, message);
  }

  /**
   * Emit skeleton stage
   *
   * @param {string} clientId - Client identifier
   * @param {Array} cards - Array of card objects
   * @returns {Promise<boolean>}
   */
  async emitSkeleton(clientId, cards) {
    console.log(`StreamingService: Emitting skeleton to ${clientId} (${cards.length} cards)`);

    // Apply stage delay if configured
    if (this.config.stageDelay > 0) {
      await this.delay(this.config.stageDelay);
    }

    const sequence = this.getNextSequence(clientId);
    const message = formatSkeletonMessage(clientId, cards, sequence);

    const success = this.sendToClient(clientId, message);

    if (success) {
      this.emit('stage:skeleton', { clientId, cardCount: cards.length });
    }

    return success;
  }

  /**
   * Emit content stage for a card section
   *
   * @param {string} clientId - Client identifier
   * @param {Object} card - Card object
   * @param {string} section - Section name (title, body, etc.)
   * @param {string} content - Content HTML/text
   * @returns {Promise<boolean>}
   */
  async emitContent(clientId, card, section, content) {
    console.log(`StreamingService: Emitting content to ${clientId} (card: ${card.id}, section: ${section})`);

    if (this.config.stageDelay > 0) {
      await this.delay(this.config.stageDelay);
    }

    const sequence = this.getNextSequence(clientId);
    const message = formatContentMessage(card.id, section, content, sequence);

    const success = this.sendToClient(clientId, message);

    if (success) {
      this.emit('stage:content', { clientId, cardId: card.id, section });
    }

    return success;
  }

  /**
   * Emit all content for a card
   *
   * @param {string} clientId - Client identifier
   * @param {Object} card - Card object
   * @returns {Promise<number>} - Number of sections emitted
   */
  async emitCardContent(clientId, card) {
    const content = card.content || {};
    let emitted = 0;

    // Emit each content section
    for (const [section, value] of Object.entries(content)) {
      if (value !== null && value !== undefined) {
        await this.emitContent(clientId, card, section, value);
        emitted++;
      }
    }

    return emitted;
  }

  /**
   * Emit style stage for a card
   *
   * @param {string} clientId - Client identifier
   * @param {Object} card - Card object
   * @returns {Promise<boolean>}
   */
  async emitStyle(clientId, card) {
    console.log(`StreamingService: Emitting style to ${clientId} (card: ${card.id})`);

    if (this.config.stageDelay > 0) {
      await this.delay(this.config.stageDelay);
    }

    const sequence = this.getNextSequence(clientId);

    const styles = {
      theme: card.theme,
      layout: card.layout,
      type: card.type
    };

    const message = formatStyleMessage(card.id, styles, sequence);

    const success = this.sendToClient(clientId, message);

    if (success) {
      this.emit('stage:style', { clientId, cardId: card.id });
    }

    return success;
  }

  /**
   * Emit placeholder stage for a card
   *
   * @param {string} clientId - Client identifier
   * @param {Object} card - Card object
   * @returns {Promise<boolean>}
   */
  async emitPlaceholder(clientId, card) {
    console.log(`StreamingService: Emitting placeholder to ${clientId} (card: ${card.id})`);

    if (this.config.stageDelay > 0) {
      await this.delay(this.config.stageDelay);
    }

    // Extract placeholder data from card
    const placeholder = card.image?.placeholder || {
      type: 'geometric',
      url: null,
      loadingState: true,
      aspectRatio: '16:9'
    };

    const sequence = this.getNextSequence(clientId);
    const message = formatPlaceholderMessage(card.id, placeholder, sequence);

    const success = this.sendToClient(clientId, message);

    if (success) {
      this.emit('stage:placeholder', { clientId, cardId: card.id });
    }

    return success;
  }

  /**
   * Emit image stage for a card
   *
   * @param {string} clientId - Client identifier
   * @param {Object} card - Card object or cardId
   * @param {Object} imageData - Image data (url, metadata)
   * @returns {Promise<boolean>}
   */
  async emitImage(clientId, card, imageData) {
    const cardId = typeof card === 'string' ? card : card.id;

    console.log(`StreamingService: Emitting image to ${clientId} (card: ${cardId})`);

    if (this.config.stageDelay > 0) {
      await this.delay(this.config.stageDelay);
    }

    const sequence = this.getNextSequence(clientId);
    const message = formatImageMessage(cardId, imageData, sequence);

    const success = this.sendToClient(clientId, message);

    if (success) {
      this.emit('stage:image', { clientId, cardId });
    }

    return success;
  }

  /**
   * Emit progress update
   *
   * @param {string} clientId - Client identifier
   * @param {string} stage - Current stage
   * @param {number} progress - Progress percentage (0-100)
   * @param {string} message - Progress message
   * @returns {boolean}
   */
  emitProgress(clientId, stage, progress, message) {
    const sequence = this.getNextSequence(clientId);
    const progressMessage = formatProgressMessage(stage, progress, message, sequence);

    return this.sendToClient(clientId, progressMessage);
  }

  /**
   * Emit completion message
   *
   * @param {string} clientId - Client identifier
   * @param {Object} summary - Summary data
   * @returns {boolean}
   */
  emitComplete(clientId, summary = {}) {
    console.log(`StreamingService: Emitting completion to ${clientId}`);

    const sequence = this.getNextSequence(clientId);
    const message = formatCompleteMessage(clientId, summary, sequence);

    const success = this.sendToClient(clientId, message);

    if (success) {
      this.emit('stream:complete', { clientId, summary });
    }

    return success;
  }

  /**
   * Emit error message
   *
   * @param {string} clientId - Client identifier
   * @param {string} stage - Stage where error occurred
   * @param {Error|string} error - Error object or message
   * @param {Object} context - Additional context
   * @returns {boolean}
   */
  emitError(clientId, stage, error, context = {}) {
    console.error(`StreamingService: Emitting error to ${clientId} (stage: ${stage})`, error);

    const sequence = this.getNextSequence(clientId);
    const message = formatErrorMessage(stage, error, context, sequence);

    const success = this.sendToClient(clientId, message);

    if (success) {
      this.emit('stream:error', { clientId, stage, error });
    }

    return success;
  }

  /**
   * Start heartbeat for a client
   *
   * @param {string} clientId - Client identifier
   */
  startHeartbeat(clientId) {
    // Clear existing heartbeat if any
    this.stopHeartbeat(clientId);

    const interval = setInterval(() => {
      const connection = this.connectionStore.get(clientId);

      if (!connection || !this.connectionStore.isActive(clientId)) {
        this.stopHeartbeat(clientId);
        this.removeClient(clientId);
        return;
      }

      // Send heartbeat
      const success = sendHeartbeat(connection.res);

      if (!success) {
        this.stopHeartbeat(clientId);
        this.removeClient(clientId);
      }
    }, this.config.heartbeatInterval);

    this.heartbeats.set(clientId, interval);

    console.log(`StreamingService: Heartbeat started for ${clientId} (interval: ${this.config.heartbeatInterval}ms)`);
  }

  /**
   * Stop heartbeat for a client
   *
   * @param {string} clientId - Client identifier
   */
  stopHeartbeat(clientId) {
    const interval = this.heartbeats.get(clientId);

    if (interval) {
      clearInterval(interval);
      this.heartbeats.delete(clientId);
      console.log(`StreamingService: Heartbeat stopped for ${clientId}`);
    }
  }

  /**
   * Broadcast message to all active clients
   *
   * @param {string} message - Formatted SSE message
   * @returns {number} - Number of clients message was sent to
   */
  broadcast(message) {
    const activeConnections = this.connectionStore.getAllActive();
    let sent = 0;

    for (const connection of activeConnections) {
      if (this.sendToClient(connection.id, message)) {
        sent++;
      }
    }

    return sent;
  }

  /**
   * Delay helper for stage delays
   *
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise}
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get service statistics
   *
   * @returns {Object}
   */
  getStats() {
    return {
      config: this.config,
      connections: this.connectionStore.getStats(),
      activeHeartbeats: this.heartbeats.size
    };
  }

  /**
   * Shutdown service and cleanup resources
   */
  shutdown() {
    console.log('StreamingService: Shutting down...');

    // Stop all heartbeats
    for (const clientId of this.heartbeats.keys()) {
      this.stopHeartbeat(clientId);
    }

    // Clear cleanup interval
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    // Clear all connections
    this.connectionStore.clear();

    console.log('StreamingService: Shutdown complete');
  }
}

// Create singleton instance
export const streamingService = new StreamingService();

export default StreamingService;
