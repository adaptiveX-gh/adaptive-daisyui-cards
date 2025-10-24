import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

console.log('Testing Gemini API connection...\n');

// Test 1: List available models
try {
  console.log('Available models:');
  const models = await genAI.listModels();
  for await (const model of models) {
    console.log(`- ${model.name}`);
    console.log(`  Display Name: ${model.displayName}`);
    const methods = model.supportedGenerationMethods || [];
    console.log(`  Supported Methods: ${methods.join(', ')}`);
    console.log('');
  }
} catch (error) {
  console.error('Error listing models:', error.message);
}

// Test 2: Try text generation with gemini-2.0-flash-exp
try {
  console.log('\nTesting gemini-2.0-flash-exp...');
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  const result = await model.generateContent('Say hello');
  console.log('✓ Text generation works');
  console.log('Response:', result.response.text());
} catch (error) {
  console.error('✗ Error:', error.message);
}

// Test 3: Check if image generation is supported
try {
  console.log('\nTesting image generation capabilities...');
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  const result = await model.generateContent({
    contents: [{
      parts: [{
        text: 'Generate an image of a sunset'
      }]
    }],
    generationConfig: {
      responseModalities: ['image']
    }
  });
  console.log('✓ Image generation works');
  console.log('Result:', JSON.stringify(result, null, 2));
} catch (error) {
  console.error('✗ Image generation error:', error.message);
}
