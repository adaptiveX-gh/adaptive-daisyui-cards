/**
 * Test Fast Mode Layout Distribution
 *
 * Checks what layouts are used in the hardcoded content database (fast mode)
 */

import { ContentGenerator } from './api/services/ContentGenerator.js';

console.log('===== FAST MODE LAYOUT DISTRIBUTION =====\n');

const gen = new ContentGenerator();
const topics = gen.getAvailableTopics();

const allLayoutCounts = {
  'hero-layout': 0,
  'hero-layout.overlay': 0,
  'hero-overlay': 0, // Might be using old naming
  'split-layout': 0,
  'split': 0,
  'sidebar-layout': 0,
  'feature-layout': 0,
  'dashboard-layout': 0,
  'masonry-layout': 0,
  'numbered-list': 0,
  'content-bullets': 0,
  'grid': 0,
  'hero': 0
};

console.log('Available topics:', topics.length);
topics.forEach(topic => console.log(`  - ${topic}`));
console.log();

topics.forEach(topic => {
  console.log(`\n--- ${topic} ---`);

  const pres = gen.generatePresentation({ topic, cardCount: 10 });

  console.log(`Generated ${pres.cards.length} cards:\n`);

  pres.cards.forEach((card, i) => {
    console.log(`  Card ${(i + 1).toString().padStart(2)}: ${card.layout.padEnd(25)} (type: ${card.type})`);
    allLayoutCounts[card.layout] = (allLayoutCounts[card.layout] || 0) + 1;
  });
});

console.log('\n\n===== OVERALL LAYOUT USAGE =====\n');

const sortedLayouts = Object.entries(allLayoutCounts)
  .filter(([_, count]) => count > 0)
  .sort((a, b) => b[1] - a[1]);

sortedLayouts.forEach(([layout, count]) => {
  const bar = '█'.repeat(Math.ceil(count / 2));
  console.log(`  ${layout.padEnd(25)} ${count.toString().padStart(2)} cards  ${bar}`);
});

console.log('\n===== ANALYSIS =====\n');

const totalLayouts = sortedLayouts.length;
const availableLayouts = ['hero-layout', 'hero-layout.overlay', 'split-layout', 'sidebar-layout', 'feature-layout', 'dashboard-layout', 'masonry-layout'];

console.log(`Layouts used in fast mode: ${totalLayouts}`);
console.log(`Standard adaptive layouts: ${availableLayouts.length}\n`);

const nonStandardLayouts = sortedLayouts
  .map(([layout]) => layout)
  .filter(layout => !availableLayouts.includes(layout));

if (nonStandardLayouts.length > 0) {
  console.log('⚠️  NON-STANDARD LAYOUTS DETECTED:');
  nonStandardLayouts.forEach(layout => {
    console.log(`  - ${layout} (${allLayoutCounts[layout]} uses)`);
  });
  console.log('\nThese layouts are from the old template system and should be');
  console.log('migrated to use the 7 standard adaptive layouts:\n');
  console.log('Mapping suggestions:');
  console.log('  - hero-overlay → hero-layout.overlay');
  console.log('  - hero → hero-layout');
  console.log('  - split → split-layout');
  console.log('  - numbered-list → feature-layout or sidebar-layout');
  console.log('  - content-bullets → feature-layout or sidebar-layout');
  console.log('  - grid → feature-layout or dashboard-layout');
  console.log();
}

const standardLayoutsUsed = sortedLayouts
  .filter(([layout]) => availableLayouts.includes(layout))
  .length;

if (standardLayoutsUsed === 0) {
  console.log('❌ CRITICAL: Fast mode uses NO standard adaptive layouts!');
  console.log('   ContentGenerator.js needs to be updated to use:');
  availableLayouts.forEach(layout => console.log(`     - ${layout}`));
} else if (standardLayoutsUsed < 4) {
  console.log('⚠️  Fast mode uses limited standard layouts');
} else {
  console.log('✅ Fast mode uses diverse standard layouts');
}
