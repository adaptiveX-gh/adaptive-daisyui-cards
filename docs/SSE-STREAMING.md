# SSE Streaming Architecture

**Phase 3: Progressive Card Assembly**

Last updated: 2025-10-23
Version: 0.3.0

## Overview

The Adaptive Cards Platform uses Server-Sent Events (SSE) to provide progressive, real-time card generation. Instead of waiting for the entire presentation to be ready, clients receive updates as each stage completes, creating a smooth, responsive user experience.

## Key Benefits

- **Instant Visual Feedback** - Users see skeleton structure in <100ms
- **Progressive Enhancement** - Content appears in stages (skeleton → content → style → images)
- **Non-Blocking** - Long-running image generation doesn't block content display
- **Resilient** - Clients can handle out-of-order messages and missing stages
- **Real-Time Updates** - Image generation progress streamed as it happens

## Architecture

### Components

```
┌─────────────────┐
│     Client      │
│  (Browser/App)  │
└────────┬────────┘
         │ SSE Connection
         │
┌────────▼────────┐
│  StreamingService│
│  (Event Emitter) │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼──────────────┐
│Connection│ ImageGeneration│
│  Store  │ Service (Events)│
└─────────┘ └────────────────┘
```

### Stage Pipeline

The streaming pipeline consists of 5 ordered stages:

1. **Skeleton** (50ms) - Layout structure and card containers
2. **Content** (100-200ms) - Text content for each section
3. **Style** (50ms) - Theme colors and responsive classes
4. **Placeholder** (50ms) - Geometric/pattern placeholders for images
5. **Image** (0-30s) - Final generated images (async, when ready)

**Total Time to Interactive**: 250-350ms (without images)

## API Endpoints

### POST /api/presentations/stream

Stream a complete presentation generation.

**Request:**
```json
{
  "topic": "AI in Product Discovery",
  "cardCount": 6,
  "style": "professional",
  "theme": {
    "name": "corporate"
  },
  "includeImages": true,
  "provider": "gemini",
  "streamDelay": 0
}
```

**Response Headers:**
```
Content-Type: text/event-stream
Cache-Control: no-cache, no-transform
Connection: keep-alive
X-Accel-Buffering: no
```

**Response Stream:**
```
event: message
data: {"stage":"skeleton","clientId":"...","cardCount":6,"cards":[...]}

event: message
data: {"stage":"content","cardId":"card-1","section":"title","content":"AI in Product Discovery"}

event: message
data: {"stage":"style","cardId":"card-1","styles":{...}}

event: message
data: {"stage":"placeholder","cardId":"card-1","placeholder":{...}}

event: message
data: {"stage":"image","cardId":"card-1","image":{"url":"https://..."}}

event: complete
data: {"clientId":"...","cardCount":6,"completedAt":"2025-10-23T..."}
```

### POST /api/cards/stream

Stream a single card generation.

**Request:**
```json
{
  "topic": "Introduction to AI",
  "layoutType": "split",
  "style": "professional",
  "includeImages": true
}
```

### GET /api/stream/demo

Demo endpoint with configurable delays for testing.

**Query Parameters:**
- `delay` - Stage delay in milliseconds (default: 500)

**Example:**
```bash
curl -N "http://localhost:3000/api/stream/demo?delay=1000"
```

## SSE Message Format

All messages follow the SSE specification:

```
event: <event-type>
data: <json-payload>
id: <sequence-number>

```

### Event Types

- `message` - Standard stage updates
- `progress` - Progress percentage updates
- `error` - Error notifications
- `complete` - Stream completion

### Message Structure

**Skeleton Stage:**
```json
{
  "stage": "skeleton",
  "clientId": "client_1729685432_a3f9e2",
  "cardCount": 6,
  "cards": [
    {
      "id": "card_1729685432_001",
      "layout": "hero",
      "type": "title"
    }
  ],
  "sequence": 1,
  "timestamp": "2025-10-23T10:30:32.123Z"
}
```

**Content Stage:**
```json
{
  "stage": "content",
  "cardId": "card_1729685432_001",
  "section": "title",
  "content": "AI in Product Discovery",
  "sequence": 2,
  "timestamp": "2025-10-23T10:30:32.234Z"
}
```

**Style Stage:**
```json
{
  "stage": "style",
  "cardId": "card_1729685432_001",
  "styles": {
    "theme": {
      "name": "professional",
      "primary": "#667eea"
    },
    "layout": "hero",
    "type": "title"
  },
  "sequence": 8,
  "timestamp": "2025-10-23T10:30:32.456Z"
}
```

**Placeholder Stage:**
```json
{
  "stage": "placeholder",
  "cardId": "card_1729685432_001",
  "placeholder": {
    "type": "geometric",
    "url": "data:image/svg+xml;base64,...",
    "loadingState": true,
    "aspectRatio": "16:9"
  },
  "sequence": 9,
  "timestamp": "2025-10-23T10:30:32.567Z"
}
```

**Image Stage:**
```json
{
  "stage": "image",
  "cardId": "card_1729685432_001",
  "image": {
    "url": "https://storage.googleapis.com/...",
    "provider": "gemini",
    "metadata": {
      "width": 1024,
      "height": 576,
      "format": "jpeg"
    }
  },
  "sequence": 15,
  "timestamp": "2025-10-23T10:30:45.789Z"
}
```

**Progress Event:**
```json
{
  "stage": "content",
  "progress": 50,
  "message": "Generating content",
  "timestamp": "2025-10-23T10:30:32.345Z"
}
```

**Error Event:**
```json
{
  "stage": "image",
  "error": {
    "code": "IMAGE_GENERATION_FAILED",
    "message": "Failed to generate image",
    "recoverable": true,
    "retryAfter": 5000
  },
  "cardId": "card_1729685432_001",
  "timestamp": "2025-10-23T10:30:50.123Z"
}
```

**Complete Event:**
```json
{
  "clientId": "client_1729685432_a3f9e2",
  "cardCount": 6,
  "stages": 5,
  "completedAt": "2025-10-23T10:30:50.456Z"
}
```

## Connection Management

### Heartbeat / Keep-Alive

The server sends heartbeat comments every 15 seconds (configurable):

```
: heartbeat

```

This prevents connection timeouts and allows detection of disconnected clients.

### Connection Lifecycle

1. **Client Connects** - POST request with presentation config
2. **Server Sets Headers** - SSE headers configured
3. **Client Added** - Added to ConnectionStore with unique ID
4. **Heartbeat Started** - Periodic heartbeat messages begin
5. **Stages Streamed** - Progressive stages emitted
6. **Images Generated** - Async image updates (if requested)
7. **Completion Sent** - Final complete event
8. **Client Disconnects** - Cleanup triggered
9. **Resources Released** - Heartbeat stopped, connection removed

### Cleanup

- **On Disconnect**: Heartbeat stopped, connection removed from store
- **Periodic Cleanup**: Stale connections (>5 min inactive) removed every minute
- **On Error**: Connection marked inactive, resources cleaned up

## Resilience & Error Handling

### Client Resilience Requirements

Clients MUST handle:

- **Out-of-order messages** - Buffer and sort by sequence number
- **Missing stages** - Use defaults if stage never arrives
- **Duplicate messages** - Idempotent processing using cardId + section
- **Connection drops** - Reconnection logic with state preservation

### Server Error Handling

The server handles errors gracefully:

- **Generation Failure** - Error event sent, placeholders retained
- **Client Disconnect** - Resources cleaned up immediately
- **Invalid Input** - 400 error before streaming starts
- **Rate Limiting** - 429 error if connection limit reached
- **Provider Timeout** - Fallback to placeholder, error event sent

### Error Recovery

```javascript
// Client-side error recovery example
eventSource.onerror = (error) => {
  console.error('Stream error:', error);

  // Wait and reconnect
  setTimeout(() => {
    reconnect();
  }, 5000);
};
```

## Performance Characteristics

### Latency Targets

- **Time to First Byte**: <100ms
- **Skeleton Stage**: <50ms after request
- **Content Complete**: <200ms
- **Full Presentation (no images)**: <350ms
- **Image Generation**: 0-30s (async, non-blocking)

### Throughput

- **Max Concurrent Connections**: 100 (configurable)
- **Max Connections per IP**: 10 (configurable)
- **Heartbeat Interval**: 15 seconds (configurable)
- **Connection Timeout**: 2 minutes (configurable)

### Resource Usage

- **Memory**: ~50KB per active connection
- **CPU**: Minimal (event-driven)
- **Network**: ~10KB per card (without images)

## Configuration

Environment variables (see `.env.example`):

```bash
# Maximum concurrent SSE connections
SSE_MAX_CONNECTIONS=100

# Maximum connections per IP
SSE_MAX_CONNECTIONS_PER_IP=10

# Heartbeat interval (milliseconds)
SSE_HEARTBEAT_INTERVAL=15000

# Connection timeout (milliseconds)
SSE_CONNECTION_TIMEOUT=120000

# Stage delay for demo/testing (milliseconds)
SSE_STAGE_DELAY=0

# Enable compression (experimental)
ENABLE_SSE_COMPRESSION=false
```

## Security Considerations

### Rate Limiting

- **Connection-based**: Max 100 concurrent connections server-wide
- **IP-based**: Max 10 concurrent connections per IP
- **Automatic cleanup**: Stale connections removed after 5 minutes

### Input Validation

- **Topic**: Required, max 200 characters
- **Card Count**: 1-20 cards
- **Layout Type**: Must be valid layout
- **Provider**: Must be registered provider

### Headers

- **CORS**: Configurable via Express cors middleware
- **X-Accel-Buffering**: Disabled for proxy compatibility
- **Cache-Control**: no-cache to prevent caching

## Monitoring & Observability

### Metrics to Track

- Active connection count
- Average stream duration
- Stage completion times
- Disconnect reasons
- Error rates per stage
- Peak concurrent connections

### Logging

The service logs:

- Stream started/completed
- Each stage emission
- Client disconnects
- Errors with context

**Example Log Output:**
```
ConnectionStore: Client client_123 connected (total: 5)
StreamingService: Emitting skeleton to client_123 (6 cards)
StreamingService: Emitting content to client_123 (card: card-1, section: title)
ImageGenerationService: image:complete event - card-1
StreamingService: Emitting image to client_123 (card: card-1)
StreamingService: Emitting completion to client_123
ConnectionStore: Client client_123 disconnected (duration: 45s, active: 4)
```

## Testing

### Unit Tests

Run unit tests:
```bash
npm test tests/api/StreamingService.test.js
```

Coverage includes:
- Connection management
- Message sending
- Stage emission
- Heartbeat functionality
- Error handling
- Sequence numbers

### Integration Tests

Run E2E tests:
```bash
npm test tests/api/streaming-e2e.test.js
```

Coverage includes:
- Full presentation streaming
- Single card streaming
- Demo endpoint
- Error scenarios
- Message format validation

### Manual Testing

Use the test client:
```bash
# Start server
npm run dev

# Open browser to:
http://localhost:3000/tests/api/streaming-client.html
```

Test scenarios:
- Various card counts (1-20)
- With/without images
- Different stage delays
- Network throttling
- Connection interruption

## Best Practices

### Client Implementation

1. **Use Native EventSource** for browsers
2. **Buffer messages** by sequence number
3. **Implement reconnection** with exponential backoff
4. **Handle partial state** gracefully
5. **Show placeholders** immediately
6. **Swap images** smoothly when ready

### Server Configuration

1. **Set appropriate timeouts** based on use case
2. **Enable rate limiting** in production
3. **Monitor connection counts** and latency
4. **Log errors** with context
5. **Clean up resources** proactively

### Performance Optimization

1. **Use stage delay=0** in production
2. **Enable compression** if bandwidth-constrained (experimental)
3. **Batch content updates** for large presentations
4. **Cache skeleton/style** for identical requests
5. **Use CDN** for images

## Troubleshooting

### Connection Closes Immediately

**Cause**: Missing or invalid Accept header
**Solution**: Set `Accept: text/event-stream`

### No Events Received

**Cause**: Proxy/CDN buffering
**Solution**: Check X-Accel-Buffering header, disable proxy buffering

### Heartbeats Stop

**Cause**: Client disconnected
**Solution**: Implement reconnection logic

### Images Never Arrive

**Cause**: Image generation timeout or failure
**Solution**: Check placeholder is shown, verify provider status

### Rate Limited

**Cause**: Too many concurrent connections
**Solution**: Implement connection pooling or queue

## Future Enhancements

Planned for Phase 4+:

- **Resume/Reconnection** - Resume from last sequence number
- **Compression** - Gzip SSE messages
- **WebSocket Fallback** - For environments without SSE
- **Multi-client Broadcast** - Same presentation to multiple viewers
- **Partial Updates** - Update individual card sections
- **Binary Streaming** - Stream images as binary data

## References

- [SSE Specification](https://html.spec.whatwg.org/multipage/server-sent-events.html)
- [MDN EventSource](https://developer.mozilla.org/en-US/docs/Web/API/EventSource)
- [API-SPEC.md](./API-SPEC.md) - Section 6.3 and 10
- [SSE-CLIENT-GUIDE.md](./SSE-CLIENT-GUIDE.md) - Client implementation guide

## Support

For issues or questions:
- Check logs for error details
- Review test client for reference implementation
- See [QUICKSTART-API.md](./QUICKSTART-API.md) for setup
- Open an issue with reproduction steps
