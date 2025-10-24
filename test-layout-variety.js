/**
 * Test Layout Variety
 *
 * Verifies that Smart Mode generates diverse layouts across cards
 * instead of defaulting to one layout type.
 */

import { LLMContentGenerator } from './api/services/LLMContentGenerator.js';

async function testLayoutVariety() {
  console.log('===== TESTING LAYOUT VARIETY IN SMART MODE =====\n');

  const generator = new LLMContentGenerator({ mockMode: true });

  const testCases = [
    {
      topic: 'AI in Product Discovery',
      cardCount: 8,
      presentationType: 'education',
      audience: 'product managers',
      tone: 'professional'
    },
    {
      topic: 'Q4 2025 Sales Performance',
      cardCount: 6,
      presentationType: 'report',
      audience: 'executives',
      tone: 'professional'
    },
    {
      topic: 'Series A Funding Pitch',
      cardCount: 10,
      presentationType: 'pitch',
      audience: 'investors',
      tone: 'inspirational'
    }
  ];

  const allLayouts = {
    'hero-layout': 0,
    'hero-layout.overlay': 0,
    'split-layout': 0,
    'sidebar-layout': 0,
    'feature-layout': 0,
    'dashboard-layout': 0,
    'masonry-layout': 0
  };

  for (const testCase of testCases) {
    console.log(`\n--- Test Case: ${testCase.topic} ---`);
    console.log(`Type: ${testCase.presentationType}, Cards: ${testCase.cardCount}\n`);

    try {
      const presentation = await generator.generatePresentation(testCase);

      console.log(`Generated ${presentation.cards.length} cards:\n`);

      const layoutCounts = {};

      presentation.cards.forEach((card, i) => {
        console.log(`  Card ${i + 1}: ${card.layout.padEnd(25)} (type: ${card.type}, role: ${card.role})`);

        layoutCounts[card.layout] = (layoutCounts[card.layout] || 0) + 1;
        allLayouts[card.layout] = (allLayouts[card.layout] || 0) + 1;
      });

      console.log('\nLayout distribution for this presentation:');
      Object.entries(layoutCounts)
        .sort((a, b) => b[1] - a[1])
        .forEach(([layout, count]) => {
          const percentage = ((count / presentation.cards.length) * 100).toFixed(1);
          console.log(`  ${layout.padEnd(25)} ${count.toString().padStart(2)} cards (${percentage}%)`);
        });

      const uniqueLayouts = Object.keys(layoutCounts).length;
      console.log(`\nUnique layouts used: ${uniqueLayouts}/${Object.keys(allLayouts).length}`);

      // Check for variety issues
      if (uniqueLayouts === 1) {
        console.log('⚠️  WARNING: All cards use the same layout!');
      } else if (uniqueLayouts === 2) {
        console.log('⚠️  WARNING: Only 2 layout types used - limited variety');
      } else if (uniqueLayouts >= 4) {
        console.log('✅ Good variety - using multiple layout types');
      } else {
        console.log('⚠️  Moderate variety - could use more diverse layouts');
      }

      // Check for overuse of one layout
      const maxUsage = Math.max(...Object.values(layoutCounts));
      const maxPercentage = (maxUsage / presentation.cards.length) * 100;
      if (maxPercentage > 60) {
        const dominantLayout = Object.entries(layoutCounts).find(([_, count]) => count === maxUsage)[0];
        console.log(`⚠️  WARNING: "${dominantLayout}" used in ${maxPercentage.toFixed(1)}% of cards (overused)`);
      }

    } catch (error) {
      console.error(`✗ Test failed: ${error.message}`);
      console.error(error.stack);
    }
  }

  console.log('\n\n===== OVERALL SUMMARY =====\n');
  console.log('Layout usage across all test presentations:\n');

  const totalCards = Object.values(allLayouts).reduce((sum, count) => sum + count, 0);

  Object.entries(allLayouts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([layout, count]) => {
      const percentage = totalCards > 0 ? ((count / totalCards) * 100).toFixed(1) : '0.0';
      const bar = '█'.repeat(Math.round(count / 2));
      console.log(`  ${layout.padEnd(25)} ${count.toString().padStart(2)} cards (${percentage.padStart(5)}%) ${bar}`);
    });

  console.log(`\nTotal cards generated: ${totalCards}`);

  const unusedLayouts = Object.entries(allLayouts)
    .filter(([_, count]) => count === 0)
    .map(([layout]) => layout);

  if (unusedLayouts.length > 0) {
    console.log('\n⚠️  Layouts that were NEVER used:');
    unusedLayouts.forEach(layout => console.log(`  - ${layout}`));
  } else {
    console.log('\n✅ All layouts were used at least once');
  }

  const layoutsUsed = Object.values(allLayouts).filter(count => count > 0).length;
  console.log(`\nLayouts used: ${layoutsUsed}/${Object.keys(allLayouts).length}`);

  if (layoutsUsed === Object.keys(allLayouts).length) {
    console.log('✅ EXCELLENT: Full layout diversity');
  } else if (layoutsUsed >= 5) {
    console.log('✅ GOOD: Most layouts used');
  } else if (layoutsUsed >= 3) {
    console.log('⚠️  MODERATE: Some layouts never used');
  } else {
    console.log('❌ POOR: Very limited layout diversity');
  }
}

// Run test
testLayoutVariety().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
