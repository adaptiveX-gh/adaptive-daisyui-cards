/**
 * Phase 3 Implementation Validation Script
 * Checks that all files exist and can be imported without errors
 */

import fs from 'fs';
import path from 'path';

const PHASE3_FILES = [
  // Services
  'api/services/StreamingService.js',
  'api/services/ConnectionStore.js',

  // Utilities
  'api/utils/sseFormatter.js',

  // Routes
  'api/routes/streaming.js',

  // Middleware
  'api/middleware/sseSetup.js',

  // Tests
  'tests/api/StreamingService.test.js',
  'tests/api/streaming-e2e.test.js',
  'tests/api/streaming-client.html',

  // Documentation
  'docs/SSE-STREAMING.md',
  'docs/SSE-CLIENT-GUIDE.md',
  'PHASE3-IMPLEMENTATION.md'
];

const UPDATED_FILES = [
  'api/services/ImageGenerationService.js',
  'api/server.js',
  'API-README.md',
  '.env.example'
];

console.log('Phase 3 Implementation Validation\n');
console.log('='.repeat(50));

let allValid = true;

// Check new files exist
console.log('\n1. Checking new files...\n');
for (const file of PHASE3_FILES) {
  const exists = fs.existsSync(file);
  const status = exists ? '✓' : '✗';
  console.log(`  ${status} ${file}`);
  if (!exists) allValid = false;
}

// Check updated files exist
console.log('\n2. Checking updated files...\n');
for (const file of UPDATED_FILES) {
  const exists = fs.existsSync(file);
  const status = exists ? '✓' : '✗';
  console.log(`  ${status} ${file}`);
  if (!exists) allValid = false;
}

// Try importing key modules
console.log('\n3. Checking imports...\n');

try {
  console.log('  Importing ConnectionStore...');
  const { ConnectionStore } = await import('./api/services/ConnectionStore.js');
  const store = new ConnectionStore();
  console.log('  ✓ ConnectionStore imported successfully');
} catch (error) {
  console.log('  ✗ ConnectionStore import failed:', error.message);
  allValid = false;
}

try {
  console.log('  Importing sseFormatter...');
  const formatter = await import('./api/utils/sseFormatter.js');
  console.log('  ✓ sseFormatter imported successfully');
} catch (error) {
  console.log('  ✗ sseFormatter import failed:', error.message);
  allValid = false;
}

try {
  console.log('  Importing StreamingService...');
  const { StreamingService } = await import('./api/services/StreamingService.js');
  const service = new StreamingService();
  console.log('  ✓ StreamingService imported successfully');
  service.shutdown(); // Cleanup
} catch (error) {
  console.log('  ✗ StreamingService import failed:', error.message);
  allValid = false;
}

try {
  console.log('  Importing ImageGenerationService (updated)...');
  const { ImageGenerationService } = await import('./api/services/ImageGenerationService.js');
  console.log('  ✓ ImageGenerationService imported successfully');
} catch (error) {
  console.log('  ✗ ImageGenerationService import failed:', error.message);
  allValid = false;
}

try {
  console.log('  Importing streaming routes...');
  const streamingRouter = await import('./api/routes/streaming.js');
  console.log('  ✓ streaming routes imported successfully');
} catch (error) {
  console.log('  ✗ streaming routes import failed:', error.message);
  allValid = false;
}

try {
  console.log('  Importing SSE middleware...');
  const middleware = await import('./api/middleware/sseSetup.js');
  console.log('  ✓ SSE middleware imported successfully');
} catch (error) {
  console.log('  ✗ SSE middleware import failed:', error.message);
  allValid = false;
}

// Count lines of code
console.log('\n4. Code Statistics...\n');

function countLines(file) {
  try {
    const content = fs.readFileSync(file, 'utf8');
    return content.split('\n').length;
  } catch {
    return 0;
  }
}

let totalNewLines = 0;
let totalTestLines = 0;
let totalDocLines = 0;

for (const file of PHASE3_FILES) {
  const lines = countLines(file);
  totalNewLines += lines;

  if (file.includes('test')) {
    totalTestLines += lines;
  } else if (file.includes('.md')) {
    totalDocLines += lines;
  }
}

console.log(`  Total new lines: ${totalNewLines}`);
console.log(`  Test lines: ${totalTestLines}`);
console.log(`  Documentation lines: ${totalDocLines}`);
console.log(`  Implementation lines: ${totalNewLines - totalTestLines - totalDocLines}`);

// Summary
console.log('\n' + '='.repeat(50));
if (allValid) {
  console.log('\n✓ Phase 3 Implementation Validation: PASSED\n');
  console.log('All files are present and imports work correctly.');
  console.log('\nNext steps:');
  console.log('1. Start the server: npm run api:dev');
  console.log('2. Open test client: http://localhost:3000/tests/api/streaming-client.html');
  console.log('3. Run unit tests: npm test tests/api/StreamingService.test.js');
  console.log('4. Run E2E tests: npm test tests/api/streaming-e2e.test.js');
} else {
  console.log('\n✗ Phase 3 Implementation Validation: FAILED\n');
  console.log('Some files are missing or imports failed.');
  process.exit(1);
}

console.log('\n' + '='.repeat(50) + '\n');
