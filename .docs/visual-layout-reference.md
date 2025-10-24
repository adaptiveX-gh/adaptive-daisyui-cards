# Visual Layout Reference for Adaptive Cards

## Container Breakpoints

```
< 250px     |  250-399px  |  400-599px  |  600-799px  |  800px+
------------|-------------|-------------|-------------|-------------
Extra Small |    Small    |   Medium    |    Large    | Extra Large
Minimal     |   Compact   |  Balanced   |  Expanded   | Full-Featured
```

---

## Layout 1: SIDEBAR LAYOUT

**Extra Large (800px+):**
```
┌─────────────────────────────────────────┐
│  Image  │  Title                        │
│  (30%)  │  Description text that flows  │
│         │  across multiple lines here   │
│         │  [Button]  [Button]           │
└─────────────────────────────────────────┘
```

**Medium (400-599px):**
```
┌────────────────────────────┐
│ Image │  Title             │
│ (40%) │  Description...    │
│       │  [Button]          │
└────────────────────────────┘
```

**Small (< 400px):**
```
┌────────────────┐
│     Image      │
│   (full width) │
├────────────────┤
│  Title         │
│  Description   │
│  [Button]      │
└────────────────┘
```

---

## Layout 2: FEATURE LAYOUT

**Extra Large (800px+):**
```
┌────────────────────────────────────────────┐
│         Header Title & Description         │
├─────────────┬─────────────┬────────────────┤
│  Feature 1  │  Feature 2  │   Feature 3    │
│  Icon       │  Icon       │   Icon         │
│  Text       │  Text       │   Text         │
└─────────────┴─────────────┴────────────────┘
```

**Medium (400-599px):**
```
┌────────────────────────────┐
│  Header Title              │
├─────────────┬──────────────┤
│  Feature 1  │  Feature 2   │
│  Icon       │  Icon        │
│  Text       │  Text        │
├─────────────┴──────────────┤
│      Feature 3 (full)      │
└────────────────────────────┘
```

**Small (< 400px):**
```
┌────────────────┐
│  Header        │
├────────────────┤
│  Feature 1     │
│  Icon          │
│  Text          │
├────────────────┤
│  Feature 2     │
│  Icon          │
│  Text          │
├────────────────┤
│  Feature 3     │
│  Icon          │
│  Text          │
└────────────────┘
```

---

## Layout 3: MASONRY LAYOUT

**Extra Large (800px+):**
```
┌──────┬──────┬──────┐
│  1   │  4   │  7   │
│      ├──────┤      │
│      │  5   ├──────┤
├──────┤      │  8   │
│  2   │      │      │
│      ├──────┼──────┤
├──────┤  6   │  9   │
│  3   │      │      │
└──────┴──────┴──────┘
```

**Medium (400-599px):**
```
┌─────────┬─────────┐
│    1    │    4    │
│         ├─────────┤
│         │    5    │
├─────────┤         │
│    2    │         │
│         ├─────────┤
├─────────┤    6    │
│    3    │         │
└─────────┴─────────┘
```

**Small (< 400px):**
```
┌────────────┐
│     1      │
├────────────┤
│     2      │
├────────────┤
│     3      │
├────────────┤
│     4      │
├────────────┤
│     5      │
└────────────┘
```

---

## Layout 4: DASHBOARD LAYOUT

**Extra Large (800px+):**
```
┌─────────────────────────────────────────┐
│           Header (Span Full)            │
├──────────┬──────────────────────────────┤
│ Sidebar  │         Main Content         │
│ (20%)    │         (Grid 2x2)           │
│          ├───────────┬──────────────────┤
│  Nav     │  Metric 1 │    Metric 2      │
│  Items   ├───────────┼──────────────────┤
│          │  Chart    │    Table         │
└──────────┴───────────┴──────────────────┘
```

**Medium (400-599px):**
```
┌────────────────────────────┐
│         Header             │
├─────────────┬──────────────┤
│  Metric 1   │  Metric 2    │
├─────────────┴──────────────┤
│       Chart (full)         │
├────────────────────────────┤
│       Table (full)         │
└────────────────────────────┘
```

**Small (< 400px):**
```
┌────────────────┐
│    Header      │
├────────────────┤
│   Metric 1     │
├────────────────┤
│   Metric 2     │
├────────────────┤
│     Chart      │
├────────────────┤
│     Table      │
└────────────────┘
```

---

## Layout 5: SPLIT LAYOUT

**Extra Large (800px+):**
```
┌─────────────────┬─────────────────┐
│                 │                 │
│   Left Half     │   Right Half    │
│   50%           │   50%           │
│                 │                 │
│   Content A     │   Content B     │
│                 │                 │
└─────────────────┴─────────────────┘
```

**Medium (400-599px):**
```
┌──────────────┬───────────┐
│              │           │
│  Left 60%    │  Right    │
│              │  40%      │
│  Content A   │  Content B│
│              │           │
└──────────────┴───────────┘
```

**Small (< 400px):**
```
┌────────────────┐
│   Content A    │
│   (Full Width) │
│                │
├────────────────┤
│   Content B    │
│   (Full Width) │
│                │
└────────────────┘
```

---

## Content Scaling Examples

### Typography Scaling

```
Container: 200px → 400px → 800px
─────────────────────────────────
Heading:  16px  →  20px  →  32px
Body:     14px  →  16px  →  18px
Caption:  12px  →  13px  →  14px
```

### Spacing Scaling

```
Container: 200px → 400px → 800px
─────────────────────────────────
Gap:      0.5rem → 1rem  → 2rem
Padding:  0.75rem → 1.5rem → 2.5rem
```

### Icon Scaling

```
Container: 200px → 400px → 800px
─────────────────────────────────
Icons:    16px  →  24px  →  32px
```

---

## Aspect Ratio Changes

```
Extra Large:  21:9 or 16:9 (Ultrawide/Widescreen)
Large:        16:9 (Widescreen)
Medium:       4:3 (Balanced)
Small:        3:4 or 1:1 (Portrait/Square)
```

---

## CSS Pattern Examples

### Container Query Pattern
```css
.card-container {
  container-type: inline-size;
  container-name: card;
}

/* Small */
@container card (max-width: 399px) {
  .adaptive-card { 
    grid-template-columns: 1fr;
    aspect-ratio: 3/4;
  }
}

/* Medium */
@container card (min-width: 400px) and (max-width: 599px) {
  .adaptive-card { 
    grid-template-columns: 1fr 2fr;
    aspect-ratio: 4/3;
  }
}

/* Large */
@container card (min-width: 600px) {
  .adaptive-card { 
    grid-template-columns: 1fr 3fr;
    aspect-ratio: 16/9;
  }
}
```

### Scaling Pattern
```css
.adaptive-card {
  /* Fluid spacing */
  padding: clamp(0.75rem, 3cqw, 2.5rem);
  gap: clamp(0.5rem, 2cqw, 2rem);
  
  /* Fluid typography */
  font-size: clamp(0.875rem, 2cqw, 1rem);
}

.adaptive-card h2 {
  font-size: clamp(1.25rem, 4cqw, 2rem);
  margin-bottom: clamp(0.5rem, 2cqw, 1rem);
}
```

---

## Grid Template Areas Example

### Dashboard Layout (Large)
```css
@container card (min-width: 600px) {
  .layout-dashboard {
    display: grid;
    grid-template-areas:
      "header header header"
      "sidebar main main"
      "sidebar footer footer";
    grid-template-columns: 200px 1fr 1fr;
    grid-template-rows: auto 1fr auto;
  }
}
```

### Dashboard Layout (Small)
```css
@container card (max-width: 399px) {
  .layout-dashboard {
    display: grid;
    grid-template-areas:
      "header"
      "main"
      "sidebar"
      "footer";
    grid-template-columns: 1fr;
  }
}
```

---

## Interactive Demo Requirements

The demo page should include:

1. **Resizable Container**
   ```
   [◄─────  Drag to Resize  ─────►]
   Container Width: 450px
   Current Layout: Medium
   ```

2. **Layout Switcher**
   ```
   [Sidebar] [Feature] [Masonry] [Dashboard] [Split]
   ```

3. **Theme Switcher**
   ```
   [Light] [Dark] [Cupcake] [Cyberpunk] [Business]
   ```

4. **Example Cards**
   - Product Card (e-commerce with image, price, buy button)
   - Blog Post Card (featured image, title, excerpt, read more)
   - Dashboard Widget (metric with chart)
   - Profile Card (avatar, bio, stats, follow button)
   - Media Gallery Card (images in grid)

---

## Success Indicators

✅ **Visual Test**: Can drag container from 200px to 1200px and see smooth transformations

✅ **Breakpoint Test**: Card reshapes at exactly 250px, 400px, 600px, 800px

✅ **Scaling Test**: All content (text, images, spacing) scales proportionally

✅ **Layout Test**: All 5 layouts work correctly at all breakpoints

✅ **Theme Test**: All daisyUI themes apply correctly

✅ **Performance Test**: No jank, smooth 60fps transitions
