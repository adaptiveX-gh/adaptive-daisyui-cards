import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

console.log('Testing Gemini image generation...\n');

// Test different models and approaches
const modelsToTest = [
  'gemini-2.5-flash-exp',
  'gemini-2.0-flash-exp',
  'gemini-exp-1206',
  'gemini-2.0-flash-thinking-exp-01-21'
];

for (const modelName of modelsToTest) {
  console.log(`\n=== Testing ${modelName} ===`);

  try {
    const model = genAI.getGenerativeModel({ model: modelName });

    // Test 1: Simple image request
    console.log('Attempt 1: Direct image request...');
    const result = await model.generateContent('Generate an image of a sunset over mountains');
    const response = result.response;
    console.log('Response:', JSON.stringify(response, null, 2));

  } catch (error) {
    console.error(`✗ ${modelName} error:`, error.message);
  }
}

// Test 2: Check if we can request specific modalities
console.log('\n\n=== Testing with generation config ===');
try {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-exp',
    generationConfig: {
      temperature: 0.9,
    }
  });

  const result = await model.generateContent({
    contents: [{
      role: 'user',
      parts: [{
        text: 'Create a professional presentation image showing data visualization with charts'
      }]
    }]
  });

  console.log('Result:', JSON.stringify(result.response, null, 2));
} catch (error) {
  console.error('Error:', error.message);
}

// Test 3: Check the SDK version
console.log('\n\n=== Package Info ===');
import { readFile } from 'fs/promises';
const pkg = JSON.parse(await readFile('./package.json', 'utf-8'));
console.log('Current @google/generative-ai version:', pkg.dependencies['@google/generative-ai']);
