# Adaptive DaisyUI Cards

Interactive demo showcasing CSS Container Queries with DaisyUI. Cards adapt to their container size (not viewport) using modern container query techniques.

## Tech Stack
- Tailwind CSS v3.4+ with @tailwindcss/container-queries
- DaisyUI v4+ component library
- Vanilla JavaScript (no framework)
- Vite for dev server and builds

## Structure
```
src/
├── input.css                  # Container queries, adaptive layouts, scalable typography
├── app.js                     # Interactive controls: resize, layout/theme switching
└── SharedComponentManager.js  # Manages shared headers/footers (symbol pattern)

index.html             # Demo page with all 16 layouts
dist/output.css        # Compiled Tailwind CSS (generated, do not edit)
tests/                 # Playwright E2E and Vitest unit tests
docs/                  # Detailed documentation and guides
```

## Shared Components (Symbol Pattern)

The system supports shared headers and footers that can be:
- Toggled on/off for ALL cards simultaneously
- Edited once to update ALL cards immediately
- Themed automatically with DaisyUI
- Persisted with presentation data

**Usage:**
1. Toggle "Show Headers" or "Show Footers" to display on all cards
2. Click "Edit Header" or "Edit Footer" to modify content
3. Changes apply to all cards instantly (symbol pattern)
4. Header: DaisyUI navbar with title and CTA button
5. Footer: DaisyUI footer with copyright text
6. Content area scrolls independently when header/footer visible

**Implementation:**
- `SharedComponentManager` class manages all instances
- Headers/footers use `.shared-header-container` and `.shared-footer-container`
- Content wrapped in `.card-content-scrollable` for independent scrolling
- Settings persist in localStorage with key `presentation-shared-components`

## 16 Adaptive Layouts

Each layout responds to **container width** via `@container` queries:

1. **sidebar-layout** - Image left/content right → stacks at <600px
2. **image-text-layout** - Image left (40%)/text right (60%) → stacks at <600px. Optimized for about pages, company profiles, product descriptions with prominent visual anchor.
3. **text-image-layout** - Text left (60%)/image right (40%) → stacks at <600px (text top, image bottom). Optimized for feature lists, product showcases where content takes priority over image.
4. **feature-layout** - 3-col → 2-col → 1-col grid (400px, 600px breakpoints)
5. **masonry-layout** - 3-col → 2-col → 1-col gallery
6. **dashboard-layout** - Complex grid → 2-col → stack (400px, 800px)
7. **split-layout** - 50/50 → 60/40 → stack
8. **two-columns-layout** - Title/subtitle + two equal columns (50/50) → stacks at <600px. Perfect for comparisons, pros/cons, parallel concepts.
9. **two-columns-headings-layout** - Title/subtitle + two equal columns with individual headings (50/50) → stacks at <600px. Perfect for labeled comparisons, pros/cons, categorized content.
10. **three-columns-layout** - Title/subtitle + three equal columns (33.33% each) → 2-col (3rd full-width) → 1-col. Responsive at 600px and 800px. Perfect for services, features, three-part processes.
11. **three-columns-headings-layout** - Title/subtitle + three equal columns with individual headings → 2-col (3rd full-width) → 1-col. Perfect for pricing tiers (Basic/Pro/Enterprise), product variants, categorized three-way comparisons.
12. **four-columns-layout** - Title/subtitle + four equal columns (25% each) → 2-col → 1-col. Responsive at 600px and 800px. Perfect for quarterly data, 4-part processes, four phases/seasons.
13. **title-bullets-layout** - Centered title/subtitle + centered bullet list. Clean, focused presentation for key takeaways, agenda items, executive summaries. No images or complex layout.
14. **title-bullets-image-layout** - Title/subtitle + bullets left (60%) + image right (40%) → stacks at <600px. Perfect for feature lists with product image, benefits with visual support.
15. **hero-layout** - Presentation/hero layout with extra large typography (2-4rem), full-bleed images. Supports `.image-left` variant for image placement
16. **hero-layout.overlay** - Content overlays full-bleed background image with gradient overlay for readability. Perfect for card-style presentation slides.

All layouts use `.layout-card` base class for DaisyUI styling.

## Shared Components (Headers & Footers)

All layouts support optional shared headers and footers that can be toggled on/off and customized globally:

### Header Features
- Title text (customizable)
- Logo image (right-aligned, 40px max height)
- Background color (11 DaisyUI theme colors)
- Positioned at top of each card

### Footer Features
- Logo image (left-aligned, 30px max height)
- Copyright text (center-aligned)
- Background color (11 DaisyUI theme colors)
- Positioned at bottom of each card

### Persistence
All header/footer settings save to localStorage and persist across:
- Page refreshes
- Browser restarts
- Different pages (index.html ↔ streaming-progressive.html)

localStorage key: `presentation-shared-components`

### Layout Structure Pattern

**IMPORTANT**: When creating a new layout, you MUST wrap it with the shared components structure:

```html
<div id="new-layout" class="layout-card hidden" data-layout="new-layout-name">
  <div class="layout-card-with-components">
    <div class="shared-header-container" data-card-id="new-layout"></div>
    <div class="card-content-scrollable">
      <!-- Your layout content goes here -->
      <div class="your-layout-class">
        <!-- Layout-specific HTML -->
      </div>
    </div>
    <div class="shared-footer-container" data-card-id="new-layout"></div>
  </div>
</div>
```

### CSS Classes Required
- `.layout-card-with-components` - Flexbox container (flex-direction: column)
- `.shared-header-container` - Header wrapper (flex-shrink: 0, sticky top)
- `.card-content-scrollable` - Scrollable content area (flex: 1, overflow-y: auto)
- `.shared-footer-container` - Footer wrapper (flex-shrink: 0, sticky bottom)

These classes are defined in `src/input.css` (lines 1106-1160).

### Header/Footer Controls
Located at the top of index.html (lines 32-57):
- Toggle switches to show/hide headers and footers
- Edit buttons to customize content, images, and colors
- Visual color picker with 11 DaisyUI color options

### Edit Dialogs
Located at the bottom of index.html (lines 858-1027):
- Modal dialogs for editing header and footer properties
- Real-time preview of color swatches
- Form validation and save functionality

### JavaScript Integration
The `SharedComponentManager` class (src/SharedComponentManager.js) handles:
- Rendering headers/footers across all cards
- Saving/loading settings from localStorage
- Updating all instances when content changes (symbol pattern)

### Theme Compatibility
Headers and footers automatically adapt to all 29 DaisyUI themes because they use theme-aware utility classes (bg-primary, bg-base-100, etc.).

## Key Patterns

**Container Query Setup:**
```css
.card-container {
  container-type: inline-size;  /* Creates query context */
  container-name: card;
}

@container card (min-width: 600px) {
  .sidebar-layout { flex-direction: row; }  /* Horizontal */
}
```

**Scalable Typography:**
```css
.adaptive-text-base {
  font-size: clamp(1rem, 2.5cqw, 1.125rem);  /* Scales with container */
}
```

## Common Commands
```bash
npm run dev            # Start dev server (http://localhost:5173)
npm run build          # Compile Tailwind CSS + Vite build
npm test               # Run all tests (Playwright + Vitest)
npm run test:e2e       # Run E2E tests only
```

## Making Changes

**Adding a new layout:**
1. Add CSS in `src/input.css` following existing pattern
2. Add HTML structure in `index.html` **wrapped with shared components** (see pattern above)
3. Update JavaScript in `src/app.js` (add to elements.layouts)
4. Rebuild CSS: `npm run build`
5. Test that headers and footers appear on the new layout

**Modifying breakpoints:**
- Edit `@container card (min-width: XXXpx)` queries in `src/input.css`
- Standard breakpoints: 250px, 400px, 600px, 800px

**Testing changes:**
- Use preset buttons (250px, 450px, 650px, 900px) to test breakpoints
- Drag resize handle to test smooth scaling
- Try all 29 DaisyUI themes to ensure compatibility
