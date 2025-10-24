import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';
import { writeFile } from 'fs/promises';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

console.log('Testing Gemini 2.5 Flash Image generation...\n');

try {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image' });

  console.log('Generating image: "A professional presentation slide background with abstract geometric shapes"');

  const result = await model.generateContent(
    'A professional presentation slide background with abstract geometric shapes in blue tones'
  );

  const response = result.response;
  console.log('\nResponse received!');
  console.log('Candidates:', response.candidates?.length);

  // Check for image in response
  if (response.candidates && response.candidates.length > 0) {
    const parts = response.candidates[0].content.parts;
    console.log('Parts in response:', parts?.length);

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      console.log(`\nPart ${i}:`, Object.keys(part));

      if (part.inlineData) {
        console.log('✓ Found image data!');
        console.log('  MIME Type:', part.inlineData.mimeType);
        console.log('  Data length:', part.inlineData.data?.length || 0);

        // Save the image
        const imageData = Buffer.from(part.inlineData.data, 'base64');
        await writeFile('test-gemini-generated.png', imageData);
        console.log('  Saved to: test-gemini-generated.png');

        // Also create data URL for inline use
        const dataUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        console.log('  Data URL preview:', dataUrl.substring(0, 100) + '...');
      }

      if (part.text) {
        console.log('  Text:', part.text);
      }
    }
  }

  console.log('\n✓ SUCCESS: Gemini 2.5 Flash Image is working!');

} catch (error) {
  console.error('✗ Error:', error.message);
  if (error.response) {
    console.error('Response data:', error.response.data);
  }
}
