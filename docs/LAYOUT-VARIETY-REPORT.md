# Layout Variety Verification Report

**Date**: 2025-10-24
**Task**: Verify LLM-generated cards use diverse layouts instead of defaulting to one layout

---

## Executive Summary

**Current Status**: ⚠️ **Issues Found**

1. ✅ **Smart Mode (LLM)**: Default fallback logic uses 6/7 layouts with good variety
2. ❌ **Fast Mode (Templates)**: Uses outdated layout names, NOT the standard 7 adaptive layouts
3. ⚠️ **Real LLM Testing**: Cannot verify actual LLM behavior without Gemini API key

---

## Findings

### 1. Available Adaptive Layouts

The system defines **7 standard adaptive layouts** in:
- `D:\Users\scale\Code\slideo\api\services\llm\VisualDesigner.js` (lines 34-42)
- `D:\Users\scale\Code\slideo\api\prompts\visual-designer\system-prompt.md`

Standard layouts:
1. `hero-layout` - Title slides, bold statements
2. `hero-layout.overlay` - Inspirational with background image
3. `split-layout` - Before/after, comparisons
4. `sidebar-layout` - Content with supporting image
5. `feature-layout` - Multiple equal items (3-6)
6. `dashboard-layout` - Data-heavy, multiple metrics
7. `masonry-layout` - Image galleries

---

### 2. Smart Mode (LLM-Powered) Analysis

**Architecture**: 3-stage pipeline
1. `PresentationDesigner` → Structure
2. `VisualDesigner` → Layout assignment
3. `Copywriter` → Copy generation

**VisualDesigner Layout Assignment**:

The LLM is prompted with:
- Detailed layout descriptions and use cases
- Content-based decision tree
- Best practices for variety
- Example patterns for 10-card presentations

**Fallback Logic** (`_getDefaultLayout()`, lines 268-296):

When LLM fails, uses heuristic-based defaults:

| Card Property | Assigned Layout |
|--------------|----------------|
| role: opening/closing | hero-layout |
| content_type: title/takeaway | hero-layout |
| content_type: comparison | split-layout |
| content_type: data | dashboard-layout |
| content_type: image | hero-layout.overlay |
| supporting_points >= 3 | feature-layout |
| default | sidebar-layout |

**Test Results** (`test-layout-defaults.js`):
- ✅ Uses 6/7 layouts (masonry excluded - specialized)
- ✅ Correct layout for card type
- ✅ Good variety in fallback logic

**Limitation**: Cannot test actual LLM behavior without API key

---

### 3. Fast Mode (Template-Based) Analysis

**Current State** (`ContentGenerator.js`):

Fast mode uses hardcoded content database with **OUTDATED** layout names:

```javascript
// Current (WRONG):
layout: 'hero-overlay'      // Should be: 'hero-layout.overlay'
layout: 'hero'              // Should be: 'hero-layout'
layout: 'split'             // Should be: 'split-layout'
layout: 'numbered-list'     // Should be: 'feature-layout'
layout: 'content-bullets'   // Should be: 'feature-layout'
layout: 'grid'              // Should be: 'dashboard-layout' or 'feature-layout'
```

**Test Results** (`test-fast-mode-layouts.js`):

Across 3 topics × 6 cards = 18 cards:
- hero-overlay: 3 cards (16.7%)
- split: 3 cards (16.7%)
- numbered-list: 3 cards (16.7%)
- content-bullets: 3 cards (16.7%)
- grid: 3 cards (16.7%)
- hero: 3 cards (16.7%)

**Issues**:
1. ❌ 0/7 standard adaptive layouts used
2. ❌ All 6 layouts are non-standard names
3. ❌ No variety WITHIN presentations (identical pattern for all 3 topics)
4. ⚠️ Limited variety ACROSS presentations (6 total layout types)

---

### 4. Layout Distribution Logging

**Added** to `D:\Users\scale\Code\slideo\api\routes\streaming.js` (lines 309-312):

```javascript
console.log('[ROUTE] Layout distribution:');
cards.forEach((card, i) => {
  console.log(`  Card ${i + 1}: ${card.layout} (type: ${card.type})`);
});
```

This will log layouts for every presentation generation.

---

## Recommendations

### Priority 1: Fix Fast Mode Layout Names

**Update** `D:\Users\scale\Code\slideo\api\services\ContentGenerator.js`:

```javascript
// BEFORE (lines 10, 100, 190):
layout: 'hero-overlay',

// AFTER:
layout: 'hero-layout.overlay',

// BEFORE (lines 85, 174, 264):
layout: 'hero',

// AFTER:
layout: 'hero-layout',

// BEFORE (lines 71, 162, 250):
layout: 'split',

// AFTER:
layout: 'split-layout',

// BEFORE (lines 19, 109, 199):
layout: 'numbered-list',

// AFTER:
layout: 'feature-layout',  // or 'sidebar-layout' if single column

// BEFORE (lines 56, 148, 238):
layout: 'content-bullets',

// AFTER:
layout: 'feature-layout',  // or 'sidebar-layout' depending on structure

// BEFORE (lines 32, 123, 214):
layout: 'grid',

// AFTER:
layout: 'feature-layout',  // for uniform items
// OR
layout: 'dashboard-layout',  // for data/metrics
```

### Priority 2: Add Layout Variety to Fast Mode

Currently all 3 topics use IDENTICAL layout patterns. Recommend:

```javascript
'AI in Product Discovery': {
  title: { layout: 'hero-layout.overlay', ... },
  objectives: { layout: 'sidebar-layout', ... },  // Changed from numbered-list
  process: { layout: 'feature-layout', ... },     // Changed from grid
  benefits: { layout: 'feature-layout', ... },    // Changed from content-bullets
  methodology: { layout: 'split-layout', ... },
  conclusion: { layout: 'hero-layout', ... }
},

'Digital Marketing Trends 2025': {
  title: { layout: 'hero-layout.overlay', ... },
  objectives: { layout: 'feature-layout', ... },  // More variety
  trends: { layout: 'dashboard-layout', ... },    // Better for data
  strategies: { layout: 'sidebar-layout', ... },  // Different from above
  channels: { layout: 'split-layout', ... },
  action: { layout: 'hero-layout', ... }
}
```

### Priority 3: Test Real LLM Layout Variety

To verify Smart Mode actually uses diverse layouts:

1. Set up Gemini API key:
   ```bash
   export GEMINI_API_KEY="your-key-here"
   ```

2. Run test:
   ```bash
   node test-layout-variety.js
   ```

3. Verify:
   - Do presentations use 4+ different layouts?
   - Are layouts matched to content type?
   - Is there variety between presentations?

### Priority 4: Add Layout Rotation Logic

If LLM doesn't naturally vary layouts, add logic to `VisualDesigner.assignLayouts()`:

```javascript
// Track recently used layouts
const recentLayouts = [];
const maxConsecutive = 2; // Don't use same layout >2 times in a row

// After LLM suggests layout:
if (recentLayouts.slice(-maxConsecutive).every(l => l === suggestedLayout)) {
  // Find alternative layout for this content type
  suggestedLayout = getAlternativeLayout(card.content_type, recentLayouts);
}
recentLayouts.push(suggestedLayout);
```

### Priority 5: Presentation-Type-Specific Layout Preferences

Add layout preferences based on presentation type:

```javascript
const layoutPreferences = {
  pitch: {
    preferred: ['hero-layout', 'hero-layout.overlay', 'split-layout'],
    avoid: ['masonry-layout', 'dashboard-layout']
  },
  education: {
    preferred: ['sidebar-layout', 'feature-layout', 'split-layout'],
    avoid: []
  },
  report: {
    preferred: ['dashboard-layout', 'feature-layout', 'sidebar-layout'],
    avoid: ['hero-layout.overlay']
  }
};
```

---

## Testing Checklist

- [x] Verify VisualDesigner has all 7 layouts defined
- [x] Test default fallback layout logic
- [x] Analyze Fast Mode layout usage
- [x] Add logging to streaming route
- [ ] Test Smart Mode with real API key
- [ ] Fix Fast Mode layout names
- [ ] Add variety to Fast Mode templates
- [ ] Verify UI renders all 7 layouts correctly

---

## Files Modified

1. `D:\Users\scale\Code\slideo\api\routes\streaming.js`
   - Added layout distribution logging (lines 309-312)

---

## Test Files Created

1. `D:\Users\scale\Code\slideo\test-layout-variety.js`
   - Tests Smart Mode with mock LLM (needs real API key)

2. `D:\Users\scale\Code\slideo\test-layout-defaults.js`
   - Tests default fallback logic ✅ PASSING

3. `D:\Users\scale\Code\slideo\test-fast-mode-layouts.js`
   - Tests Fast Mode layout distribution ⚠️ ISSUES FOUND

---

## Conclusion

**Layout Variety Status**:

| Mode | Uses Standard Layouts | Has Variety | Status |
|------|---------------------|-------------|---------|
| Smart (LLM) | ✅ Yes (fallback) | ⚠️ Untested (no API key) | Needs API test |
| Smart (Fallback) | ✅ Yes (6/7) | ✅ Good | Working |
| Fast (Templates) | ❌ No (0/7) | ⚠️ Limited | **NEEDS FIX** |

**Next Steps**:
1. **URGENT**: Fix Fast Mode layout names in ContentGenerator.js
2. **IMPORTANT**: Add layout variety to Fast Mode templates
3. **RECOMMENDED**: Test Smart Mode with real Gemini API key
4. **OPTIONAL**: Add layout rotation/preference logic to VisualDesigner

**Impact**: Fast Mode is currently broken - it uses non-existent layout classes that won't render correctly in the UI. Smart Mode fallback works but real LLM behavior is unknown.
