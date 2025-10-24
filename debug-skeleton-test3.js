/**
 * Debug Script: Test Real API with Valid Topic - LONGER WAIT
 */

import http from 'http';

function testRealAPI() {
  return new Promise((resolve, reject) => {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  Testing Real API - Waiting for ALL messages              ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    const postBody = JSON.stringify({
      topic: 'AI in Product Discovery',
      cardCount: 3,
      style: 'professional',
      includeImages: false,
      streamDelay: 100
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

    let skeletonWithCards = null;
    let buffer = '';
    let messageCount = 0;

    const req = http.request(options, (res) => {
      console.log(`Status: ${res.statusCode}`);
      console.log('');

      res.on('data', (chunk) => {
        buffer += chunk.toString();

        const parts = buffer.split('\n\n');
        buffer = parts.pop();

        for (const part of parts) {
          if (!part.trim()) continue;

          messageCount++;
          console.log(`\n[MSG #${messageCount}]`, part);

          const dataMatch = part.match(/data: (.+)/);
          if (dataMatch) {
            try {
              const data = JSON.parse(dataMatch[1]);

              if (data.stage === 'skeleton') {
                if (data.cards && data.cards.length > 0) {
                  skeletonWithCards = data;
                  console.log('\n*** SKELETON WITH CARDS FOUND! ***');
                  console.log('Cards:', data.cards.length);
                  console.log('IDs:', data.cards.map(c => c.id).join(', '));
                } else {
                  console.log('(skeleton progress, no cards yet)');
                }
              }
            } catch (e) {
              console.log('(not JSON)');
            }
          }
        }
      });

      res.on('end', () => {
        console.log('\n\n=== TEST COMPLETE ===');
        console.log(`Total messages: ${messageCount}`);

        if (skeletonWithCards) {
          console.log('✓ SUCCESS: Skeleton message with cards received!');
          console.log('  Card count:', skeletonWithCards.cardCount);
          console.log('  Cards:', JSON.stringify(skeletonWithCards.cards, null, 2));
        } else {
          console.log('✗ FAILURE: No skeleton message with cards array');
        }
        resolve(skeletonWithCards);
      });
    });

    req.on('error', (err) => {
      console.error('Request error:', err);
      reject(err);
    });

    req.write(postBody);
    req.end();

    // Longer timeout - 8 seconds
    setTimeout(() => {
      req.destroy();
      console.log('\n\n[TIMEOUT] Closing connection...');
      resolve(skeletonWithCards);
    }, 8000);
  });
}

testRealAPI().catch(console.error);
