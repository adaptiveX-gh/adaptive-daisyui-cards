# Research Challenge: Layout Rendering Differences

## Objective
Investigate and document the differences between static layout rendering (index.html) and dynamic preview rendering (streaming-progressive.html) to identify why some layouts don't render identically.

## Background
We have two rendering paths:
1. **Static (index.html)**: Hand-coded HTML examples that render perfectly
2. **Dynamic (Preview)**: AI-generated content → Backend parsing → Frontend rendering

Your goal is to understand the entire pipeline and identify where mismatches occur.

---

## Phase 1: Content Structure Analysis (30 mins)

### Task 1.1: Document Static Structure
Pick **three-columns-headings-layout** as your test case.

**Questions to answer:**
1. What is the exact HTML structure in index.html?
   - List all wrapper elements and their classes
   - Document the nesting hierarchy
   - Note which elements have data attributes

2. What content properties does the static example have?
   - How are headings structured?
   - How are descriptions formatted?
   - How are bullet lists organized?

**Deliverable:** Create a diagram showing the DOM tree structure

---

## Phase 2: Dynamic Generation Pipeline (45 mins)

### Task 2.1: Trace the Content Flow

Follow a piece of content from user input to final render:

**Starting Point:**
```
User writes in outline editor:
AI for Product Discovery
Recommendations
- Customers who bought this also bought...
- Personalized suggestions based on your interests
Smart Search
- Understanding 'red dress for summer wedding' not just keywords
- Context-aware results that know what you mean
```

**Trace Through:**

1. **Backend Parsing** (`api/routes/streaming.js` line 487-500)
   - What data structure is created from this text?
   - What property names are used? (title? heading? items? bullets?)
   - Log the exact output

2. **Content Emission** (`api/services/StreamingService.js` line 214-227)
   - How is the data sent to frontend?
   - What sections are emitted?
   - What's the section name for columns?

3. **Frontend Reception** (`streaming-progressive.html` handleMessage)
   - What does the `content` parameter contain?
   - Is it a string? Object? Array?

4. **Structure Creation** (`streaming-progressive.html` line 1619-1634)
   - What DOM elements are created?
   - What classes are added?
   - Where is the layoutClass applied?

5. **Content Rendering** (`streaming-progressive.html` line 1527-1560)
   - How does enrichContent transform the data?
   - What HTML is generated?
   - Are property names mapped correctly?

**Deliverable:** Flow diagram showing data transformation at each step

---

## Phase 3: Structural Comparison (30 mins)

### Task 3.1: DOM Inspector Analysis

**Steps:**
1. Open index.html in browser
2. Inspect the three-columns-headings-layout card
3. Copy the entire HTML structure to a file: `static-structure.html`

4. Generate a preview in streaming-progressive.html
5. Inspect the preview card
6. Copy the entire HTML structure to a file: `dynamic-structure.html`

7. Use a diff tool to compare them

**Questions:**
- What elements are present in static but missing in dynamic?
- What classes are different?
- What attributes are different?
- What content wrapper elements differ?

**Deliverable:** Annotated diff highlighting key differences

---

## Phase 4: CSS Selector Matching (30 mins)

### Task 4.1: Trace CSS Rules

Open `src/input.css` and find the three-columns-headings-layout rules.

**For each CSS rule, verify:**

```css
.three-columns-headings-layout .three-columns-container {
  /* Does this selector match in preview? */
}
```

**Questions:**
1. What class is on the parent element?
   - Static: `.card-content-scrollable.three-columns-headings-layout` ✓
   - Dynamic: `.card-content-scrollable.???`

2. Does `.three-columns-container` exist?
   - Static: Yes, created manually
   - Dynamic: Created by JS - verify it exists

3. Are `.column` elements children of the container?
   - Static: Yes
   - Dynamic: Check with `container.children`

4. Do columns have `.column-heading` or `.adaptive-text-xl`?
   - Static: `.column-heading`
   - Dynamic: Which class does enrichContent use?

**Test Method:**
```javascript
// In browser console while viewing preview
const container = document.querySelector('.three-columns-container');
console.log('Container exists:', !!container);
console.log('Parent classes:', container?.parentElement.className);
console.log('Column count:', container?.querySelectorAll('.column').length);
console.log('Heading classes:',
  Array.from(container?.querySelectorAll('h3') || [])
    .map(h => h.className)
);
```

**Deliverable:** Table showing which CSS rules match vs don't match

---

## Phase 5: Property Name Mapping (20 mins)

### Task 5.1: Backend vs Frontend Property Names

**Backend creates** (`streaming.js` line 496-499):
```javascript
content.columns.push({
  title: columnBullets[0],
  bullets: columnBullets.slice(1)
});
```

**Frontend expects** (`streaming-progressive.html` line 1538-1540):
```javascript
const heading = col.heading || col.title || '';
const description = col.description || '';
const items = col.items || col.bullets || [];
```

**Questions:**
1. Which property names does the backend use?
   - For column headings: `title` or `heading`?
   - For bullet points: `bullets` or `items`?
   - For descriptions: `description` or something else?

2. Does the frontend handle all backend property names?
   - Is there a fallback chain?
   - Are any properties lost in translation?

3. What does the template expect?
   ```html
   <h3 class="column-heading">${heading}</h3>
   ```
   - Does `heading` have a value?
   - If not, why not?

**Deliverable:** Mapping table of backend → frontend property names

---

## Phase 6: Image Handling (15 mins)

### Task 6.1: Why Do Images Appear?

**Investigate:**
1. Which layouts should have images? (Check `layoutConfig.imageLayouts`)
2. When is `includeImages` set to true? (line 3124-3125)
3. For three-columns-headings-layout:
   - Should it have images? NO
   - Does preview request images? Check console logs
   - What does `layoutConfig.shouldHaveImage()` return?

**Deliverable:** Decision tree showing when images are requested

---

## Phase 7: Root Cause Report (30 mins)

### Task 7.1: Write Findings

Create a report covering:

**1. Identified Issues**
List each issue found with:
- What's wrong
- Where in the code it occurs
- Why it happens
- Impact on rendering

**2. Recommended Fixes**
For each issue:
- Quick fix (band-aid solution)
- Proper fix (addresses root cause)
- Estimated complexity

**3. Test Plan**
How to verify fixes:
- Test cases to run
- Expected vs actual results
- Regression testing needed

**Template:**
```markdown
## Issue #1: Layout Class Applied to Wrong Element

**What:** Layout class added to .card-body instead of .card-content-scrollable
**Where:** streaming-progressive.html line 1618
**Why:** Code was modeled after different structure
**Impact:** CSS selectors don't match, flexbox doesn't work

**Fix:**
- Change: `cardBody.classList.add(structure.layoutClass)`
- To: `scrollableContainer.classList.add(structure.layoutClass)`
- Complexity: Easy (already fixed)

**Test:**
1. Preview three-columns layout
2. Inspect element
3. Verify parent has .three-columns-headings-layout class
4. Verify columns display side-by-side
```

---

## Bonus Challenges

### Bonus 1: Automated Testing
Write a test that compares static vs dynamic rendering:
```javascript
function compareRendering(layoutName) {
  // 1. Get static HTML structure
  const staticCard = getStaticCard(layoutName);

  // 2. Generate dynamic preview
  const dynamicCard = await generatePreview(layoutName, testData);

  // 3. Compare structure
  return {
    classesMatch: compareClasses(staticCard, dynamicCard),
    structureMatch: compareDOM(staticCard, dynamicCard),
    contentMatch: compareContent(staticCard, dynamicCard)
  };
}
```

### Bonus 2: Visual Regression Testing
Use browser screenshot tools to:
1. Capture static layout rendering
2. Capture dynamic preview rendering
3. Pixel-diff the images
4. Identify visual differences

### Bonus 3: Performance Profiling
Compare rendering performance:
- Static: Parse HTML (instant)
- Dynamic: Parse → Transform → Render
- Measure: Time, DOM operations, reflows

---

## Success Criteria

You've completed this challenge when you can:
1. ✅ Explain the entire content flow from outline to render
2. ✅ List 3+ structural differences between static and dynamic
3. ✅ Identify why CSS rules don't match
4. ✅ Propose concrete fixes with code examples
5. ✅ Create a test plan to prevent regressions

## Time Estimate
- Total: ~3 hours
- Can be done in 30-minute increments
- Pair programming recommended

## Resources
- Chrome DevTools (Elements, Console, Network)
- VS Code with Multi-cursor editing
- Diff tool (Beyond Compare, Meld, or VS Code diff)
- Browser screenshot extension (for Bonus 2)

## Deliverables
1. Flow diagram (visual or Mermaid)
2. Structure comparison (annotated diff)
3. CSS matching table
4. Property mapping table
5. Root cause report
6. (Optional) Test code or screenshots

---

## Questions to Discuss After

1. Why did we choose to have two different rendering paths?
2. Could we unify them? Pros/cons?
3. How can we prevent static/dynamic drift in the future?
4. Should we generate index.html examples from the same pipeline?
5. What would a "layout rendering test suite" look like?

Good luck! 🚀
