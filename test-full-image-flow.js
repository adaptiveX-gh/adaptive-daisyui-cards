import 'dotenv/config';

console.log('Testing full API image generation flow with status checking...\n');

async function testImageGeneration() {
  // Step 1: Generate card with image
  console.log('Step 1: Generating card with image...');

  const cardRequest = {
    topic: 'AI in Product Discovery',
    layoutType: 'hero',
    tone: 'professional',
    contentSections: ['title', 'body'],
    style: 'professional-presentation',
    generateImage: true,
    imageProvider: 'gemini'
  };

  const genResponse = await fetch('http://localhost:3000/api/cards/generate-content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cardRequest)
  });

  const genData = await genResponse.json();

  if (!genResponse.ok) {
    console.error('✗ Error:', genData);
    return;
  }

  const card = genData.card;
  console.log('✓ Card generated!');
  console.log('  Card ID:', card.id);
  console.log('  Title:', card.content.title);
  console.log('  Layout:', card.layout);

  // Step 2: Check image generation status
  console.log('\nStep 2: Checking image generation status...');

  let attempts = 0;
  const maxAttempts = 12; // 60 seconds max

  while (attempts < maxAttempts) {
    const statusResponse = await fetch(`http://localhost:3000/api/images/${card.id}/status`);
    const statusData = await statusResponse.json();

    console.log(`\n  Attempt ${attempts + 1}:`);
    console.log('    Status:', statusData.status);
    console.log('    Provider:', statusData.provider || 'none');

    if (statusData.status === 'completed') {
      console.log('\n✓ Image generation completed!');
      console.log('  URL length:', statusData.url?.length || 0);
      console.log('  URL preview:', statusData.url?.substring(0, 100) + '...');
      console.log('  Metadata:', JSON.stringify(statusData.metadata, null, 2));

      if (statusData.metadata?.provider === 'gemini') {
        console.log('\n🎉 SUCCESS: Real Gemini 2.5 Flash Image generated!');
      } else if (statusData.metadata?.provider === 'placeholder') {
        console.log('\n⚠️  Fallback: Placeholder SVG used');
      }

      return statusData;
    } else if (statusData.status === 'failed') {
      console.log('\n✗ Image generation failed');
      console.log('  Error:', statusData.error);
      return statusData;
    } else if (statusData.status === 'generating') {
      console.log('    Still generating...');
    }

    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s
    attempts++;
  }

  console.log('\n⏱️  Timeout: Image generation took too long');
}

try {
  await testImageGeneration();
} catch (error) {
  console.error('\n✗ Error:', error.message);
}
