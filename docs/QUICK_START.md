# Quick Start Guide

## Getting Started in 3 Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Build CSS
```bash
npm run build
```

### 3. Open Demo
Open `index.html` in your browser and start experimenting!

## Key Features to Try

### Resize the Container
1. Look for the dashed border container on the demo page
2. Drag the handle on the right edge
3. Watch how the card layout adapts at different sizes

### Test Specific Breakpoints
Click the preset buttons to jump to key sizes:
- **250px** - Mobile (single column)
- **450px** - Tablet (2 columns)
- **650px** - Desktop small (3 columns)
- **900px** - Desktop large (full layout)

### Switch Layouts
Use the dropdown to switch between:
1. **Sidebar** - Perfect for product cards
2. **Feature** - Great for feature grids
3. **Masonry** - Ideal for galleries
4. **Dashboard** - Best for analytics
5. **Split** - Good for profiles

### Change Themes
Select from 29 DaisyUI themes to see how the system works with different color schemes.

## Using in Your Project

### Basic Setup

```html
<!-- 1. Include the compiled CSS -->
<link rel="stylesheet" href="./dist/output.css">

<!-- 2. Wrap your content in a container query context -->
<div class="card-container">

  <!-- 3. Use any layout pattern -->
  <div class="sidebar-layout">
    <img src="image.jpg" class="sidebar-image">
    <div class="sidebar-content">
      <h2 class="adaptive-text-2xl">Title</h2>
      <p class="adaptive-text-base">Content</p>
    </div>
  </div>

</div>
```

## Understanding Container Queries

### What's the Difference?

**Media Queries** (old way):
```css
@media (min-width: 600px) {
  /* Responds to VIEWPORT width */
}
```

**Container Queries** (new way):
```css
@container card (min-width: 600px) {
  /* Responds to CONTAINER width */
}
```

### Why It Matters

Container queries allow components to be truly modular. A card can be:
- Wide in a main content area
- Narrow in a sidebar
- Full-width on mobile

And it will **always** adapt correctly, regardless of where it's placed.

## Scalable Typography & Spacing

### The Magic of clamp() and cqw

```css
/* Traditional fixed sizing */
font-size: 16px; /* Always 16px */

/* Scalable with container queries */
font-size: clamp(1rem, 2.5cqw, 1.125rem);
/*
  - Minimum: 1rem (16px)
  - Preferred: 2.5cqw (2.5% of container width)
  - Maximum: 1.125rem (18px)
*/
```

This means:
- In a 300px container: ~16px (minimum)
- In a 600px container: ~17px (scales)
- In a 1000px container: ~18px (maximum)

## Common Use Cases

### 1. Product Cards in E-commerce
```html
<div class="card-container">
  <div class="sidebar-layout">
    <img src="product.jpg" class="sidebar-image">
    <div class="sidebar-content">
      <h2 class="adaptive-text-xl">Product Name</h2>
      <p class="adaptive-text-base">$99.99</p>
      <button class="btn btn-primary">Add to Cart</button>
    </div>
  </div>
</div>
```

### 2. Blog Post Previews
```html
<div class="card-container">
  <div class="sidebar-layout">
    <img src="post-thumbnail.jpg" class="sidebar-image">
    <div class="sidebar-content">
      <h2 class="adaptive-text-2xl">Article Title</h2>
      <p class="adaptive-text-sm opacity-70">Published on May 1, 2024</p>
      <p class="adaptive-text-base">Article excerpt...</p>
      <a href="#" class="btn btn-ghost">Read More</a>
    </div>
  </div>
</div>
```

### 3. Feature Showcase
```html
<div class="card-container">
  <div class="feature-layout">
    <div class="feature-header">
      <h2 class="adaptive-text-2xl">Why Choose Us</h2>
    </div>
    <div class="feature-grid">
      <div class="feature-item">
        <h3 class="adaptive-text-lg">Fast</h3>
        <p class="adaptive-text-sm">Lightning quick</p>
      </div>
      <!-- More features... -->
    </div>
  </div>
</div>
```

### 4. User Dashboard
```html
<div class="card-container">
  <div class="dashboard-layout">
    <div class="dashboard-header">
      <h2 class="adaptive-text-xl">Analytics Dashboard</h2>
    </div>
    <div class="dashboard-sidebar">
      <!-- Navigation -->
    </div>
    <div class="dashboard-main">
      <div class="dashboard-widget">Metric 1</div>
      <div class="dashboard-widget">Metric 2</div>
    </div>
  </div>
</div>
```

## Tips for Best Results

1. **Always wrap in `.card-container`** - This enables container queries
2. **Use adaptive text classes** - They scale with container size
3. **Test at multiple sizes** - Use the preset buttons in the demo
4. **Start mobile-first** - Default to single column, enhance for larger sizes
5. **Combine with DaisyUI** - All DaisyUI utilities work perfectly

## Browser Support Check

```javascript
// Check if container queries are supported
if (CSS.supports('container-type: inline-size')) {
  console.log('Container queries supported!');
} else {
  console.log('Fallback to mobile layout');
}
```

## Next Steps

1. Read the full README.md for detailed documentation
2. Explore the demo page and resize containers
3. Try different themes and layouts
4. Copy the patterns you need into your project
5. Customize breakpoints and styles in `src/input.css`

## Need Help?

- Check browser DevTools for container size debugging
- Use the FPS counter to monitor performance
- Test keyboard navigation (Tab, Arrow keys, Home, End)
- Verify accessibility with screen readers

Happy building!
