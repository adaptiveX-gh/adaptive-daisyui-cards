# SSE Debugging Guide: Progressive Card Rendering

This guide helps debug cases where progress events appear but skeleton events with cards arrive in later chunks, leading to an empty DOM despite successful logs.

## Quick Checklist

- Client
  - Use a robust SSE parser that supports:
    - Multi-line `data:` fields joined by newlines
    - Both `\n` and `\r\n` line endings
    - Distinguishing SSE `event:` name from `data.eventType`
    - Buffering incomplete frames across chunks
  - Route events by priority: SSE `event` → `data.eventType` → `data.stage`.
  - Only render skeleton when `data.stage === 'skeleton'` AND `data.cards` is a non-empty array.
  - Add a 2s watchdog that logs buffer tails if no skeleton is rendered yet.

- Server
  - Frame events strictly per SSE spec:
    - Use `id:`, `event:`, `data:` lines, terminate each event with a blank line
    - Prefer single-line JSON for `data:` to avoid client multiline parsing errors (or ensure client supports multi-line)
  - Flush after each event:
    - Node/Express: `res.flushHeaders(); res.write(...);`
    - Use `Transfer-Encoding: chunked` and avoid buffering proxies
  - Headers to disable buffering/compression:
    - `Content-Type: text/event-stream`
    - `Cache-Control: no-cache, no-transform`
    - `Connection: keep-alive`
    - Nginx: `X-Accel-Buffering: no`
    - Disable gzip for SSE routes

## Client Reference Parser (Key Points)

- Split by double newline using `/\r?\n\r?\n/` to handle CRLF and LF
- Accumulate `data:` lines and join
- Prefer SSE `event` for routing; fall back to `data.eventType`
- Keep the remainder in a rolling buffer

## Example Server (Node/Express)

```js
app.get('/api/presentations/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // nginx
  res.flushHeaders?.();

  const writeEvent = (event, data, id) => {
    if (id) res.write(`id: ${id}\n`);
    if (event) res.write(`event: ${event}\n`);
    // send single-line JSON to simplify client parsing
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // 1) progress (chunk #1)
  writeEvent('progress', { stage: 'init', progress: 5, message: 'Starting' }, '1');

  setTimeout(() => {
    // 2) skeleton with cards (chunk #2)
    writeEvent('message', {
      stage: 'skeleton',
      cards: [
        { id: 'c1', layout: 'hero' },
        { id: 'c2', layout: 'numbered-list' }
      ]
    }, '2');
  }, 300);

  setTimeout(() => {
    // 3) complete (chunk #3)
    writeEvent('complete', { cardCount: 2, stages: 3 }, '3');
    res.end();
  }, 800);
});
```

## What To Look For

- If you only log the first chunk, your parser likely expects entire JSON on a single `data:` line but the server splits or uses CRLF inconsistently.
- If `stage: 'skeleton'` is present on progress events, prefer a distinct `event: progress` on the server and remove `stage: 'skeleton'` from non-skeleton messages.
- If DOM stays empty, verify that you only render when `data.cards` exists and has entries.

## Diagnostics Tips

- Add a watchdog timer (2s) to dump buffer tail when no skeleton rendered.
- Log chunk sizes and cumulative bytes to ensure new data is arriving.
- Mirror the raw stream (e.g., tee to a debug panel) if needed.
- Temporarily switch to EventSource (GET) to validate server framing; if it works with EventSource but not with `fetch`, the issue is in your custom parser.

## Acceptance Criteria for Fix

- Skeleton cards render reliably even when they arrive in chunk #2+.
- No JSON parse errors for multi-line or CRLF-terminated frames.
- Progress and skeleton are routed distinctly regardless of shared `stage` strings.
- Stream remains stable with heartbeats and no silent failures.
