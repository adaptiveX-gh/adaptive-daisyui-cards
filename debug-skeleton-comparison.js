/**
 * Debug Script: Compare Mock vs Real API Skeleton Messages
 *
 * This script connects to both servers and logs the exact skeleton messages
 * to identify why real API doesn't produce cards but mock does.
 */

import http from 'http';

/**
 * Connect to SSE endpoint and log all messages
 */
function connectAndLog(name, options, postData = null) {
  return new Promise((resolve, reject) => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`[${name}] Connecting...`);
    console.log(`${'='.repeat(60)}\n`);

    const messages = [];
    let skeletonMessage = null;

    const req = http.request(options, (res) => {
      console.log(`[${name}] Status: ${res.statusCode}`);
      console.log(`[${name}] Headers:`, res.headers);
      console.log('');

      let buffer = '';
      let messageCount = 0;

      res.on('data', (chunk) => {
        buffer += chunk.toString();

        // Log raw chunk
        console.log(`[${name}] RAW CHUNK #${++messageCount}:`);
        console.log(JSON.stringify(chunk.toString()));
        console.log('');

        // Parse SSE messages (separated by \n\n)
        const parts = buffer.split('\n\n');
        buffer = parts.pop(); // Keep incomplete message in buffer

        for (const part of parts) {
          if (!part.trim()) continue;

          console.log(`[${name}] PARSED MESSAGE:`);
          console.log(part);
          console.log('');

          // Try to extract JSON data
          const dataMatch = part.match(/data: (.+)/);
          if (dataMatch) {
            try {
              const data = JSON.parse(dataMatch[1]);
              console.log(`[${name}] PARSED JSON:`, JSON.stringify(data, null, 2));
              console.log('');

              messages.push(data);

              // Capture skeleton message
              if (data.stage === 'skeleton') {
                skeletonMessage = data;
                console.log(`[${name}] *** SKELETON MESSAGE CAPTURED ***`);
                console.log(JSON.stringify(data, null, 2));
                console.log('');
              }
            } catch (e) {
              console.log(`[${name}] Failed to parse JSON:`, e.message);
            }
          }
        }
      });

      res.on('end', () => {
        console.log(`[${name}] Connection ended`);
        console.log(`[${name}] Total messages received: ${messages.length}`);

        if (skeletonMessage) {
          console.log(`\n[${name}] SKELETON MESSAGE ANALYSIS:`);
          console.log(`  - Has cards: ${!!skeletonMessage.cards}`);
          console.log(`  - Card count: ${skeletonMessage.cardCount || 0}`);
          console.log(`  - Cards array length: ${skeletonMessage.cards?.length || 0}`);
          console.log(`  - Cards data:`, JSON.stringify(skeletonMessage.cards, null, 2));
        } else {
          console.log(`\n[${name}] ⚠️ NO SKELETON MESSAGE RECEIVED!`);
        }

        resolve({ name, messages, skeletonMessage });
      });
    });

    req.on('error', (err) => {
      console.error(`[${name}] Request error:`, err);
      reject(err);
    });

    if (postData) {
      req.write(postData);
    }

    req.end();

    // Timeout after 5 seconds
    setTimeout(() => {
      req.destroy();
      console.log(`[${name}] Timeout - closing connection`);
      resolve({ name, messages, skeletonMessage });
    }, 5000);
  });
}

/**
 * Test both servers
 */
async function runComparison() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  DEBUG: Mock vs Real API Skeleton Message Comparison      ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  const postBody = JSON.stringify({
    topic: 'Test Topic',
    cardCount: 3,
    style: 'professional',
    includeImages: false,
    streamDelay: 200
  });

  // Test Mock Server
  const mockResult = await connectAndLog(
    'MOCK SERVER',
    {
      hostname: 'localhost',
      port: 3001,
      path: '/mock/stream?delay=200&cards=3',
      method: 'GET',
      headers: {
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache'
      }
    }
  );

  // Wait a bit between requests
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test Real API
  const realResult = await connectAndLog(
    'REAL API',
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/presentations/stream',
      method: 'POST',
      headers: {
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postBody)
      }
    },
    postBody
  );

  // Final comparison
  console.log('\n\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  COMPARISON RESULTS                                        ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');

  console.log('MOCK SERVER:');
  console.log(`  - Total messages: ${mockResult.messages.length}`);
  console.log(`  - Has skeleton: ${!!mockResult.skeletonMessage}`);
  if (mockResult.skeletonMessage) {
    console.log(`  - Cards in skeleton: ${mockResult.skeletonMessage.cards?.length || 0}`);
    console.log(`  - Card IDs: ${mockResult.skeletonMessage.cards?.map(c => c.id).join(', ')}`);
  }

  console.log('');
  console.log('REAL API:');
  console.log(`  - Total messages: ${realResult.messages.length}`);
  console.log(`  - Has skeleton: ${!!realResult.skeletonMessage}`);
  if (realResult.skeletonMessage) {
    console.log(`  - Cards in skeleton: ${realResult.skeletonMessage.cards?.length || 0}`);
    console.log(`  - Card IDs: ${realResult.skeletonMessage.cards?.map(c => c.id).join(', ')}`);
  }

  console.log('');
  console.log('DIAGNOSIS:');
  if (mockResult.skeletonMessage && !realResult.skeletonMessage) {
    console.log('  ❌ Real API is NOT sending skeleton message at all');
  } else if (mockResult.skeletonMessage && realResult.skeletonMessage) {
    if (mockResult.skeletonMessage.cards?.length > 0 &&
        (!realResult.skeletonMessage.cards || realResult.skeletonMessage.cards.length === 0)) {
      console.log('  ❌ Real API skeleton message has NO cards array or empty cards');
    } else {
      console.log('  ✓ Both servers sending skeleton messages with cards');
    }
  }

  console.log('\n');
}

// Run the comparison
runComparison().catch(console.error);
