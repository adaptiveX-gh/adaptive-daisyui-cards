# Image Placement: Before vs After Comparison

## Visual Comparison by Layout

### 1. Sidebar Layout

#### Before (Incorrect)
```
┌─────────────────────────────┐
│  [Image Full Width]         │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
├─────────────────────────────┤
│  Title                      │
│  Description text...        │
│  • Bullet 1                 │
│  • Bullet 2                 │
└─────────────────────────────┘
```
**Issue**: Image spans full width at top (generic `.card-image`)

#### After (Correct)
```
┌─────────────────────────────┐
│  ┌────┐  Title              │
│  │ ▓▓ │  Description text   │
│  │ ▓▓ │  goes here...       │
│  │ ▓▓ │  • Bullet 1         │
│  └────┘  • Bullet 2         │
└─────────────────────────────┘
```
**Fix**: Image uses `.sidebar-image` (300px width, left side)

---

### 2. Image-Text Layout

#### Before (Incorrect)
```
┌─────────────────────────────┐
│  [Image Full Width]         │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
├─────────────────────────────┤
│  Title                      │
│  Description text...        │
│  • Feature 1                │
└─────────────────────────────┘
```
**Issue**: Image on top, text below (should be side-by-side)

#### After (Correct)
```
┌─────────────────────────────┐
│  ┌─────────┐  Title         │
│  │  ▓▓▓▓▓  │  Description   │
│  │  ▓▓▓▓▓  │  text goes     │
│  │  ▓▓▓▓▓  │  here...       │
│  │  ▓▓▓▓▓  │  • Feature 1   │
│  └─────────┘  • Feature 2   │
└─────────────────────────────┘
   40% width    60% width
```
**Fix**: Image in `.image-section` (left, 40%), text in `.text-section` (right, 60%)

---

### 3. Text-Image Layout

#### Before (Incorrect)
```
┌─────────────────────────────┐
│  [Image Full Width]         │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
├─────────────────────────────┤
│  Title                      │
│  Description text...        │
│  • Benefit 1                │
└─────────────────────────────┘
```
**Issue**: Image on top (should be on RIGHT side)

#### After (Correct)
```
┌─────────────────────────────┐
│  Title         ┌─────────┐  │
│  Description   │  ▓▓▓▓▓  │  │
│  text goes     │  ▓▓▓▓▓  │  │
│  here...       │  ▓▓▓▓▓  │  │
│  • Benefit 1   │  ▓▓▓▓▓  │  │
│  • Benefit 2   └─────────┘  │
└─────────────────────────────┘
   60% width      40% width
```
**Fix**: Text in `.text-section` (left, 60%), image in `.image-section` (right, 40%)
**Key**: DOM order matters! Text section created BEFORE image section.

---

### 4. Title-Bullets-Image Layout

#### Before (Incorrect)
```
┌─────────────────────────────┐
│  [Image Full Width]         │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
├─────────────────────────────┤
│  Title                      │
│  Subtitle                   │
│  • Key point 1              │
│  • Key point 2              │
└─────────────────────────────┘
```
**Issue**: Image on top, bullets below (should be side-by-side)

#### After (Correct)
```
┌─────────────────────────────┐
│  Title                      │
│  Subtitle                   │
├─────────────────────────────┤
│  • Key point 1   ┌───────┐ │
│  • Key point 2   │ ▓▓▓▓▓ │ │
│  • Key point 3   │ ▓▓▓▓▓ │ │
│  • Key point 4   │ ▓▓▓▓▓ │ │
│                  └───────┘ │
└─────────────────────────────┘
```
**Fix**: Bullets in `.bullets-section`, image in `.image-section`, both inside `.content-container`

---

### 5. Hero & Hero-Overlay Layouts

#### Before (Correct - No Change Needed)
```
┌─────────────────────────────┐
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│░░░░  BIG TITLE  ░░░░░░░░░░░│
│░░░░  Subtitle   ░░░░░░░░░░░│
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
└─────────────────────────────┘
```
**Status**: Already working correctly with `.hero-image` full-bleed background

#### After (No Change)
Same as before - uses `.hero-image` class with gradient overlay

---

### 6. Masonry Layout

#### Before (Incorrect)
```
┌─────────────────────────────┐
│  [Image Full Width]         │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
├─────────────────────────────┤
│  Gallery Title              │
│  (No grid structure)        │
└─────────────────────────────┘
```
**Issue**: Single image at top, no `.masonry-item` structure

#### After (Correct)
```
┌─────────────────────────────┐
│  Gallery Title              │
├─────────────────────────────┤
│  ┌─────────┐               │
│  │  ▓▓▓▓▓  │  ← masonry-   │
│  │  ▓▓▓▓▓  │    item       │
│  └─────────┘               │
└─────────────────────────────┘
```
**Fix**: Image wrapped in `.masonry-item`, placed in `.masonry-grid`
**Note**: Currently single image (multi-image needs backend support)

---

## DOM Structure Comparison

### Sidebar Layout

#### Before
```html
<div class="card-body">
  <!-- ❌ Wrong: Generic image container at top -->
  <div class="card-image mb-4" data-card-id="...">
    <img src="..." />
  </div>
  <!-- ❌ No sidebar-content wrapper -->
  <div data-section="title">Title</div>
  <div data-section="description">Description</div>
</div>
```

#### After
```html
<div class="card-body">
  <!-- ✅ Correct: Sidebar-specific image container -->
  <div class="sidebar-image" data-card-id="...">
    <img src="..." />
  </div>
  <!-- ✅ Content in sidebar-content wrapper -->
  <div class="sidebar-content" data-sidebar-content="true">
    <div data-section="title">Title</div>
    <div data-section="description">Description</div>
  </div>
</div>
```

### Image-Text Layout

#### Before
```html
<div class="card-body">
  <!-- ❌ Generic image at top -->
  <div class="card-image mb-4">...</div>
  <!-- ❌ No section wrappers -->
  <div data-section="title">Title</div>
  <div data-section="description">Text</div>
</div>
```

#### After
```html
<div class="card-body">
  <!-- ✅ Image in dedicated section -->
  <div class="image-section" data-image-section="true">
    <div class="w-full h-full" data-card-id="...">
      <img src="..." />
    </div>
  </div>
  <!-- ✅ Text in dedicated section -->
  <div class="text-section" data-text-section="true">
    <div data-section="title">Title</div>
    <div data-section="description">Text</div>
  </div>
</div>
```

### Title-Bullets-Image Layout

#### Before
```html
<div class="card-body">
  <!-- ❌ Generic image at top -->
  <div class="card-image mb-4">...</div>
  <!-- ❌ Flat structure -->
  <div data-section="title">Title</div>
  <div data-section="bullets"><ul>...</ul></div>
</div>
```

#### After
```html
<div class="card-body">
  <!-- ✅ Header section -->
  <div class="title-bullets-header" data-layout-header="true">
    <div data-section="title">Title</div>
    <div data-section="subtitle">Subtitle</div>
  </div>
  <!-- ✅ Content container with bullets and image -->
  <div class="content-container" data-content-container="true">
    <div class="bullets-section" data-bullets-section="true">
      <div data-section="bullets"><ul>...</ul></div>
    </div>
    <div class="image-section" data-image-section="true">
      <div class="w-full h-full" data-card-id="...">
        <img src="..." />
      </div>
    </div>
  </div>
</div>
```

---

## CSS Selector Impact

### Before: CSS Rules Didn't Match

```css
/* Static CSS that didn't apply to dynamic cards */
.sidebar-layout .sidebar-image {
  width: 300px;  /* ❌ Never matched */
}

.image-text-layout .image-section {
  flex-basis: 40%;  /* ❌ Section didn't exist */
}

.title-bullets-image-layout .content-container {
  display: flex;  /* ❌ Container didn't exist */
}
```

### After: CSS Rules Apply Correctly

```css
/* Now all these selectors match! */
.sidebar-layout .sidebar-image {
  width: 300px;  /* ✅ Applied */
}

.image-text-layout .image-section {
  flex-basis: 40%;  /* ✅ Applied */
}

.title-bullets-image-layout .content-container {
  display: flex;  /* ✅ Applied */
}
```

---

## Responsive Behavior

### Image-Text Layout: Container Query Example

```css
/* Static CSS with container queries */
@container card (max-width: 600px) {
  .image-text-layout {
    flex-direction: column;  /* Stack on small screens */
  }
  .image-text-layout .image-section {
    width: 100%;  /* Full width image */
  }
}
```

**Before**: Query never triggered because `.image-text-layout` class wasn't on container
**After**: Query works correctly, cards respond to container size

### Visual Result

#### Desktop (>600px)
```
┌───────────────────────────────────────┐
│  ┌──────────┐  Title                 │
│  │  Image   │  Description text...   │
│  └──────────┘  • Feature              │
└───────────────────────────────────────┘
```

#### Mobile (<600px)
```
┌──────────────────┐
│  ┌────────────┐  │
│  │   Image    │  │
│  └────────────┘  │
├──────────────────┤
│  Title           │
│  Description...  │
│  • Feature       │
└──────────────────┘
```

---

## Testing Results

### Layout Verification Matrix

| Layout                  | Before | After | CSS Applied | Responsive |
|------------------------|--------|-------|-------------|------------|
| Hero                   | ✅     | ✅    | ✅          | ✅         |
| Hero-Overlay           | ✅     | ✅    | ✅          | ✅         |
| Sidebar                | ❌     | ✅    | ✅          | ✅         |
| Image-Text             | ❌     | ✅    | ✅          | ✅         |
| Text-Image             | ❌     | ✅    | ✅          | ✅         |
| Title-Bullets-Image    | ❌     | ✅    | ✅          | ✅         |
| Masonry                | ❌     | ✅    | ✅          | ✅         |

### Image Placement Verification

| Layout                  | Expected Position        | Before      | After       |
|------------------------|-------------------------|-------------|-------------|
| Sidebar                | Left (300px)            | Top (full)  | ✅ Left     |
| Image-Text             | Left (40%)              | Top (full)  | ✅ Left     |
| Text-Image             | Right (40%)             | Top (full)  | ✅ Right    |
| Title-Bullets-Image    | Right (alongside)       | Top (full)  | ✅ Right    |
| Masonry                | In grid item            | Top (flat)  | ✅ Grid     |

---

## Key Takeaways

1. **Structure First**: Layout structure must be created BEFORE image placeholder
2. **DOM Order Matters**: Text-image layout requires text section before image section in DOM
3. **CSS Compatibility**: Matching static HTML structure enables static CSS to work
4. **Data Attributes**: Using `data-*` attributes provides robust querying mechanism
5. **Fallback Handling**: Each layout has graceful fallback if structure not ready
6. **Container Queries**: Responsive behavior now works correctly with proper class names

## Related Files

- **Implementation**: `tests/api/streaming-progressive.html` (lines 1456-1699)
- **Static Examples**: `index.html` (reference implementation)
- **CSS Rules**: `src/input.css` (layout-specific styles)
- **Documentation**: `docs/layout-specific-image-placement-fix.md`
