# Rendering Parity Analysis
## Static vs Dynamic Rendering - Discrepancies and Recommendations

**Date:** October 26, 2025
**Related Documents:**
- `static-vs-dynamic-rendering.md` - Original analysis
- `LAYOUT_STRUCTURE_TEST_REPORT.md` - Test execution report

---

## Executive Summary

Based on the comprehensive test suite of 102 tests covering all 17 layouts, we have established a baseline for what the **expected structure** should be. The tests verify that when properly implemented, the dynamic rendering system should create DOM structures that match static templates.

### Current State

**Test Results:** All 102 tests PASSED
**What This Means:** The tests define the expected structure correctly, but they test MOCK implementations, not the actual dynamic rendering code in `streaming-progressive.html`.

### Key Insight

The tests passing does NOT mean the dynamic rendering currently matches static templates. The tests define what SHOULD exist. The next step is to verify that `streaming-progressive.html` actually creates these structures.

---

## Known Discrepancies from Original Analysis

Based on the original `static-vs-dynamic-rendering.md` document, these discrepancies were identified:

### 1. Layout Class Placement

**Problem:** Dynamic rendering applies `card-{layout}` class to outer card element instead of layout class to scrollable container.

**Static (Correct):**
```html
<div class="layout-card">
  <div class="card-content-scrollable three-columns-headings-layout">
    <!-- Content here -->
  </div>
</div>
```

**Dynamic (Incorrect):**
```html
<div class="layout-card card-three-columns-headings-layout">
  <div class="card-content-scrollable">
    <!-- Content here -->
  </div>
</div>
```

**Impact:** CSS selectors don't match, layout-specific styles don't apply.

**Fix Required:** Move layout class from outer card to `.card-content-scrollable`.

**Test Coverage:** ✓ Tests verify correct placement

---

### 2. Missing Wrapper Elements

**Problem:** Dynamic rendering doesn't create structural wrapper divs.

**Example - Three-Columns-Headings:**

**Static (Correct):**
```html
<div class="card-content-scrollable three-columns-headings-layout">
  <div class="three-columns-header">
    <h2>Main Title</h2>
    <p>Subtitle</p>
  </div>
  <div class="three-columns-container">
    <div class="column">
      <h3 class="column-heading">Column 1</h3>
      <div class="column-content">...</div>
    </div>
    <div class="column">
      <h3 class="column-heading">Column 2</h3>
      <div class="column-content">...</div>
    </div>
    <div class="column">
      <h3 class="column-heading">Column 3</h3>
      <div class="column-content">...</div>
    </div>
  </div>
</div>
```

**Dynamic (Incorrect):**
```html
<div class="card-content-scrollable">
  <div class="text-3xl font-bold">Main Title</div>
  <p>Subtitle</p>
  <ul class="list-disc">
    <li>Column 1 heading</li>
    <li>Column 1 item 1</li>
    <li>Column 1 item 2</li>
    <li>Column 2 heading</li>
    <li>Column 2 item 1</li>
    <!-- etc. -->
  </ul>
</div>
```

**Impact:** No grid layout, columns stack vertically, no column headings styled correctly.

**Fix Required:** Generate wrapper divs in `renderCardContent()` function based on layout type.

**Test Coverage:** ✓ Tests verify all wrappers exist

---

### 3. Bullet List Styling

**Problem:** Dynamic rendering uses `list-disc` class on all bullet lists, but title-bullets layouts should use custom styling.

**Static (Correct):**
```html
<div class="bullets-container">
  <ul><!-- NO list-disc class -->
    <li>Item 1</li>
    <li>Item 2</li>
  </ul>
</div>
```

**CSS:**
```css
.title-bullets-layout .bullets-container ul {
  list-style: none;
}

.title-bullets-layout .bullets-container li::before {
  content: '•';
  color: hsl(var(--p));
  margin-right: 0.5rem;
}
```

**Dynamic (Incorrect):**
```html
<ul class="list-disc list-inside">
  <li>Item 1</li>
  <li>Item 2</li>
</ul>
```

**Impact:** Wrong bullet style (black discs instead of colored custom bullets).

**Fix Required:** Remove `list-disc` class for title-bullets and title-bullets-image layouts.

**Test Coverage:** ✓ Tests verify NO `list-disc` class

---

### 4. Image Placement

**Problem:** Dynamic rendering always prepends images to card body, regardless of layout.

**Static Behavior:**
- **Sidebar:** Image in `.sidebar-image` (left, 300px width)
- **Image-Text:** Image in `.image-section` (left, 40%)
- **Text-Image:** Image in `.image-section` (right, 40%)
- **Title-Bullets-Image:** Image in `.image-section` inside `.content-container`

**Dynamic Behavior:**
- All layouts: Image prepended to card body (full-width on top)

**Impact:** Layouts don't achieve side-by-side image/text arrangement.

**Fix Required:** Create layout-specific image containers and place images accordingly.

**Test Coverage:** ✓ Tests verify correct image placement patterns

---

### 5. Semantic HTML Elements

**Problem:** Dynamic rendering uses generic divs instead of semantic headings.

**Static (Correct):**
```html
<h2 class="adaptive-text-3xl">Section Title</h2>
<h3 class="column-heading">Column Heading</h3>
<ul>
  <li>Item</li>
</ul>
```

**Dynamic (Incorrect):**
```html
<div class="text-3xl font-bold">Section Title</div>
<div>Column Heading</div>
<ul class="list-disc">
  <li>Item</li>
</ul>
```

**Impact:** Worse SEO, accessibility issues, missing semantic styling.

**Fix Required:** Use proper HTML elements in `enrichContent()` function.

**Test Coverage:** ✓ Tests verify semantic HTML usage

---

### 6. Content Routing

**Problem:** Dynamic rendering doesn't route content to layout-specific containers.

**Example - Title-Bullets-Image:**

**Static (Correct):**
```html
<div class="title-bullets-header">
  <h2>Title</h2>
  <p>Subtitle</p>
</div>
<div class="content-container">
  <div class="bullets-section">
    <ul>
      <li>Bullet 1</li>
      <li>Bullet 2</li>
    </ul>
  </div>
  <div class="image-section">
    <img src="..." alt="...">
  </div>
</div>
```

**Dynamic (Incorrect):**
```html
<div class="text-3xl">Title</div>
<p>Subtitle</p>
<img src="..." alt="..."><!-- Image prepended -->
<ul class="list-disc">
  <li>Bullet 1</li>
  <li>Bullet 2</li>
</ul>
```

**Impact:** Content not organized correctly, CSS selectors don't match.

**Fix Required:** Route title to header, bullets to bullets-section, image to image-section.

**Test Coverage:** ✓ Tests verify content routing

---

## Layout-by-Layout Discrepancy Matrix

| Layout | Class Placement | Wrappers | Bullets | Images | Semantic HTML | Priority |
|--------|----------------|----------|---------|---------|---------------|----------|
| Hero | ⚠️ | ⚠️ | N/A | ✓ | ⚠️ | Medium |
| Hero Overlay | ⚠️ | ✓ | N/A | ✓ | ⚠️ | Low |
| Sidebar | ⚠️ | ❌ | N/A | ❌ | N/A | High |
| Image-Text | ⚠️ | ❌ | N/A | ❌ | N/A | High |
| Text-Image | ⚠️ | ❌ | N/A | ❌ | N/A | High |
| Two-Columns | ⚠️ | ❌ | N/A | N/A | N/A | High |
| Two-Columns-Headings | ⚠️ | ❌ | N/A | N/A | ⚠️ | High |
| Three-Columns | ⚠️ | ❌ | N/A | N/A | N/A | High |
| Three-Columns-Headings | ⚠️ | ❌ | N/A | N/A | ⚠️ | High |
| Four-Columns | ⚠️ | ❌ | N/A | N/A | N/A | High |
| Title-Bullets | ⚠️ | ⚠️ | ❌ | N/A | ⚠️ | Medium |
| Title-Bullets-Image | ⚠️ | ❌ | ❌ | ❌ | N/A | High |
| Feature | ⚠️ | ❌ | N/A | N/A | N/A | High |
| Masonry | ⚠️ | ❌ | N/A | N/A | N/A | High |
| Dashboard | ⚠️ | ❌ | N/A | N/A | N/A | High |
| Split | ⚠️ | ❌ | N/A | N/A | N/A | High |
| Objectives | ⚠️ | ❌ | N/A | N/A | ⚠️ | High |

**Legend:**
- ✓ = Likely correct (based on analysis)
- ⚠️ = Partial issue (needs verification)
- ❌ = Known issue (requires fix)
- N/A = Not applicable for this layout

**Priority:**
- **High:** Critical layout breakage (13 layouts)
- **Medium:** Minor issues (2 layouts)
- **Low:** Mostly working (2 layouts)

---

## Recommended Fix Implementation Order

### Phase 1: Infrastructure (1-2 days)

**Goal:** Establish the foundation for layout-specific rendering.

1. **Create Layout Metadata System**
   - Define layout structure requirements in a configuration object
   - Specify required wrappers, classes, and element types per layout
   - Example:
   ```javascript
   const LAYOUT_STRUCTURES = {
     'three-columns-headings': {
       layoutClass: 'three-columns-headings-layout',
       wrappers: [
         { class: 'three-columns-header', contains: 'title' },
         { class: 'three-columns-container', contains: 'columns' }
       ],
       columns: {
         count: 3,
         class: 'column',
         headingTag: 'h3',
         headingClass: 'column-heading',
         contentClass: 'column-content'
       }
     }
   };
   ```

2. **Refactor renderCardContent() Function**
   - Split into layout-specific rendering functions
   - Create factory pattern for wrapper generation
   - Add layout detection logic

**Tests to Run:** All 102 structure tests should still pass.

---

### Phase 2: Class Placement Fix (1 day)

**Goal:** Fix layout class placement for all layouts.

**Change Required:** In `streaming-progressive.html`, modify card creation:

```javascript
// BEFORE (incorrect)
cardEl.classList.add(`card-${layout}`);

// AFTER (correct)
scrollableContainer.classList.add(layout); // Remove 'card-' prefix
```

**Files to Modify:**
- `tests/api/streaming-progressive.html` - Line ~1480, 1491, 1507, 1523, etc.

**Verification:**
- Run test: "should apply layout class to scrollable container"
- Visual check: CSS container queries should activate
- Test responsive behavior at different widths

**Impact:** HIGH - Enables all layout-specific CSS to work.

---

### Phase 3: Wrapper Generation (3-4 days)

**Goal:** Generate all required wrapper elements for each layout.

**Implementation Strategy:**

1. **Create Wrapper Generator Functions**
   ```javascript
   function createLayoutWrappers(layout, scrollableContainer) {
     const structure = LAYOUT_STRUCTURES[layout];
     if (!structure) return scrollableContainer; // Fallback

     const wrappers = {};
     structure.wrappers.forEach(wrapperDef => {
       const wrapper = document.createElement('div');
       wrapper.className = wrapperDef.class;
       wrappers[wrapperDef.contains] = wrapper;
     });

     return wrappers;
   }
   ```

2. **Modify Content Rendering**
   - Route title to header wrapper
   - Route bullets to appropriate container
   - Route columns to column container with individual column divs

**Priority Order:**
1. Three-columns-headings (most complex, good test case)
2. Two-columns, two-columns-headings
3. Four-columns
4. Title-bullets, title-bullets-image
5. Sidebar, image-text, text-image
6. Feature, masonry, dashboard, split, objectives

**Tests to Run:** All wrapper-related tests (68 tests).

---

### Phase 4: Bullet Styling Fix (1 day)

**Goal:** Remove `list-disc` class for layouts with custom bullet styling.

**Change Required:**
```javascript
function createBulletList(items, layout) {
  const ul = document.createElement('ul');

  // Only add list-disc for layouts that use default bullets
  const customBulletLayouts = [
    'title-bullets-layout',
    'title-bullets-image-layout'
  ];

  if (!customBulletLayouts.includes(layout)) {
    ul.classList.add('list-disc', 'list-inside');
  }

  items.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    ul.appendChild(li);
  });

  return ul;
}
```

**Tests to Run:** Bullet styling tests (2 tests).

**Verification:**
- Visual check: Title-bullets should show colored custom bullets
- Other layouts should show default discs

---

### Phase 5: Image Placement Fix (2-3 days)

**Goal:** Place images in layout-specific containers.

**Implementation Strategy:**

1. **Create Image Placement Router**
   ```javascript
   function placeImage(imageUrl, layout, scrollableContainer) {
     const placement = IMAGE_PLACEMENTS[layout];

     switch (placement.container) {
       case 'hero-image':
         return createHeroImage(imageUrl, scrollableContainer);
       case 'sidebar-image':
         return createSidebarImage(imageUrl, scrollableContainer);
       case 'image-section':
         return createImageSection(imageUrl, placement.position);
       default:
         return createDefaultImage(imageUrl);
     }
   }
   ```

2. **Position-Aware Image Creation**
   - Sidebar: 300px width, left position
   - Image-text: 40% width, before text-section
   - Text-image: 40% width, after text-section
   - Title-bullets-image: Inside content-container

**Tests to Run:** Image placement tests (5 tests).

**Priority Layouts:**
1. Sidebar (different sizing)
2. Image-text, text-image (different ordering)
3. Title-bullets-image (nested container)

---

### Phase 6: Semantic HTML Fix (1-2 days)

**Goal:** Use proper HTML elements instead of generic divs.

**Change Required:** Modify `enrichContent()` function:

```javascript
function enrichContent(element, section, content, layout) {
  let enrichedElement;

  switch (section) {
    case 'title':
      // Hero uses h1, others use h2
      const titleTag = layout.startsWith('hero') ? 'h1' : 'h2';
      enrichedElement = document.createElement(titleTag);
      enrichedElement.className = getTitleClass(layout);
      break;

    case 'column-heading':
      enrichedElement = document.createElement('h3');
      enrichedElement.className = 'column-heading';
      break;

    case 'subtitle':
      enrichedElement = document.createElement('p');
      enrichedElement.className = getSubtitleClass(layout);
      break;

    default:
      enrichedElement = document.createElement('div');
  }

  enrichedElement.textContent = content;
  element.replaceWith(enrichedElement);
}
```

**Tests to Run:** Semantic HTML tests (6 tests).

**Verification:**
- Check heading hierarchy (h1 > h2 > h3)
- Validate with accessibility tools (axe-core)

---

### Phase 7: Content Routing Fix (2-3 days)

**Goal:** Route content to correct containers based on layout.

**Implementation Strategy:**

1. **Create Content Router**
   ```javascript
   function routeContent(contentType, content, layout, containers) {
     const route = CONTENT_ROUTES[layout][contentType];

     if (route.wrapper) {
       const wrapper = containers[route.wrapper];
       const element = createContentElement(contentType, content, route);
       wrapper.appendChild(element);
     }
   }
   ```

2. **Define Routing Rules**
   ```javascript
   const CONTENT_ROUTES = {
     'three-columns-headings': {
       title: { wrapper: 'header', tag: 'h2' },
       subtitle: { wrapper: 'header', tag: 'p' },
       columns: { wrapper: 'container', strategy: 'split-by-count' }
     },
     'title-bullets-image': {
       title: { wrapper: 'header', tag: 'h2' },
       bullets: { wrapper: 'bullets-section' },
       image: { wrapper: 'image-section' }
     }
   };
   ```

**Tests to Run:** Content routing tests (3 tests).

---

## Testing Strategy

### Level 1: Unit Tests (Current)

**Status:** ✓ Complete - 102 tests passing

**Coverage:**
- DOM structure expectations
- CSS class placement
- Element hierarchy
- Semantic HTML

**Limitation:** Tests mock implementations, not actual rendering.

---

### Level 2: Integration Tests (Next Priority)

**Goal:** Test actual dynamic rendering with SSE streaming.

**Implementation:**
```javascript
// tests/integration/dynamic-rendering.test.js
describe('Dynamic Rendering Integration', () => {
  it('should create correct structure for three-columns-headings', async () => {
    // 1. Start mock SSE server
    const server = startMockSSE();

    // 2. Load streaming-progressive.html in browser
    await page.goto('http://localhost:5173/tests/api/streaming-progressive.html');

    // 3. Send card data via SSE
    server.sendCard({
      layout: 'three-columns-headings',
      content: { ... }
    });

    // 4. Wait for card to render
    await page.waitForSelector('.three-columns-headings-layout');

    // 5. Verify DOM structure
    const structure = await page.evaluate(() => {
      const card = document.querySelector('.three-columns-headings-layout');
      return {
        hasHeader: !!card.querySelector('.three-columns-header'),
        hasContainer: !!card.querySelector('.three-columns-container'),
        columnCount: card.querySelectorAll('.column').length,
        hasHeadings: card.querySelectorAll('h3.column-heading').length === 3
      };
    });

    expect(structure.hasHeader).toBe(true);
    expect(structure.hasContainer).toBe(true);
    expect(structure.columnCount).toBe(3);
    expect(structure.hasHeadings).toBe(true);
  });
});
```

**Tools:**
- Playwright for browser automation
- Mock SSE server (already exists in `tests/api/mock-sse-server.js`)
- DOM query and assertion

**Priority:** HIGH - This validates actual implementation.

---

### Level 3: Visual Regression Tests

**Goal:** Ensure dynamic rendering looks identical to static.

**Implementation:**
```javascript
// tests/visual/layout-parity.test.js
test('three-columns-headings: static vs dynamic visual parity', async ({ page }) => {
  // 1. Screenshot static template
  await page.goto('/index.html#three-columns-headings-layout');
  const staticShot = await page.screenshot();

  // 2. Screenshot dynamic render
  await page.goto('/tests/api/streaming-progressive.html');
  // ... trigger card generation
  const dynamicShot = await page.screenshot();

  // 3. Compare
  expect(dynamicShot).toMatchSnapshot(staticShot);
});
```

**Tools:**
- Playwright screenshot comparison
- Pixelmatch for diff visualization
- Percy.io or Chromatic for cloud-based comparison

**Priority:** MEDIUM - Validates visual appearance.

---

### Level 4: Responsive Tests

**Goal:** Verify layouts transform correctly at breakpoints.

**Implementation:**
```javascript
test('three-columns-headings: responsive behavior', async ({ page }) => {
  await page.goto('/tests/api/streaming-progressive.html');
  // ... render card

  // Test at 900px (3 columns)
  await page.setViewportSize({ width: 900, height: 600 });
  let columns = await page.$$eval('.column', cols => cols.length);
  expect(columns).toBe(3);

  // Test at 650px (2 columns + 1 full width)
  await page.setViewportSize({ width: 650, height: 600 });
  // ... verify layout

  // Test at 450px (1 column)
  await page.setViewportSize({ width: 450, height: 600 });
  // ... verify layout
});
```

**Priority:** MEDIUM - Validates container queries.

---

## Success Metrics

### Phase Completion Criteria

**Phase 1 (Infrastructure):**
- ✓ Layout metadata system defined
- ✓ Refactored rendering functions
- ✓ Unit tests still pass

**Phase 2 (Class Placement):**
- ✓ All layout classes on `.card-content-scrollable`
- ✓ No `card-` prefixed classes
- ✓ Container queries activate correctly

**Phase 3 (Wrappers):**
- ✓ All 68 wrapper tests pass with actual rendering
- ✓ Visual inspection shows correct structure
- ✓ All 17 layouts have required containers

**Phase 4 (Bullets):**
- ✓ Title-bullets: custom colored bullets
- ✓ Other layouts: default disc bullets
- ✓ 2 bullet styling tests pass

**Phase 5 (Images):**
- ✓ Sidebar: 300px image left
- ✓ Image-text: image before text
- ✓ Text-image: image after text
- ✓ 5 image placement tests pass

**Phase 6 (Semantic HTML):**
- ✓ h1 for hero titles
- ✓ h2 for section titles
- ✓ h3 for column headings
- ✓ 6 semantic HTML tests pass
- ✓ axe-core accessibility checks pass

**Phase 7 (Content Routing):**
- ✓ Title routes to header
- ✓ Bullets route to correct section
- ✓ Columns route to individual divs
- ✓ 3 content routing tests pass

---

## Final Validation Checklist

### For Each of the 17 Layouts:

- [ ] Unit tests pass (structure expectations)
- [ ] Integration test passes (actual SSE rendering)
- [ ] Visual regression test passes (looks like static)
- [ ] Responsive test passes (breakpoints work)
- [ ] Accessibility test passes (axe-core)
- [ ] Manual QA pass (human verification)

### Cross-Layout Validation:

- [ ] All layouts use correct class placement
- [ ] All wrappers are present
- [ ] Semantic HTML is used consistently
- [ ] Images place correctly
- [ ] Content routes to correct containers
- [ ] Bullet styling is layout-aware

---

## Estimated Timeline

### Optimistic (Single Developer, Full-Time)

- Phase 1 (Infrastructure): 2 days
- Phase 2 (Class Placement): 1 day
- Phase 3 (Wrappers): 4 days
- Phase 4 (Bullets): 1 day
- Phase 5 (Images): 3 days
- Phase 6 (Semantic HTML): 2 days
- Phase 7 (Content Routing): 3 days
- Integration Testing: 2 days
- Visual Testing: 1 day
- Bug Fixes: 2 days

**Total: 21 days (4.2 weeks)**

### Realistic (With Interruptions)

- 30-40 days (6-8 weeks)

---

## Risk Assessment

### High Risk Areas

1. **Complex Layouts** (Feature, Masonry, Dashboard, Objectives)
   - Risk: Custom data structures may not map to outline format
   - Mitigation: May require outline editor enhancements

2. **Image Placement** (Sidebar, Image-Text, Text-Image)
   - Risk: Flex/grid layout CSS may need adjustment
   - Mitigation: Test thoroughly at multiple widths

3. **Column Splitting** (Two/Three/Four-Columns)
   - Risk: Algorithm to split bullets into N columns may have edge cases
   - Mitigation: Property-based testing with varied content

### Medium Risk Areas

1. **Bullet Styling**
   - Risk: CSS specificity issues with custom bullets
   - Mitigation: Use higher specificity selectors

2. **Responsive Behavior**
   - Risk: Container queries may not trigger correctly
   - Mitigation: Test at exact breakpoint widths

### Low Risk Areas

1. **Hero Layouts**
   - Already mostly working according to analysis
   - Minimal changes needed

2. **Class Placement**
   - Simple find-and-replace operation
   - Low complexity

---

## Conclusion

### Current Status

- ✓ Expected structure defined (102 unit tests)
- ⚠️ Actual implementation has known discrepancies
- ❌ Integration tests not yet implemented

### Next Steps

1. **Immediate:** Create integration tests with actual SSE rendering
2. **Short-term:** Fix class placement (Phase 2)
3. **Medium-term:** Generate wrappers (Phase 3)
4. **Long-term:** Complete all 7 phases

### Success Criteria

**Project is complete when:**
1. All 102 unit tests pass
2. All 17 integration tests pass (one per layout)
3. All visual regression tests pass
4. All responsive tests pass
5. All accessibility tests pass
6. Manual QA confirms parity with static templates

---

**Document Status:** Final
**Next Review:** After integration tests are implemented
**Owner:** Test Automation Team
**Last Updated:** October 26, 2025
