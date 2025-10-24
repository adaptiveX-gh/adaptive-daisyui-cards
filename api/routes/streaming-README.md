# SSE Streaming Routes

**Phase 3: Server-Sent Events Architecture**

## Overview

This module provides SSE (Server-Sent Events) streaming endpoints for progressive card generation. Cards are assembled in stages (skeleton → content → style → placeholder → image), providing instant visual feedback and non-blocking image generation.

## Endpoints

### POST /api/presentations/stream

Stream a complete presentation generation with all stages.

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

**Headers:**
```
Content-Type: application/json
Accept: text/event-stream
```

**Response:**

SSE stream with stage-based messages:

```
event: message
data: {"stage":"skeleton","cardCount":6,"cards":[...]}

event: message
data: {"stage":"content","cardId":"...","section":"title","content":"..."}

event: message
data: {"stage":"style","cardId":"...","styles":{...}}

event: complete
data: {"cardCount":6,"completedAt":"..."}
```

### POST /api/cards/stream

Stream a single card generation.

**Request:**

```json
{
  "topic": "Introduction to AI",
  "layoutType": "split",
  "style": "professional",
  "includeImages": true,
  "provider": "gemini"
}
```

**Response:** Same SSE format as presentations/stream, but for single card.

### GET /api/stream/demo

Demo endpoint with simulated delays for testing and visualization.

**Query Parameters:**
- `delay` - Stage delay in milliseconds (default: 500)

**Example:**
```
GET /api/stream/demo?delay=1000
```

## Stage Pipeline

### 1. Skeleton Stage

Emits card structure immediately.

```json
{
  "stage": "skeleton",
  "clientId": "client_...",
  "cardCount": 6,
  "cards": [
    {
      "id": "card_...",
      "layout": "hero",
      "type": "title"
    }
  ],
  "sequence": 1,
  "timestamp": "2025-10-23T..."
}
```

### 2. Content Stage

Emits text content for each section.

```json
{
  "stage": "content",
  "cardId": "card_...",
  "section": "title",
  "content": "AI in Product Discovery",
  "sequence": 2,
  "timestamp": "2025-10-23T..."
}
```

### 3. Style Stage

Emits theme and styling information.

```json
{
  "stage": "style",
  "cardId": "card_...",
  "styles": {
    "theme": { "name": "professional" },
    "layout": "hero",
    "type": "title"
  },
  "sequence": 8,
  "timestamp": "2025-10-23T..."
}
```

### 4. Placeholder Stage

Emits placeholder images (if images requested).

```json
{
  "stage": "placeholder",
  "cardId": "card_...",
  "placeholder": {
    "type": "geometric",
    "url": "data:image/svg+xml;base64,...",
    "loadingState": true,
    "aspectRatio": "16:9"
  },
  "sequence": 9,
  "timestamp": "2025-10-23T..."
}
```

### 5. Image Stage

Emits final generated images (async, when ready).

```json
{
  "stage": "image",
  "cardId": "card_...",
  "image": {
    "url": "https://storage.googleapis.com/...",
    "provider": "gemini",
    "metadata": {
      "width": 1024,
      "height": 576
    }
  },
  "sequence": 15,
  "timestamp": "2025-10-23T..."
}
```

## Event Types

### message

Standard stage updates (skeleton, content, style, placeholder, image).

### progress

Progress percentage updates during generation.

```json
{
  "stage": "content",
  "progress": 50,
  "message": "Generating content",
  "timestamp": "..."
}
```

### error

Error notifications with recovery hints.

```json
{
  "stage": "image",
  "error": {
    "code": "IMAGE_GENERATION_FAILED",
    "message": "Failed to generate image",
    "recoverable": true,
    "retryAfter": 5000
  },
  "cardId": "...",
  "timestamp": "..."
}
```

### complete

Stream completion notification.

```json
{
  "clientId": "client_...",
  "cardCount": 6,
  "stages": 5,
  "completedAt": "..."
}
```

## Request Parameters

### Common Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `topic` | string | Yes | - | Presentation topic |
| `style` | string | No | "professional" | Presentation style |
| `theme` | object | No | Based on style | Theme configuration |
| `includeImages` | boolean | No | false | Generate images |
| `provider` | string | No | "gemini" | Image provider |
| `streamDelay` | number | No | 0 | Stage delay (ms, for testing) |

### Presentation-Specific

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `cardCount` | number | Yes | - | Number of cards (1-20) |
| `layouts` | string[] | No | Auto-selected | Specific layouts to use |

### Card-Specific

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `layoutType` | string | Yes | - | Layout type (split, hero, etc.) |

## Response Headers

```
Content-Type: text/event-stream
Cache-Control: no-cache, no-transform
Connection: keep-alive
X-Accel-Buffering: no
```

## Heartbeat

Server sends heartbeat comments every 15 seconds:

```
: heartbeat

```

This keeps connections alive and detects disconnects.

## Error Handling

### Client-Side Errors (400)

- Missing required parameters
- Invalid topic
- Card count out of range (1-20)
- Invalid layout type

### Server-Side Errors (500)

- Card generation failure
- Template rendering error
- Internal service error

Errors are sent as SSE error events:

```
event: error
data: {"stage":"generation","error":{...}}
```

## Connection Management

### Lifecycle

1. Client connects (POST request)
2. Server generates unique client ID
3. Client added to ConnectionStore
4. Heartbeat started (15s interval)
5. Stages streamed progressively
6. Image generation (async, if requested)
7. Completion event sent
8. Client disconnects
9. Cleanup triggered

### Cleanup

- Heartbeat stopped
- Connection removed from store
- Image listeners cleaned up
- Resources released

### Rate Limiting

- Max 100 concurrent connections (server-wide)
- Max 10 concurrent connections per IP
- 429 error if limit exceeded

## Client Example

### JavaScript (Fetch API)

```javascript
fetch('http://localhost:3000/api/presentations/stream', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'text/event-stream'
  },
  body: JSON.stringify({
    topic: 'AI in Product Discovery',
    cardCount: 6,
    includeImages: true
  })
}).then(response => {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  function readStream() {
    reader.read().then(({ done, value }) => {
      if (done) return;

      const chunk = decoder.decode(value);
      parseSSE(chunk);

      readStream();
    });
  }

  readStream();
});

function parseSSE(chunk) {
  const lines = chunk.split('\n');

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.substring(6));
      handleStage(data);
    }
  }
}
```

### cURL (Demo Only)

```bash
curl -N -H "Accept: text/event-stream" \
  -H "Content-Type: application/json" \
  -X POST http://localhost:3000/api/presentations/stream \
  -d '{"topic":"AI in Product Discovery","cardCount":3}'
```

Note: cURL is limited for SSE. Use browser or proper client.

## Testing

### Manual Testing

Use the visual test client:

```
http://localhost:3000/tests/api/streaming-client.html
```

### Unit Tests

```bash
npm test tests/api/StreamingService.test.js
```

### Integration Tests

```bash
npm test tests/api/streaming-e2e.test.js
```

## Performance

### Latency Targets

- Time to First Byte: <100ms
- Skeleton Stage: <50ms
- Content Complete: <200ms
- Full Presentation (no images): <350ms

### Resource Usage

- Memory: ~50KB per connection
- CPU: Minimal (event-driven)
- Network: ~10KB per card

## Configuration

Environment variables (`.env`):

```bash
SSE_MAX_CONNECTIONS=100
SSE_MAX_CONNECTIONS_PER_IP=10
SSE_HEARTBEAT_INTERVAL=15000
SSE_CONNECTION_TIMEOUT=120000
SSE_STAGE_DELAY=0
```

## Middleware

### sseSetup.js

Provides:
- SSE header configuration
- Accept header validation
- IP-based rate limiting
- Connection tracking

```javascript
import { sseMiddleware } from '../middleware/sseSetup.js';

router.post('/stream', sseMiddleware, async (req, res) => {
  // SSE headers already set
  // Rate limiting applied
  // Request validated
});
```

## Services

### StreamingService

Core SSE service managing connections and stage emission.

```javascript
import { streamingService } from '../services/StreamingService.js';

// Add client
streamingService.addClient(res, clientId, metadata);

// Emit stages
await streamingService.emitSkeleton(clientId, cards);
await streamingService.emitContent(clientId, card, section, content);
await streamingService.emitStyle(clientId, card);

// Complete
streamingService.emitComplete(clientId);

// Remove on disconnect
req.on('close', () => streamingService.removeClient(clientId));
```

### ConnectionStore

Manages client connections with heartbeat and cleanup.

```javascript
import { connectionStore } from '../services/ConnectionStore.js';

// Find client by card ID
const client = connectionStore.findByCardId(cardId);

// Check if active
if (connectionStore.isActive(clientId)) {
  // Send update
}

// Get statistics
const stats = connectionStore.getStats();
```

## Image Integration

StreamingService listens to ImageGenerationService events:

```javascript
imageGenerationService.on('image:complete', ({ cardId, result }) => {
  const client = connectionStore.findByCardId(cardId);
  if (client) {
    streamingService.emitImage(client.id, cardId, result);
  }
});
```

## Troubleshooting

### Connection Closes Immediately

**Cause:** Missing Accept header

**Solution:** Set `Accept: text/event-stream`

### No Events Received

**Cause:** Proxy/CDN buffering

**Solution:** Set `X-Accel-Buffering: no`, disable proxy buffering

### Rate Limited

**Cause:** Too many connections

**Solution:** Reduce concurrent streams or increase limits

### Images Never Arrive

**Cause:** Image generation timeout/failure

**Solution:** Check placeholder is shown, verify provider status

## Documentation

- **[SSE-STREAMING.md](../../docs/SSE-STREAMING.md)** - Complete architecture guide
- **[SSE-CLIENT-GUIDE.md](../../docs/SSE-CLIENT-GUIDE.md)** - Client implementation patterns
- **[API-SPEC.md](../../docs/API-SPEC.md)** - Section 6.3 and 10

## Support

For issues:
1. Check logs for error details
2. Review test client for reference
3. Verify server configuration
4. Check network tab for SSE messages
