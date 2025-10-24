# Mock SSE Server for Testing Progressive Card Rendering

## Overview

The mock SSE server simulates realistic Server-Sent Events (SSE) streaming for testing progressive card rendering without requiring the full API backend. It's specifically designed to test edge cases like:

- Multi-chunk delivery (skeleton arrives in chunk #2+)
- Multi-line JSON data fields
- CRLF vs LF line endings
- Mid-stream errors
- Configurable delays and timing

## Quick Start

### 1. Start the Mock Server

```bash
# Standard mode
npm run api:mock

# Development mode (auto-restart on changes)
npm run api:mock:dev

# Alternative
npm run test:sse
```

The server will start on **http://localhost:3001**

### 2. Open the Test Page

Navigate to: **http://localhost:5173/tests/api/streaming-progressive.html**

Or open the HTML file directly in your browser.

### 3. Configure the Test

1. Select **"Mock Server (localhost:3001)"** from the endpoint dropdown
2. Choose a test mode:
   - **Chunked (realistic)** - Simulates real-world streaming with progress in chunk #1, skeleton in chunk #2
   - **Multi-line JSON** - Tests parser's ability to handle multi-line `data:` fields
   - **CRLF Line Endings** - Tests Windows-style line endings (`\r\n`)
   - **Error Mid-Stream** - Simulates an error during content generation
   - **Fast (no delays)** - Rapid streaming for performance testing

4. Adjust parameters (cards, delay, etc.)
5. Click **"Start Streaming"**

## API Endpoints

### GET /mock/stream

Main streaming endpoint with query parameters.

**Query Parameters:**
```
delay        - Delay between chunks in ms (default: 500)
cards        - Number of cards to generate (default: 3)
mode         - chunked, multiline, crlf, error, fast
includeHeartbeat - true/false (default: false)
```

**Examples:**
```bash
# Realistic streaming with 3 cards, 500ms delay
curl http://localhost:3001/mock/stream?delay=500&cards=3

# Fast streaming with 5 cards
curl "http://localhost:3001/mock/stream?delay=50&cards=5&mode=fast"

# Test multi-line JSON parsing
curl "http://localhost:3001/mock/stream?mode=multiline"

# Test CRLF line endings
curl "http://localhost:3001/mock/stream?mode=crlf"

# Test error handling
curl "http://localhost:3001/mock/stream?mode=error"
```

### GET /mock/demo

Simple demo endpoint that sends 5 events with 1s delay.

```bash
curl http://localhost:3001/mock/demo
```

### GET /mock/health

Health check endpoint.

```bash
curl http://localhost:3001/mock/health
```

**Response:**
```json
{
  "status": "ok",
  "server": "mock-sse-server",
  "endpoints": [...]
}
```

## Event Sequence

The mock server sends events in this order:

### 1. Progress Event (Chunk #1)
```
id: 1
event: progress
data: {"stage":"skeleton","progress":10,"message":"Generating card structure"}

```

### 2. Skeleton Event (Chunk #2) ⭐ CRITICAL
```
id: 2
event: message
data: {"stage":"skeleton","cards":[{"id":"mock-card-1","layout":"hero"}],...}

```

### 3. Progress Event (Chunk #3)
```
id: 3
event: progress
data: {"stage":"content","progress":50,"message":"Generating content"}

```

### 4. Content Events (Multiple Chunks)
```
id: 4
event: message
data: {"stage":"content","cardId":"mock-card-1","section":"title","content":"Mock Card 1 Title"}

id: 5
event: message
data: {"stage":"content","cardId":"mock-card-1","section":"body","content":"This is mock content..."}

```

### 5. Progress Event
```
id: N
event: progress
data: {"stage":"style","progress":90,"message":"Applying styles"}

```

### 6. Style Events
```
id: N+1
event: message
data: {"stage":"style","cardId":"mock-card-1","styles":{"theme":{...}}}

```

### 7. Complete Event
```
id: N+M
event: complete
data: {"cardCount":3,"stages":3,"completedAt":"..."}

```

## Testing Edge Cases

### Test 1: Multi-Chunk Skeleton Delivery

**Purpose:** Verify parser handles skeleton arriving in chunk #2

```bash
# In browser: Select "Chunked (realistic)" mode
# Watch Event Log - you should see:
# - Chunk #1: progress event
# - Chunk #2: skeleton event with cards array
# - Cards render after chunk #2 arrives
```

**Expected Behavior:**
- Progress event arrives first (no cards rendered)
- Skeleton event arrives in chunk #2
- Cards with shimmer animation appear
- Content fills in progressively

### Test 2: Multi-Line JSON

**Purpose:** Verify parser joins multi-line `data:` fields

```bash
# In browser: Select "Multi-line JSON" mode
# Console should show successful parsing of multi-line data
```

**Expected Behavior:**
- Parser accumulates multiple `data:` lines
- Joins them before JSON.parse
- No parse errors
- Cards render correctly

### Test 3: CRLF Line Endings

**Purpose:** Verify parser handles Windows-style line endings

```bash
# In browser: Select "CRLF Line Endings" mode
```

**Expected Behavior:**
- Parser strips `\r` characters
- Event boundaries detected correctly
- No duplicate events or missed events

### Test 4: Error Mid-Stream

**Purpose:** Test error handling during streaming

```bash
# In browser: Select "Error Mid-Stream" mode
# Stream should start normally, then error during content stage
```

**Expected Behavior:**
- Skeleton renders successfully
- Error event received
- Error message shown in Event Log
- Connection Status shows "Error"

### Test 5: Fast Streaming

**Purpose:** Performance test with minimal delays

```bash
# In browser: Select "Fast (no delays)" mode
# Or use delay=0 in query params
```

**Expected Behavior:**
- All events arrive rapidly
- No rendering errors
- Smooth animations
- No layout shifts

## Diagnostics

### Watch the Event Log

The test page includes a collapsible Event Log that shows:
- Event timestamps
- Event types and stages
- Chunk boundaries
- Parse errors
- Buffer diagnostics

### Console Logs

Both client and server log detailed information:

**Client Console:**
```
[CLIENT] ✓ Parsed SSE: {eventType: 'progress', ...}
[CLIENT] → Routing to handleMessage as progress
[CLIENT] → SKELETON EVENT FOUND! Cards: 3
📦 Skeleton: mock-card-1 (hero)
```

**Server Console:**
```
[MOCK] Starting stream: 3 cards, 500ms delay, mode=chunked
[MOCK] === CHUNK #1 ===
[MOCK] Sending: progress (skeleton)
[MOCK] === CHUNK #2 ===
[MOCK] Sending: message (skeleton)
```

### Watchdog Timer

If no skeleton is rendered within 2 seconds, a watchdog logs:
- Buffer tail (last 200 chars)
- Total bytes received
- Number of chunks
- Number of events parsed

## Common Issues

### Issue: Cards don't render

**Debug Steps:**
1. Check Event Log - did skeleton event arrive?
2. Look for `→ SKELETON EVENT FOUND! Cards: N` in console
3. Check for JavaScript errors
4. Verify `data.cards` exists in skeleton event

### Issue: Multiple instances of same card

**Cause:** Event handler called multiple times

**Fix:** Check routing logic - ensure progress events with `stage: "skeleton"` don't trigger skeleton rendering

### Issue: Parse errors

**Cause:** Malformed JSON or incorrect line ending handling

**Fix:** Check mode selection - try "chunked" mode first

## Integration with Real API

To switch between mock and real API:

1. **Mock Server:** Select "Mock Server" in endpoint dropdown
2. **Real API:** Select "Real API" in endpoint dropdown

The test page automatically adjusts:
- Request method (GET for mock, POST for real)
- Request format (query params vs JSON body)
- Endpoint URL

## Development

### File Structure

```
tests/api/
├── mock-sse-server.js          # Mock server implementation
├── streaming-progressive.html   # Test page with enhanced parser
└── README-MOCK-SERVER.md       # This file
```

### Modifying the Mock Server

Edit `tests/api/mock-sse-server.js` to:
- Add new test modes
- Adjust timing
- Add new event types
- Simulate different scenarios

The server uses `nodemon` in dev mode, so changes auto-restart the server.

### Adding New Test Modes

1. Add mode to `streaming-progressive.html` mock mode dropdown
2. Add case in `mock-sse-server.js` streamSequence function
3. Document the new mode in this README

## Acceptance Criteria

✅ Mock server starts on port 3001
✅ Health endpoint returns 200 OK
✅ Skeleton arrives in chunk #2 (after progress)
✅ Client parses multi-line JSON correctly
✅ Client handles CRLF and LF line endings
✅ Error events display correctly
✅ Cards render progressively
✅ No console errors
✅ Event Log shows all events
✅ Stats panel updates correctly

## Troubleshooting

### Port 3001 already in use

```bash
# Kill existing process
# Windows
netstat -ano | findstr :3001
taskkill /PID <pid> /F

# macOS/Linux
lsof -ti:3001 | xargs kill -9
```

### Mock server not starting

1. Check Node.js version (requires v14+)
2. Verify dependencies installed: `npm install`
3. Check for syntax errors: `node tests/api/mock-sse-server.js`

### CORS errors

The mock server includes CORS headers. If you still see CORS errors:
1. Check browser console for exact error
2. Verify request includes `Accept: text/event-stream` header
3. Try accessing from same origin (open HTML file via Vite dev server)

## Resources

- [SSE Specification](https://html.spec.whatwg.org/multipage/server-sent-events.html)
- [SSE-DEBUG.md](../../docs/SSE-DEBUG.md) - Comprehensive SSE debugging guide
- [EventSource API](https://developer.mozilla.org/en-US/docs/Web/API/EventSource)

## License

MIT - Same as parent project
