/**
 * ImageStatusStore - In-memory storage for image generation status
 * Tracks the status of async image generation requests
 */

export class ImageStatusStore {
  constructor(config = {}) {
    this.statuses = new Map();
    this.maxAge = config.maxAge || 1000 * 60 * 30; // 30 minutes default
    this.cleanupInterval = config.cleanupInterval || 1000 * 60 * 5; // 5 minutes

    // Start automatic cleanup
    this.startCleanup();
  }

  /**
   * Set status for a card
   *
   * @param {string} cardId - Card ID
   * @param {Object} status - Status object
   */
  set(cardId, status) {
    this.statuses.set(cardId, {
      ...status,
      updatedAt: new Date().toISOString()
    });
  }

  /**
   * Get status for a card
   *
   * @param {string} cardId - Card ID
   * @returns {Object|null} - Status object or null if not found
   */
  get(cardId) {
    return this.statuses.get(cardId) || null;
  }

  /**
   * Update status for a card
   *
   * @param {string} cardId - Card ID
   * @param {Object} updates - Partial updates to merge
   */
  update(cardId, updates) {
    const current = this.get(cardId);
    if (!current) {
      throw new Error(`No status found for card: ${cardId}`);
    }

    this.set(cardId, {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString()
    });
  }

  /**
   * Delete status for a card
   *
   * @param {string} cardId - Card ID
   * @returns {boolean} - True if deleted, false if not found
   */
  delete(cardId) {
    return this.statuses.delete(cardId);
  }

  /**
   * Check if status exists for a card
   *
   * @param {string} cardId - Card ID
   * @returns {boolean}
   */
  has(cardId) {
    return this.statuses.has(cardId);
  }

  /**
   * Get all statuses (for debugging)
   *
   * @returns {Array} - Array of all status objects with cardIds
   */
  getAll() {
    const all = [];
    for (const [cardId, status] of this.statuses.entries()) {
      all.push({ cardId, ...status });
    }
    return all;
  }

  /**
   * Get count of statuses
   *
   * @returns {number}
   */
  count() {
    return this.statuses.size;
  }

  /**
   * Clean up old entries
   *
   * @param {number} maxAge - Max age in milliseconds (optional)
   * @returns {number} - Number of entries removed
   */
  cleanup(maxAge = this.maxAge) {
    const now = Date.now();
    let removed = 0;

    for (const [cardId, status] of this.statuses.entries()) {
      const updatedAt = new Date(status.updatedAt).getTime();
      const age = now - updatedAt;

      if (age > maxAge) {
        this.statuses.delete(cardId);
        removed++;
      }
    }

    return removed;
  }

  /**
   * Start automatic cleanup interval
   */
  startCleanup() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.cleanupTimer = setInterval(() => {
      const removed = this.cleanup();
      if (removed > 0) {
        console.log(`ImageStatusStore: Cleaned up ${removed} old entries`);
      }
    }, this.cleanupInterval);

    // Don't keep the process alive
    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref();
    }
  }

  /**
   * Stop automatic cleanup
   */
  stopCleanup() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * Clear all statuses
   */
  clear() {
    this.statuses.clear();
  }

  /**
   * Get statistics about the store
   *
   * @returns {Object}
   */
  getStats() {
    const statuses = this.getAll();
    const byStatus = {};
    const byProvider = {};

    for (const status of statuses) {
      // Count by status
      const statusKey = status.status || 'unknown';
      byStatus[statusKey] = (byStatus[statusKey] || 0) + 1;

      // Count by provider
      const providerKey = status.provider || 'unknown';
      byProvider[providerKey] = (byProvider[providerKey] || 0) + 1;
    }

    return {
      total: statuses.length,
      byStatus,
      byProvider,
      oldestEntry: this.getOldestEntry(),
      newestEntry: this.getNewestEntry()
    };
  }

  /**
   * Get oldest entry timestamp
   */
  getOldestEntry() {
    let oldest = null;
    for (const status of this.statuses.values()) {
      const updatedAt = new Date(status.updatedAt);
      if (!oldest || updatedAt < oldest) {
        oldest = updatedAt;
      }
    }
    return oldest?.toISOString() || null;
  }

  /**
   * Get newest entry timestamp
   */
  getNewestEntry() {
    let newest = null;
    for (const status of this.statuses.values()) {
      const updatedAt = new Date(status.updatedAt);
      if (!newest || updatedAt > newest) {
        newest = updatedAt;
      }
    }
    return newest?.toISOString() || null;
  }
}

// Create singleton instance
export const imageStatusStore = new ImageStatusStore();

export default ImageStatusStore;
