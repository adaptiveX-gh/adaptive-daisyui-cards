# BUG REPORT: Real API Doesn't Send Skeleton Cards

## Summary
The real API server sends a progress event but never sends the actual skeleton message containing the cards array, while the mock server works correctly.

## Evidence

### Mock Server (Port 3001) - WORKS ✓
```
MESSAGE #1: progress event
{stage: "skeleton", progress: 10, message: "Generating card structure"}

MESSAGE #2: skeleton with cards  ← THIS IS THE IMPORTANT ONE
{
  stage: "skeleton",
  clientId: "mock-client-123",
  cardCount: 3,
  cards: [
    {id: "mock-card-1", layout: "hero", type: "title"},
    {id: "mock-card-2", layout: "split", type: "content"},
    {id: "mock-card-3", layout: "sidebar", type: "content"}
  ]
}
```

### Real API (Port 3000) - FAILS ✗
```
MESSAGE #1: progress event
{stage: "skeleton", progress: 10, message: "Generating card structure"}

[NO FURTHER MESSAGES - Connection hangs]
```

## Code Flow Analysis

### File: `api/routes/streaming.js`

**Line 427-429:**
```javascript
streamingService.emitProgress(clientId, 'skeleton', 10, 'Generating card structure');  // ← WORKS
await streamingService.emitSkeleton(clientId, cards);  // ← FAILS SILENTLY
console.log('[STREAM-PRES] ✓ Skeleton emitted successfully');  // ← NEVER LOGGED
```

### File: `api/services/StreamingService.js`

**emitSkeleton method (lines 159-177):**
```javascript
async emitSkeleton(clientId, cards) {
  console.log(`StreamingService: Emitting skeleton to ${clientId} (${cards.length} cards)`);  // ← NOT SEEN IN LOGS

  const sequence = this.getNextSequence(clientId);
  const message = formatSkeletonMessage(clientId, cards, sequence);
  const success = this.sendToClient(clientId, message);

  return success;
}
```

**sendToClient method (lines 130-150):**
```javascript
sendToClient(clientId, message) {
  const connection = this.connectionStore.get(clientId);

  if (!connection) {
    console.warn(`StreamingService: Client ${clientId} not found`);  // ← Would log if this failed
    return false;
  }

  if (!this.connectionStore.isActive(clientId)) {
    console.warn(`StreamingService: Client ${clientId} is inactive`);  // ← Would log if this failed
    return false;
  }

  return writeSSE(connection.res, message);
}
```

### File: `api/utils/sseFormatter.js`

**formatSkeletonMessage (lines 76-86):**
```javascript
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
```

**Tested independently - WORKS:**
```bash
$ node test-formatter.js
Cards in data: 3  ✓
```

## Hypotheses

### Hypothesis 1: Function is hanging (MOST LIKELY)
The `await streamingService.emitSkeleton()` call is blocking and never returning.

**Evidence:**
- Progress message sent successfully (line 427)
- Console log after emitSkeleton (line 429) never appears
- No error messages in catch block
- Connection stays open but receives no more messages

**Possible causes:**
1. `getNextSequence()` is blocking
2. `formatSkeletonMessage()` is hanging (unlikely - tested independently)
3. `sendToClient()` is blocking
4. `writeSSE()` is blocking

### Hypothesis 2: Silent exception
An exception is being thrown but not caught or logged.

**Evidence against:**
- Try/catch block should catch errors (lines 424-481)
- No error events received by client

### Hypothesis 3: Connection issue
The client connection is not properly initialized.

**Evidence against:**
- Progress message sends successfully
- Mock server works with same client code

## Debugging Steps Needed

1. **Add extensive logging to `emitSkeleton`:**
   ```javascript
   async emitSkeleton(clientId, cards) {
     console.log('[SKELETON-1] Starting emitSkeleton');
     console.log('[SKELETON-2] ClientId:', clientId);
     console.log('[SKELETON-3] Cards count:', cards.length);

     const sequence = this.getNextSequence(clientId);
     console.log('[SKELETON-4] Sequence:', sequence);

     const message = formatSkeletonMessage(clientId, cards, sequence);
     console.log('[SKELETON-5] Message formatted, length:', message.length);

     const success = this.sendToClient(clientId, message);
     console.log('[SKELETON-6] sendToClient returned:', success);

     return success;
   }
   ```

2. **Check if `getNextSequence` is working:**
   ```javascript
   getNextSequence(clientId) {
     console.log('[SEQ-1] Getting sequence for', clientId);
     const current = this.sequences.get(clientId) || 0;
     console.log('[SEQ-2] Current sequence:', current);
     const next = current + 1;
     this.sequences.set(clientId, next);
     console.log('[SEQ-3] Next sequence:', next);
     return next;
   }
   ```

3. **Check `writeSSE`:**
   ```javascript
   export function writeSSE(res, message) {
     try {
       console.log('[WRITE-SSE-1] Checking response state');
       console.log('[WRITE-SSE-2] writableEnded:', res.writableEnded);
       console.log('[WRITE-SSE-3] destroyed:', res.destroyed);

       if (res.writableEnded || res.destroyed) {
         console.log('[WRITE-SSE-4] Response not writable');
         return false;
       }

       console.log('[WRITE-SSE-5] Writing message...');
       res.write(message);
       console.log('[WRITE-SSE-6] Write successful');
       return true;
     } catch (error) {
       console.error('[WRITE-SSE-ERROR]', error);
       return false;
     }
   }
   ```

## Recommended Fix

Once we identify where the hang occurs, the fix will likely be one of:

1. **If `sendToClient` is blocking:** Add proper error handling or make it async
2. **If connection is stale:** Verify connection is active before sending
3. **If message is too large:** Check if there are buffering issues
4. **If formatting fails:** Add validation before sending

## Next Steps

1. Add debug logging to StreamingService.js
2. Restart API server
3. Run test again and examine logs
4. Identify exact line where execution stops
5. Implement fix based on findings
