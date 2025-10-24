/**
 * Test Layout Defaults
 *
 * Tests the default layout selection logic in VisualDesigner._getDefaultLayout()
 * to verify that diverse layouts are assigned based on card properties.
 */

import { VisualDesigner } from './api/services/llm/VisualDesigner.js';

function testDefaultLayoutLogic() {
  console.log('===== TESTING DEFAULT LAYOUT SELECTION LOGIC =====\n');

  const visualDesigner = new VisualDesigner({
    generate: async () => 'mock',
    _extractJSON: () => null
  });

  // Test various card scenarios
  const testCards = [
    {
      role: 'opening',
      content_type: 'title',
      key_message: 'Presentation Title',
      supporting_points: [],
      expectedLayout: 'hero-layout',
      description: 'Opening title card'
    },
    {
      role: 'closing',
      content_type: 'takeaway',
      key_message: 'Thank you',
      supporting_points: [],
      expectedLayout: 'hero-layout',
      description: 'Closing card'
    },
    {
      role: 'body',
      content_type: 'comparison',
      key_message: 'Before vs After',
      supporting_points: ['Before state', 'After state'],
      expectedLayout: 'split-layout',
      description: 'Comparison card'
    },
    {
      role: 'body',
      content_type: 'data',
      key_message: 'Q4 Metrics',
      supporting_points: ['Revenue: $1M', 'Growth: 50%'],
      expectedLayout: 'dashboard-layout',
      description: 'Data/metrics card'
    },
    {
      role: 'body',
      content_type: 'image',
      key_message: 'Product Screenshot',
      supporting_points: [],
      expectedLayout: 'hero-layout.overlay',
      description: 'Image card'
    },
    {
      role: 'body',
      content_type: 'concept',
      key_message: 'Key Concept',
      supporting_points: ['Point 1', 'Point 2', 'Point 3'],
      expectedLayout: 'feature-layout',
      description: 'Multi-point concept (3+ points)'
    },
    {
      role: 'body',
      content_type: 'concept',
      key_message: 'Simple Concept',
      supporting_points: ['One point'],
      expectedLayout: 'sidebar-layout',
      description: 'Simple concept (default fallback)'
    },
    {
      role: 'transition',
      content_type: 'title',
      key_message: 'Section 2',
      supporting_points: [],
      expectedLayout: 'hero-layout',
      description: 'Transition/section break'
    }
  ];

  const layoutCounts = {
    'hero-layout': 0,
    'hero-layout.overlay': 0,
    'split-layout': 0,
    'sidebar-layout': 0,
    'feature-layout': 0,
    'dashboard-layout': 0,
    'masonry-layout': 0
  };

  console.log('Testing default layout selection:\n');

  testCards.forEach((card, i) => {
    const assignedLayout = visualDesigner._getDefaultLayout(card);
    const isCorrect = assignedLayout === card.expectedLayout;
    layoutCounts[assignedLayout]++;

    console.log(`Test ${i + 1}: ${card.description}`);
    console.log(`  Role: ${card.role}, Type: ${card.content_type}`);
    console.log(`  Supporting points: ${card.supporting_points.length}`);
    console.log(`  Expected: ${card.expectedLayout}`);
    console.log(`  Assigned: ${assignedLayout} ${isCorrect ? '✅' : '❌'}`);
    console.log();
  });

  console.log('\n===== LAYOUT DISTRIBUTION IN DEFAULT LOGIC =====\n');

  Object.entries(layoutCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([layout, count]) => {
      const bar = '█'.repeat(count);
      console.log(`  ${layout.padEnd(25)} ${count.toString().padStart(2)} cards  ${bar}`);
    });

  const layoutsUsed = Object.values(layoutCounts).filter(c => c > 0).length;
  const totalLayouts = Object.keys(layoutCounts).length;

  console.log(`\nLayouts used: ${layoutsUsed}/${totalLayouts}`);

  const unusedLayouts = Object.entries(layoutCounts)
    .filter(([_, count]) => count === 0)
    .map(([layout]) => layout);

  if (unusedLayouts.length > 0) {
    console.log('\nLayouts never assigned by default logic:');
    unusedLayouts.forEach(layout => console.log(`  - ${layout}`));
  }

  console.log('\n===== RECOMMENDATIONS =====\n');

  if (layoutsUsed < 5) {
    console.log('⚠️  DEFAULT FALLBACK LOGIC USES LIMITED LAYOUTS');
    console.log('The _getDefaultLayout() method should be updated to use more diverse layouts.');
    console.log('This ensures variety even when LLM layout assignment fails.\n');
  } else {
    console.log('✅ Default fallback logic provides good variety');
  }

  if (unusedLayouts.includes('masonry-layout')) {
    console.log('ℹ️  masonry-layout is only used via LLM assignment (not in defaults)');
    console.log('This is acceptable as masonry is specialized for image galleries.\n');
  }

  console.log('Key findings:');
  console.log('1. Default layout logic acts as fallback when LLM fails');
  console.log('2. Real layout diversity depends on VisualDesigner LLM prompts');
  console.log('3. To test actual LLM layout variety, need real Gemini API key\n');
}

// Run test
testDefaultLayoutLogic();
