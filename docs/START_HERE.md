# Start Here - Adaptive DaisyUI Cards Demo

## Quick Start (30 seconds)

1. **Open the demo**
   ```
   Open: D:\Users\scale\Code\slideo\index.html
   ```
   Just double-click `index.html` in File Explorer or drag it into your browser.

2. **Try these things immediately:**
   - Drag the handle on the right edge of the container
   - Click the preset width buttons (250px, 450px, 900px)
   - Switch layouts using the dropdown
   - Change themes using the theme selector

3. **Watch the magic:**
   - The card layout adapts based on CONTAINER size
   - Typography scales smoothly with the container
   - All 5 layouts work at any width
   - Try all 29 DaisyUI themes

## What Makes This Special?

**Traditional Responsive Design (Media Queries)**
```css
@media (min-width: 600px) {
  /* Responds to VIEWPORT width */
}
```
Problem: Cards look different in narrow sidebars vs wide main content

**This System (Container Queries)**
```css
@container (min-width: 600px) {
  /* Responds to CONTAINER width */
}
```
Solution: Each card adapts to its own container, no matter where it's placed!

## 5 Layouts to Explore

1. **Sidebar Layout** (Default)
   - Perfect for product cards
   - Image switches from top to side at 600px

2. **Feature Layout**
   - Great for showcasing features
   - Transforms: 1 col → 2 cols → 3 cols

3. **Masonry Layout**
   - Ideal for image galleries
   - Responsive grid: 1 col → 2 cols → 3 cols

4. **Dashboard Layout**
   - Analytics and metrics
   - Complex: Stack → 2-col grid → Full dashboard

5. **Split Layout**
   - User profiles, comparisons
   - Vertical → 60/40 → 50/50

## Interactive Features

### Resize Container
- **Drag**: Grab the handle on the right edge
- **Keyboard**: Use arrow keys (Arrow keys = 10px, Shift+Arrow = 50px)
- **Presets**: Click buttons for specific widths
- **Range**: 200px minimum, 1200px maximum

### Test Breakpoints
Click these to see instant layout changes:
- **250px** - Tiny mobile (xs)
- **325px** - Small mobile
- **450px** - Large mobile / small tablet (md)
- **650px** - Tablet / small desktop (lg)
- **900px** - Desktop (xl)
- **1200px** - Wide desktop (max)

### Switch Themes
Try these popular themes:
- **Light** - Clean and bright
- **Dark** - Easy on the eyes
- **Cyberpunk** - Neon and bold
- **Dracula** - Developer favorite
- **Cupcake** - Soft pastels
- ...24 more themes!

## Code Examples

### Use in Your Project

```html
<!-- 1. Include the CSS -->
<link rel="stylesheet" href="./dist/output.css">

<!-- 2. Wrap your content -->
<div class="card-container">

  <!-- 3. Choose a layout -->
  <div class="sidebar-layout">
    <img src="product.jpg" class="sidebar-image">
    <div class="sidebar-content">
      <h2 class="adaptive-text-2xl font-bold">Product Name</h2>
      <p class="adaptive-text-base">Product description here</p>
      <button class="btn btn-primary">Buy Now</button>
    </div>
  </div>

</div>
```

### Typography Classes

```html
<!-- Scalable text that adapts to container size -->
<h1 class="adaptive-text-3xl">Main Heading</h1>
<h2 class="adaptive-text-2xl">Sub Heading</h2>
<h3 class="adaptive-text-xl">Section Heading</h3>
<p class="adaptive-text-base">Body text</p>
<small class="adaptive-text-sm">Small text</small>
```

### Spacing Classes

```html
<!-- Scalable gaps that adapt to container size -->
<div class="adaptive-gap-sm">   <!-- Small gap -->
<div class="adaptive-gap-md">   <!-- Medium gap -->
<div class="adaptive-gap-lg">   <!-- Large gap -->
<div class="adaptive-gap-xl">   <!-- Extra large gap -->
```

## Common Use Cases

### E-commerce Product Grid
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div class="card-container">
    <div class="sidebar-layout">
      <!-- Product card adapts to grid column width -->
    </div>
  </div>
</div>
```

### Blog Post Preview
```html
<article class="card-container">
  <div class="sidebar-layout">
    <img src="thumbnail.jpg" class="sidebar-image">
    <div class="sidebar-content">
      <h2 class="adaptive-text-2xl">Article Title</h2>
      <p class="adaptive-text-sm">Published: May 1, 2024</p>
      <p class="adaptive-text-base">Article excerpt...</p>
    </div>
  </div>
</article>
```

### Dashboard Widget
```html
<div class="card-container">
  <div class="dashboard-layout">
    <div class="dashboard-header">
      <h2 class="adaptive-text-xl">Analytics</h2>
    </div>
    <div class="dashboard-main">
      <div class="dashboard-widget">Metric 1</div>
      <div class="dashboard-widget">Metric 2</div>
    </div>
  </div>
</div>
```

## Keyboard Shortcuts

While focused on the resize handle:
- **←/↓** - Decrease width by 10px
- **→/↑** - Increase width by 10px
- **Shift + Arrows** - Change by 50px
- **Home** - Jump to 200px (minimum)
- **End** - Jump to 1200px (maximum)
- **Tab** - Navigate controls

## Browser Requirements

### Modern Browsers (Full Features)
- Chrome/Edge 105+
- Firefox 110+
- Safari 16+
- Opera 91+

### Older Browsers (Fallback)
- Still works! Just uses mobile-first single-column layout
- All functionality preserved
- Graceful degradation

## File Locations

```
D:\Users\scale\Code\slideo\
├── index.html          ← Open this in your browser!
├── src/
│   ├── input.css      ← Source CSS (edit this)
│   └── app.js         ← JavaScript functionality
├── dist/
│   └── output.css     ← Compiled CSS (don't edit)
├── README.md          ← Full documentation
├── QUICK_START.md     ← Quick start guide
└── IMPLEMENTATION_SUMMARY.md  ← Technical details
```

## Development Workflow

### Make Changes
1. Edit `src/input.css` (add your custom styles)
2. Run: `npm run build` (rebuilds CSS)
3. Refresh browser to see changes

### Watch Mode
```bash
npm run dev
```
Auto-rebuilds CSS when you save changes.

## Tips & Tricks

### 1. Test All Breakpoints
Don't just test at one size! Click through all preset buttons to see how layouts transform.

### 2. Try Different Themes
Some themes have subtle differences. Try cyberpunk, dracula, and cupcake to see the variety.

### 3. Use in Real Projects
Copy the `.card-container` + layout classes into your actual projects. They work anywhere!

### 4. Combine Layouts
You can use multiple layouts on the same page. Each adapts independently.

### 5. Inspect Container Queries
Open browser DevTools → Elements → Styles to see container query breakpoints.

## Troubleshooting

**Q: Container isn't resizing**
- Make sure you're dragging the handle (vertical grip on the right)
- Or use the preset width buttons
- Or use keyboard arrow keys when handle is focused

**Q: Layout not changing**
- The layout changes happen at specific breakpoints
- Try the preset buttons to jump to key sizes
- Check the breakpoint table in the demo page

**Q: Theme not applying**
- Select theme from the dropdown
- Theme persists to localStorage automatically
- Refresh page to verify theme is saved

**Q: CSS not loading**
- Make sure `dist/output.css` exists
- Run `npm run build` if needed
- Check browser console for errors

## Next Steps

1. **Explore the Demo** (5 minutes)
   - Try all 5 layouts
   - Test all breakpoints
   - Switch themes

2. **Read the Docs** (15 minutes)
   - Open `README.md` for full documentation
   - Check `QUICK_START.md` for usage examples

3. **Use in Your Project** (30 minutes)
   - Copy the classes you need
   - Customize breakpoints in `src/input.css`
   - Build and deploy!

## Need Help?

- **Full Documentation**: `README.md`
- **Code Examples**: `QUICK_START.md`
- **Technical Details**: `IMPLEMENTATION_SUMMARY.md`
- **Browser DevTools**: Inspect container queries in action

## What You're Seeing

This demo showcases:
- CSS Container Queries (the future of responsive design)
- Scalable typography using clamp() and cqw units
- DaisyUI component integration (29 themes!)
- Smooth transitions and animations
- Full accessibility (ARIA, keyboard nav)
- 60fps performance

## Why This Matters

Traditional responsive design breaks when components are reused in different contexts (narrow sidebar vs wide main content). Container queries solve this by letting components adapt to their container size, making them truly reusable.

---

**Ready?** Open `index.html` and start exploring! 🚀

Drag that resize handle and watch the magic happen!
