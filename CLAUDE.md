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
├── input.css          # Container queries, adaptive layouts, scalable typography
└── app.js             # Interactive controls: resize, layout/theme switching

index.html             # Demo page with all 6 layouts
dist/output.css        # Compiled Tailwind CSS (generated, do not edit)
tests/                 # Playwright E2E and Vitest unit tests
docs/                  # Detailed documentation and guides
```

## 6 Adaptive Layouts

Each layout responds to **container width** via `@container` queries:

1. **sidebar-layout** - Image left/content right → stacks at <600px
2. **feature-layout** - 3-col → 2-col → 1-col grid (400px, 600px breakpoints)
3. **masonry-layout** - 3-col → 2-col → 1-col gallery
4. **dashboard-layout** - Complex grid → 2-col → stack (400px, 800px)
5. **split-layout** - 50/50 → 60/40 → stack
6. **hero-layout** - Presentation/hero layout with extra large typography (2-4rem), full-bleed images. Supports `.image-left` variant for image placement

All layouts use `.layout-card` base class for DaisyUI styling.

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
2. Add HTML structure in `index.html`
3. Update JavaScript in `src/app.js` (add to elements.layouts)
4. Rebuild CSS: `npm run build`

**Modifying breakpoints:**
- Edit `@container card (min-width: XXXpx)` queries in `src/input.css`
- Standard breakpoints: 250px, 400px, 600px, 800px

**Testing changes:**
- Use preset buttons (250px, 450px, 650px, 900px) to test breakpoints
- Drag resize handle to test smooth scaling
- Try all 29 DaisyUI themes to ensure compatibility
