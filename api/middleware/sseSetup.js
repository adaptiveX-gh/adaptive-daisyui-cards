/**
 * SSE Setup Middleware
 * Phase 3: Streaming Architecture
 *
 * Configures Express response for Server-Sent Events
 */

/**
 * Setup SSE headers and response configuration
 *
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @param {Function} next - Next middleware
 */
export function setupSSE(req, res, next) {
  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');

  // Disable buffering for Nginx/proxies
  res.setHeader('X-Accel-Buffering', 'no');

  // CORS headers for SSE (if CORS is enabled)
  if (req.headers.origin) {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  // Set response status
  res.status(200);

  // CRITICAL: Flush headers immediately to establish SSE connection
  // Without this, the browser doesn't know it's a stream and may close the connection
  if (typeof res.flushHeaders === 'function') {
    res.flushHeaders();
  }

  // Disable default Express timeout
  req.setTimeout(0);
  res.setTimeout(0);

  // Signal that SSE is setup
  res.locals.sseEnabled = true;

  next();
}

/**
 * Validate SSE request
 *
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @param {Function} next - Next middleware
 */
export function validateSSERequest(req, res, next) {
  // Check Accept header
  const accept = req.headers.accept || '';

  if (!accept.includes('text/event-stream') && !accept.includes('*/*')) {
    return res.status(406).json({
      error: 'Not Acceptable',
      message: 'This endpoint requires Accept: text/event-stream header'
    });
  }

  next();
}

/**
 * Rate limiting for SSE connections
 * Simple in-memory implementation
 */
const connectionCounts = new Map();
const CONNECTION_LIMIT = parseInt(process.env.SSE_MAX_CONNECTIONS_PER_IP || '10');
const CLEANUP_INTERVAL = 300000; // 5 minutes

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  const EXPIRY = 600000; // 10 minutes

  for (const [ip, data] of connectionCounts.entries()) {
    if (now - data.lastSeen > EXPIRY) {
      connectionCounts.delete(ip);
    }
  }
}, CLEANUP_INTERVAL);

/**
 * Rate limit SSE connections by IP
 *
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @param {Function} next - Next middleware
 */
export function rateLimitSSE(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;

  const current = connectionCounts.get(ip) || { count: 0, lastSeen: Date.now() };

  if (current.count >= CONNECTION_LIMIT) {
    return res.status(429).json({
      error: 'Too Many Requests',
      message: `Maximum ${CONNECTION_LIMIT} concurrent SSE connections per IP`,
      retryAfter: 60
    });
  }

  // Increment count
  current.count++;
  current.lastSeen = Date.now();
  connectionCounts.set(ip, current);

  // Decrement on connection close
  res.on('close', () => {
    const data = connectionCounts.get(ip);
    if (data) {
      data.count = Math.max(0, data.count - 1);
      data.lastSeen = Date.now();
      connectionCounts.set(ip, data);
    }
  });

  next();
}

/**
 * Combined SSE middleware stack
 */
export const sseMiddleware = [
  validateSSERequest,
  rateLimitSSE,
  setupSSE
];

export default {
  setupSSE,
  validateSSERequest,
  rateLimitSSE,
  sseMiddleware
};
