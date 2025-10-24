import 'dotenv/config';

console.log('Testing full API image generation flow...\n');

// Test single card generation with image
const cardRequest = {
  topic: 'AI in Product Discovery',
  layoutType: 'hero',
  tone: 'professional',
  contentSections: ['title', 'body'],
  style: 'professional-presentation',
  generateImage: true,
  imageProvider: 'gemini',
  theme: {
    name: 'professional',
    colors: {
      primary: '#3b82f6',
      secondary: '#1e40af',
      accent: '#60a5fa',
      background: '#f8fafc',
      text: '#1e293b'
    }
  }
};

try {
  console.log('Sending card generation request...');

  const response = await fetch('http://localhost:3000/api/cards/generate-content', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(cardRequest)
  });

  const card = await response.json();

  if (!response.ok) {
    console.error('\n✗ Error response:', JSON.stringify(card, null, 2));
    throw new Error(`HTTP ${response.status}: ${card.message || response.statusText}`);
  }

  console.log('\n✓ Card generated successfully!');
  console.log('\nCard details:');
  console.log('  ID:', card.id);
  console.log('  Title:', card.title);
  console.log('  Layout:', card.layout);

  if (card.image) {
    console.log('\n✓ Image generated!');
    console.log('  Type:', card.image.type);
    console.log('  Provider:', card.image.metadata?.provider || 'unknown');
    console.log('  URL length:', card.image.url.length);
    console.log('  URL preview:', card.image.url.substring(0, 100) + '...');

    if (card.image.metadata?.provider === 'gemini') {
      console.log('\n🎉 SUCCESS: Real Gemini 2.5 Flash Image generation working!');
    } else if (card.image.metadata?.provider === 'placeholder') {
      console.log('\n⚠️  Used placeholder fallback (Gemini may have failed)');
    }
  } else {
    console.log('\n✗ No image in response');
  }

  console.log('\nFull response:', JSON.stringify(card, null, 2).substring(0, 500) + '...');

} catch (error) {
  console.error('\n✗ Error:', error.message);
  if (error.cause) {
    console.error('Cause:', error.cause);
  }
}
