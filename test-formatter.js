/**
 * Test the formatSkeletonMessage function
 */

import { formatSkeletonMessage } from './api/utils/sseFormatter.js';

const testCards = [
  { id: 'card-1', layout: 'hero', type: 'title' },
  { id: 'card-2', layout: 'split', type: 'content' },
  { id: 'card-3', layout: 'sidebar', type: 'content' }
];

const message = formatSkeletonMessage('test-client-123', testCards, 1);

console.log('=== FORMATTED SKELETON MESSAGE ===');
console.log(message);
console.log('');
console.log('=== LENGTH ===');
console.log(message.length, 'bytes');
console.log('');
console.log('=== PARSED ===');

// Try to parse the data line
const dataMatch = message.match(/data: (.+)/);
if (dataMatch) {
  const data = JSON.parse(dataMatch[1]);
  console.log(JSON.stringify(data, null, 2));
  console.log('');
  console.log('Cards in data:', data.cards?.length || 0);
} else {
  console.log('Could not extract data line!');
}
