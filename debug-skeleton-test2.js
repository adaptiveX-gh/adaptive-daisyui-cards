/**
 * Debug Script: Test Real API with Valid Topic
 */

import http from 'http';

function testRealAPI() {
  return new Promise((resolve, reject) => {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  Testing Real API with VALID topic                        ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    const postBody = JSON.stringify({
      topic: 'AI in Product Discovery',  // VALID topic!
      cardCount: 3,
      style: 'professional',
      includeImages: false,
      streamDelay: 200
    });

    const options = {
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
    };

    let skeletonFound = false;
    let buffer = '';

    const req = http.request(options, (res) => {
      console.log(`Status: ${res.statusCode}`);
      console.log(`Headers:`, res.headers);
      console.log('');

      res.on('data', (chunk) => {
        buffer += chunk.toString();

        const parts = buffer.split('\n\n');
        buffer = parts.pop();

        for (const part of parts) {
          if (!part.trim()) continue;

          console.log('MESSAGE:', part);
          console.log('');

          const dataMatch = part.match(/data: (.+)/);
          if (dataMatch) {
            try {
              const data = JSON.parse(dataMatch[1]);

              if (data.stage === 'skeleton') {
                skeletonFound = true;
                console.log('*** SKELETON FOUND! ***');
                console.log('Cards:', JSON.stringify(data.cards, null, 2));
                console.log('Card count:', data.cardCount);
                console.log('');
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      });

      res.on('end', () => {
        console.log('\n=== TEST RESULT ===');
        if (skeletonFound) {
          console.log('✓ SUCCESS: Skeleton message with cards received!');
        } else {
          console.log('✗ FAILURE: No skeleton message received');
        }
        resolve(skeletonFound);
      });
    });

    req.on('error', (err) => {
      console.error('Request error:', err);
      reject(err);
    });

    req.write(postBody);
    req.end();

    // Timeout
    setTimeout(() => {
      req.destroy();
      console.log('\nTimeout - test complete');
      resolve(skeletonFound);
    }, 3000);
  });
}

testRealAPI().catch(console.error);
