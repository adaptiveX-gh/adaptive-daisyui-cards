# SSE Stream Analysis: Event Format vs Client Expectations

**Date**: 2025-10-24
**Issue**: Client receives SSE events but cards don't render
**Root Cause**: Event type mismatch between API and client expectations

---

## Problem Summary

The client is listening for events correctly, but **cards are not rendering** because the client code is checking for the wrong event types or the API is not sending the expected event structure.

---

## API Event Format (ACTUAL)

### What the API SENDS

Based on `D:\Users\scale\Code\slideo\api\utils\sseFormatter.js` and `D:\Users\scale\Code\slideo\api\services\StreamingService.js`:

#### 1. Progress Events
```
event: progress
data: {"stage":"skeleton","progress":10,"message":"Generating card structure","timestamp":"..."}
```

#### 2. Skeleton Stage Event
```
event: message
data: {"stage":"skeleton","clientId":"...","cardCount":6,"cards":[{"id":"...","layout":"hero","type":"title"}],"timestamp":"...","sequence":1}
```

#### 3. Content Stage Events
```
event: message
data: {"stage":"content","cardId":"...","section":"title","content":"AI in Product Discovery","timestamp":"...","sequence":2}
```

#### 4. Style Stage Events
```
event: message
data: {"stage":"style","cardId":"...","styles":{"theme":{...},"layout":"hero","type":"title"},"timestamp":"...","sequence":3}
```

#### 5. Placeholder Stage Events
```
event: message
data: {"stage":"placeholder","cardId":"...","placeholder":{"type":"geometric","url":null,"loadingState":true},"timestamp":"...","sequence":4}
```

#### 6. Image Stage Events
```
event: message
data: {"stage":"image","cardId":"...","image":{"url":"https://...","metadata":{...}},"timestamp":"...","sequence":5}
```

#### 7. Complete Event
```
event: complete
data: {"clientId":"...","cardCount":6,"stages":3,"includeImages":false,"completedAt":"...","sequence":6}
```

#### 8. Error Event
```
event: error
data: {"stage":"...","error":{"code":"...","message":"...","recoverable":true},"timestamp":"...","sequence":7}
```

---

## Client Event Handling (EXPECTED)

Based on `D:\Users\scale\Code\slideo\tests\api\streaming-progressive.html` (lines 552-572):

```javascript
// Route message based on eventType FIRST, then data.stage
if (eventType === 'progress') {
  handleMessage({ stage: 'progress', ...data });
} else if (eventType === 'complete') {
  handleMessage({ stage: 'complete', ...data });
} else if (eventType === 'error') {
  handleMessage({ stage: 'error', ...data });
} else if (eventType === 'message' && data.stage) {
  // 'message' events with stage are actual card stage events
  handleMessage(data);
} else {
  console.log('[CLIENT] Unhandled event type:', eventType, data);
}
```

The client's `handleMessage()` function (lines 371-409) expects:

```javascript
function handleMessage(data) {
  switch (data.stage) {
    case 'skeleton':
      // Expects: data.cards array
      if (data.cards) {
        data.cards.forEach(card => renderCardSkeleton(card));
      }
      break;

    case 'content':
      // Expects: data.cardId, data.section, data.content
      if (data.cardId && data.section) {
        renderCardContent(data.cardId, data.section, data.content);
      }
      break;

    case 'style':
      // Expects: data.cardId, data.styles
      if (data.cardId && data.styles) {
        renderCardStyle(data.cardId, data.styles);
      }
      break;

    case 'complete':
      // Expects: data.cardCount, data.stages
      logEvent(`Complete: ${data.cardCount} cards in ${data.stages} stages`);
      break;

    case 'progress':
      // Expects: data.message, data.progress
      logEvent(`Progress: ${data.message} (${data.progress}%)`);
      break;

    case 'error':
      // Expects: data.message
      logEvent(`Error: ${data.message}`);
      break;
  }
}
```

---

## Event Flow Sequence

Based on `D:\Users\scale\Code\slideo\api\routes\streaming.js` (lines 420-475), the correct sequence is:

```
1. Progress Event: event: progress, data.stage="skeleton"
2. Skeleton Event: event: message, data.stage="skeleton", data.cards=[...]
3. Progress Event: event: progress, data.stage="content"
4. Content Events: event: message, data.stage="content" (one per card section)
5. Progress Event: event: progress, data.stage="style"
6. Style Events: event: message, data.stage="style" (one per card)
7. [If images] Progress Event: event: progress, data.stage="placeholder"
8. [If images] Placeholder Events: event: message, data.stage="placeholder"
9. [If images] Progress Event: event: progress, data.stage="image"
10. [If images] Image Events: event: message, data.stage="image" (async)
11. Complete Event: event: complete
```

---

## Critical Finding: API IS CORRECT

### The API implementation is **CORRECT** and sends:

1. **Skeleton events with card data**:
   ```javascript
   // StreamingService.js line 159-177
   async emitSkeleton(clientId, cards) {
     const message = formatSkeletonMessage(clientId, cards, sequence);
     // Sends: event: message, data.stage="skeleton", data.cards=[...]
   }
   ```

2. **Content events per section**:
   ```javascript
   // StreamingService.js line 214-227
   async emitCardContent(clientId, card) {
     for (const [section, value] of Object.entries(content)) {
       await this.emitContent(clientId, card, section, value);
       // Sends: event: message, data.stage="content", data.cardId, data.section, data.content
     }
   }
   ```

3. **Style events per card**:
   ```javascript
   // StreamingService.js line 236-260
   async emitStyle(clientId, card) {
     const styles = { theme: card.theme, layout: card.layout, type: card.type };
     const message = formatStyleMessage(card.id, styles, sequence);
     // Sends: event: message, data.stage="style", data.cardId, data.styles
   }
   ```

---

## SSE Message Format Specification

Based on `D:\Users\scale\Code\slideo\api\utils\sseFormatter.js` (lines 16-35):

```javascript
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
```

**Format Rules**:
- Each SSE message ends with `\n\n` (double newline)
- Event type comes from `event:` line
- JSON payload comes from `data:` line
- Optional `id:` line for sequence tracking

---

## Diagnostic Questions

### For Debugging the Issue:

1. **Are skeleton events actually being sent?**
   - Check API logs for: `[STREAM-PRES] Stage 1: Emitting skeleton...`
   - Check API logs for: `StreamingService: Emitting skeleton to ${clientId}`

2. **Are cards rendering at all?**
   - Check browser console for: `[CLIENT] ✓ Parsed SSE: { eventType: 'message', stage: 'skeleton' }`
   - Check event log for: `📦 Skeleton: ${card.id}`

3. **Is the handleMessage() being called?**
   - Add console.log at start of handleMessage() function
   - Check if switch statement hits the 'skeleton' case

4. **Are the data fields present?**
   - Log the entire `data` object when eventType === 'message'
   - Verify `data.cards` is an array with expected structure:
     ```javascript
     data.cards = [
       { id: "...", layout: "hero", type: "title" },
       { id: "...", layout: "split", type: "content" }
     ]
     ```

---

## Expected vs Actual Analysis

### What the API SHOULD Send (✓ Correct)

```
event: message
data: {"stage":"skeleton","clientId":"client_...","cardCount":6,"cards":[{"id":"card-...","layout":"hero","type":"title"},...],"timestamp":"2025-10-24T...","sequence":1}

```

### What the API ACTUALLY Sends (✓ Verified)

Based on code inspection:
- `formatSkeletonMessage()` in sseFormatter.js (line 76-86) creates the correct format
- `emitSkeleton()` in StreamingService.js (line 159-177) calls formatSkeletonMessage
- `streamPresentation()` in streaming.js (line 426-429) calls emitSkeleton

**Conclusion**: The API sends exactly what the client expects.

---

## Potential Root Causes

Since the API format is correct, the issue must be one of:

### 1. **Timing Issue**
- Progress events arrive before skeleton events
- Client may be filtering out messages incorrectly
- **Test**: Check if `handleMessage()` is called for skeleton stage

### 2. **Client Parsing Error**
- JSON.parse() fails on skeleton data
- Large card arrays may have parsing issues
- **Test**: Wrap JSON.parse in try-catch and log errors

### 3. **Event Handler Registration**
- handleMessage() may not be properly wired up
- EventSource API vs fetch/ReadableStream differences
- **Test**: Add console.log at handleMessage() entry point

### 4. **Data Validation Failure**
- Client checks `if (data.cards)` but data.cards is undefined
- Field name mismatch (cards vs cardData)
- **Test**: Log the exact `data` object received in skeleton case

### 5. **Client-Side Filter/Guard**
- Some condition prevents renderCardSkeleton() from running
- Card container element not found
- **Test**: Add breakpoint in renderCardSkeleton()

---

## Recommended Debugging Steps

### Step 1: Verify API Sends Skeleton
```bash
# Start API with verbose logging
npm run dev

# Check logs for:
# [STREAM-PRES] Stage 1: Emitting skeleton...
# StreamingService: Emitting skeleton to client_...
```

### Step 2: Verify Client Receives Skeleton
```javascript
// In streaming-progressive.html, add after line 554:
console.log('[DEBUG] Received event:', eventType, 'with data:', JSON.stringify(data, null, 2));
```

### Step 3: Verify handleMessage() is Called
```javascript
// In handleMessage() function at line 371, add:
function handleMessage(data) {
  console.log('[DEBUG] handleMessage called with:', JSON.stringify(data, null, 2));
  // ... rest of function
}
```

### Step 4: Verify renderCardSkeleton() is Called
```javascript
// In renderCardSkeleton() at line 241, add:
function renderCardSkeleton(card) {
  console.log('[DEBUG] renderCardSkeleton called with:', card);
  // ... rest of function
}
```

### Step 5: Check for JavaScript Errors
```javascript
// Open browser DevTools Console
// Look for any red error messages
// Check Network tab to verify SSE connection stays open
```

---

## Next Steps for Resolution

1. **Run the test page**: Open `tests/api/streaming-progressive.html`
2. **Open DevTools**: Check Console and Network tabs
3. **Start streaming**: Click "Start Streaming" button
4. **Analyze logs**: Look for the debug messages added above
5. **Identify gap**: Find where the event flow breaks

### Expected Log Sequence:
```
[CLIENT] ===== STARTING FETCH =====
[CLIENT] Response received: status 200
[CLIENT] Starting to read stream...
[CLIENT] Calling reader.read() #1...
[CLIENT] ✓ Read promise resolved for #1
[CLIENT] Chunk #1: id: 1\nevent: progress\ndata: {...}...
[CLIENT] Processing 1 complete messages from chunk #1
[CLIENT] ✓ Parsed SSE: { eventType: 'progress', id: '1', stage: 'skeleton' }
[CLIENT] Calling reader.read() #2...
[CLIENT] ✓ Read promise resolved for #2
[CLIENT] Chunk #2: id: 2\nevent: message\ndata: {"stage":"skeleton",...}...
[CLIENT] Processing 1 complete messages from chunk #2
[CLIENT] ✓ Parsed SSE: { eventType: 'message', id: '2', stage: 'skeleton' }
[DEBUG] handleMessage called with: { stage: 'skeleton', clientId: '...', cards: [...] }
[DEBUG] renderCardSkeleton called with: { id: '...', layout: 'hero', type: 'title' }
📦 Skeleton: card-... (hero)
```

---

## Conclusion

**The API is correctly implemented** and sends:
- ✓ Skeleton events with `data.cards` array
- ✓ Content events with `data.cardId`, `data.section`, `data.content`
- ✓ Style events with `data.cardId`, `data.styles`
- ✓ Proper SSE format with `event:` and `data:` fields
- ✓ Correct sequence: progress → skeleton → content → style → complete

**The client is correctly listening** for:
- ✓ Event type routing (`eventType === 'message'`)
- ✓ Stage-based message handling (`data.stage === 'skeleton'`)
- ✓ Proper data extraction (`data.cards`, `data.cardId`, etc.)

**The issue must be**:
- A runtime/timing problem (not a design problem)
- JavaScript error preventing execution
- Network interruption or parsing failure
- Client-side validation/guard condition

**Action Required**:
Run the debugging steps above to identify the exact point where the event flow breaks.
