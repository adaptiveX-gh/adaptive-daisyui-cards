/**
 * ConnectionStore - Manages SSE client connections
 * Phase 3: Streaming Architecture
 */

export class ConnectionStore {
  constructor() {
    // Map of clientId -> connection object
    this.connections = new Map();

    // Map of cardId -> clientId (for finding clients by card)
    this.cardToClient = new Map();

    // Statistics
    this.stats = {
      totalConnections: 0,
      activeConnections: 0,
      disconnectedConnections: 0,
      averageDuration: 0
    };
  }

  /**
   * Add a new client connection
   *
   * @param {string} clientId - Unique client identifier
   * @param {Response} res - Express response object
   * @param {Object} metadata - Additional metadata about the connection
   * @returns {Object} - Connection object
   */
  add(clientId, res, metadata = {}) {
    const connection = {
      id: clientId,
      res,
      metadata: {
        ...metadata,
        connectedAt: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      },
      cards: metadata.cards || [],
      active: true
    };

    this.connections.set(clientId, connection);

    // Map each card to this client
    if (connection.cards && connection.cards.length > 0) {
      connection.cards.forEach(cardId => {
        this.cardToClient.set(cardId, clientId);
      });
    }

    // Update stats
    this.stats.totalConnections++;
    this.stats.activeConnections++;

    console.log(`ConnectionStore: Client ${clientId} connected (total: ${this.stats.activeConnections})`);

    return connection;
  }

  /**
   * Remove a client connection
   *
   * @param {string} clientId - Client identifier
   * @returns {boolean} - True if removed, false if not found
   */
  remove(clientId) {
    const connection = this.connections.get(clientId);

    if (!connection) {
      return false;
    }

    // Remove card mappings
    if (connection.cards && connection.cards.length > 0) {
      connection.cards.forEach(cardId => {
        this.cardToClient.delete(cardId);
      });
    }

    // Calculate duration
    const connectedAt = new Date(connection.metadata.connectedAt);
    const duration = Date.now() - connectedAt.getTime();

    // Update average duration
    const totalDuration = this.stats.averageDuration * this.stats.disconnectedConnections;
    this.stats.disconnectedConnections++;
    this.stats.averageDuration = (totalDuration + duration) / this.stats.disconnectedConnections;

    // Remove connection
    this.connections.delete(clientId);
    this.stats.activeConnections--;

    console.log(`ConnectionStore: Client ${clientId} disconnected (duration: ${Math.round(duration / 1000)}s, active: ${this.stats.activeConnections})`);

    return true;
  }

  /**
   * Get a connection by client ID
   *
   * @param {string} clientId - Client identifier
   * @returns {Object|null} - Connection object or null
   */
  get(clientId) {
    return this.connections.get(clientId) || null;
  }

  /**
   * Find client by card ID
   *
   * @param {string} cardId - Card identifier
   * @returns {Object|null} - Connection object or null
   */
  findByCardId(cardId) {
    const clientId = this.cardToClient.get(cardId);

    if (!clientId) {
      return null;
    }

    return this.get(clientId);
  }

  /**
   * Update connection metadata
   *
   * @param {string} clientId - Client identifier
   * @param {Object} updates - Metadata updates
   * @returns {boolean} - True if updated, false if not found
   */
  update(clientId, updates) {
    const connection = this.connections.get(clientId);

    if (!connection) {
      return false;
    }

    connection.metadata = {
      ...connection.metadata,
      ...updates,
      lastActivity: new Date().toISOString()
    };

    return true;
  }

  /**
   * Check if a connection is active and response is writable
   *
   * @param {string} clientId - Client identifier
   * @returns {boolean}
   */
  isActive(clientId) {
    const connection = this.connections.get(clientId);

    if (!connection) {
      return false;
    }

    // Check if response is still writable
    if (!connection.res || connection.res.writableEnded || connection.res.destroyed) {
      connection.active = false;
      return false;
    }

    return connection.active;
  }

  /**
   * Mark a connection as inactive
   *
   * @param {string} clientId - Client identifier
   * @returns {boolean}
   */
  markInactive(clientId) {
    const connection = this.connections.get(clientId);

    if (!connection) {
      return false;
    }

    connection.active = false;
    return true;
  }

  /**
   * Get all active connections
   *
   * @returns {Array<Object>}
   */
  getAllActive() {
    return Array.from(this.connections.values()).filter(conn => conn.active);
  }

  /**
   * Cleanup stale connections
   *
   * @param {number} maxAge - Maximum age in milliseconds
   * @returns {number} - Number of connections cleaned up
   */
  cleanup(maxAge = 300000) { // Default: 5 minutes
    const now = Date.now();
    let cleanedUp = 0;

    for (const [clientId, connection] of this.connections.entries()) {
      const lastActivity = new Date(connection.metadata.lastActivity).getTime();
      const age = now - lastActivity;

      if (age > maxAge || !this.isActive(clientId)) {
        this.remove(clientId);
        cleanedUp++;
      }
    }

    if (cleanedUp > 0) {
      console.log(`ConnectionStore: Cleaned up ${cleanedUp} stale connections`);
    }

    return cleanedUp;
  }

  /**
   * Get connection statistics
   *
   * @returns {Object}
   */
  getStats() {
    return {
      ...this.stats,
      activeConnections: this.connections.size,
      averageDurationSeconds: Math.round(this.stats.averageDuration / 1000)
    };
  }

  /**
   * Get connection count
   *
   * @returns {number}
   */
  size() {
    return this.connections.size;
  }

  /**
   * Clear all connections
   */
  clear() {
    this.connections.clear();
    this.cardToClient.clear();
    console.log('ConnectionStore: All connections cleared');
  }
}

// Create singleton instance
export const connectionStore = new ConnectionStore();

export default ConnectionStore;
