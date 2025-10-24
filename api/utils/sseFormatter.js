/**
 * SSE Formatter - Utilities for Server-Sent Events message formatting
 * Phase 3: Streaming Architecture
 *
 * SSE Format: https://html.spec.whatwg.org/multipage/server-sent-events.html
 */

/**
 * Format a message for SSE transmission
 *
 * @param {string} eventType - Event type (message, error, complete, etc.)
 * @param {Object} data - Data payload
 * @param {string|number} id - Optional event ID for client reconnection
 * @returns {string} - Formatted SSE message
 */
export function formatSSEMessage(eventType, data, id = null) {
  let message = '';

  // Add event ID if provided (for reconnection support)
  if (id !== null) {
    message += `id: ${id}\n`;
  }

  // Add event type
  message += `event: ${eventType}\n`;

  // Add data (must be on separate lines if multi-line JSON)
  const jsonData = JSON.stringify(data);
  message += `data: ${jsonData}\n`;

  // Empty line to signal end of message
  message += '\n';

  return message;
}

/**
 * Format a heartbeat/keep-alive message (comment)
 *
 * @returns {string} - Formatted heartbeat
 */
export function formatHeartbeat() {
  return ': heartbeat\n\n';
}

/**
 * Format a stage message
 *
 * @param {string} stage - Stage name (skeleton, content, style, placeholder, image)
 * @param {Object} data - Stage data
 * @param {number} sequence - Sequence number
 * @returns {string} - Formatted message
 */
export function formatStageMessage(stage, data, sequence = null) {
  const payload = {
    stage,
    ...data,
    timestamp: new Date().toISOString()
  };

  if (sequence !== null) {
    payload.sequence = sequence;
  }

  return formatSSEMessage('message', payload, sequence);
}

/**
 * Format a skeleton stage message
 *
 * @param {string} clientId - Client ID
 * @param {Array} cards - Array of card skeletons
 * @param {number} sequence - Sequence number
 * @returns {string} - Formatted message
 */
export function formatSkeletonMessage(clientId, cards, sequence) {
  return formatStageMessage('skeleton', {
    clientId,
    cardCount: cards.length,
    cards: cards.map(card => ({
      id: card.id,
      layout: card.layout,
      type: card.type
    }))
  }, sequence);
}

/**
 * Format a content stage message
 *
 * @param {string} cardId - Card ID
 * @param {string} section - Section name (title, body, etc.)
 * @param {string} content - Content HTML/text
 * @param {number} sequence - Sequence number
 * @returns {string} - Formatted message
 */
export function formatContentMessage(cardId, section, content, sequence) {
  return formatStageMessage('content', {
    cardId,
    section,
    content
  }, sequence);
}

/**
 * Format a style stage message
 *
 * @param {string} cardId - Card ID
 * @param {Object} styles - Style configuration
 * @param {number} sequence - Sequence number
 * @returns {string} - Formatted message
 */
export function formatStyleMessage(cardId, styles, sequence) {
  return formatStageMessage('style', {
    cardId,
    styles
  }, sequence);
}

/**
 * Format a placeholder stage message
 *
 * @param {string} cardId - Card ID
 * @param {Object} placeholder - Placeholder data
 * @param {number} sequence - Sequence number
 * @returns {string} - Formatted message
 */
export function formatPlaceholderMessage(cardId, placeholder, sequence) {
  return formatStageMessage('placeholder', {
    cardId,
    placeholder
  }, sequence);
}

/**
 * Format an image stage message
 *
 * @param {string} cardId - Card ID
 * @param {Object} image - Image data (url, metadata)
 * @param {number} sequence - Sequence number
 * @returns {string} - Formatted message
 */
export function formatImageMessage(cardId, image, sequence) {
  return formatStageMessage('image', {
    cardId,
    image
  }, sequence);
}

/**
 * Format a completion message
 *
 * @param {string} clientId - Client ID
 * @param {Object} summary - Summary data
 * @param {number} sequence - Sequence number
 * @returns {string} - Formatted message
 */
export function formatCompleteMessage(clientId, summary = {}, sequence) {
  return formatSSEMessage('complete', {
    clientId,
    ...summary,
    completedAt: new Date().toISOString()
  }, sequence);
}

/**
 * Format an error message
 *
 * @param {string} stage - Stage where error occurred
 * @param {Error|string} error - Error object or message
 * @param {Object} context - Additional context
 * @param {number} sequence - Sequence number
 * @returns {string} - Formatted message
 */
export function formatErrorMessage(stage, error, context = {}, sequence = null) {
  const errorData = {
    stage: stage || 'unknown',
    error: {
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message || String(error),
      recoverable: error.recoverable !== false,
      retryAfter: error.retryAfter || null
    },
    ...context,
    timestamp: new Date().toISOString()
  };

  return formatSSEMessage('error', errorData, sequence);
}

/**
 * Format a progress update message
 *
 * @param {string} stage - Current stage
 * @param {number} progress - Progress percentage (0-100)
 * @param {string} message - Progress message
 * @param {number} sequence - Sequence number
 * @returns {string} - Formatted message
 */
export function formatProgressMessage(stage, progress, message, sequence) {
  return formatSSEMessage('progress', {
    stage,
    progress,
    message,
    timestamp: new Date().toISOString()
  }, sequence);
}

/**
 * Format a reconnection message with last event ID
 *
 * @param {string} lastEventId - Last received event ID
 * @returns {string} - Formatted message
 */
export function formatReconnectMessage(lastEventId) {
  return formatSSEMessage('reconnect', {
    lastEventId,
    message: 'Reconnection successful',
    timestamp: new Date().toISOString()
  });
}

/**
 * Write SSE message to response
 *
 * @param {Response} res - Express response object
 * @param {string} message - Formatted SSE message
 * @returns {boolean} - True if written successfully
 */
export function writeSSE(res, message) {
  try {
    // Check if response is still writable
    if (res.writableEnded || res.destroyed) {
      return false;
    }

    res.write(message);
    return true;
  } catch (error) {
    console.error('Error writing SSE message:', error);
    return false;
  }
}

/**
 * Send a complete SSE message (format + write)
 *
 * @param {Response} res - Express response object
 * @param {string} eventType - Event type
 * @param {Object} data - Data payload
 * @param {string|number} id - Optional event ID
 * @returns {boolean} - True if sent successfully
 */
export function sendSSE(res, eventType, data, id = null) {
  const message = formatSSEMessage(eventType, data, id);
  return writeSSE(res, message);
}

/**
 * Send a heartbeat to keep connection alive
 *
 * @param {Response} res - Express response object
 * @returns {boolean} - True if sent successfully
 */
export function sendHeartbeat(res) {
  const heartbeat = formatHeartbeat();
  return writeSSE(res, heartbeat);
}

/**
 * Validate SSE message format
 *
 * @param {string} message - SSE message
 * @returns {boolean} - True if valid
 */
export function isValidSSEMessage(message) {
  // Must end with double newline
  if (!message.endsWith('\n\n')) {
    return false;
  }

  // Must contain data: line
  if (!message.includes('data: ')) {
    return false;
  }

  return true;
}

export default {
  formatSSEMessage,
  formatHeartbeat,
  formatStageMessage,
  formatSkeletonMessage,
  formatContentMessage,
  formatStyleMessage,
  formatPlaceholderMessage,
  formatImageMessage,
  formatCompleteMessage,
  formatErrorMessage,
  formatProgressMessage,
  formatReconnectMessage,
  writeSSE,
  sendSSE,
  sendHeartbeat,
  isValidSSEMessage
};
