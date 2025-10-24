# Adaptive DaisyUI Cards

A demonstration of adaptive card layouts using CSS Container Queries with DaisyUI and Tailwind CSS.

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run development server**
   ```bash
   npm run dev
   ```

3. **Open in browser**
   ```
   http://localhost:5173
   ```

## ✨ Features

- **5 Responsive Layouts**: Sidebar, Feature, Masonry, Dashboard, Split
- **Container Queries**: Cards adapt to their container size, not viewport
- **Scalable Typography**: Text sizes scale proportionally with clamp() and cqw units
- **29 DaisyUI Themes**: Full theme support
- **Interactive Demo**: Drag-to-resize container with real-time feedback
- **Smooth Transitions**: 300ms transitions between layout changes
- **Fully Accessible**: ARIA labels, keyboard navigation, screen reader support

## 📐 Container Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| xs | < 250px | Minimal layout |
| sm | 250-399px | Compact layout |
| md | 400-599px | Balanced layout |
| lg | 600-799px | Expanded layout |
| xl | 800px+ | Full-featured |

## 🎨 Layouts

### 1. Sidebar Layout
- **Large**: Image left (300px) | Content right
- **Small**: Image top | Content bottom (stacked)
- **Use case**: Product cards, blog posts

### 2. Feature Layout
- **Large**: 3-column grid
- **Medium**: 2-column grid
- **Small**: Single column
- **Use case**: Feature showcases, service listings

### 3. Masonry Layout
- **Large**: 3 columns
- **Medium**: 2 columns
- **Small**: 1 column
- **Use case**: Image galleries, portfolio

### 4. Dashboard Layout
- **Large**: Header + Sidebar + Main (2x2 grid) + Footer
- **Medium**: Header + Main (2-col) + Footer
- **Small**: Vertical stack
- **Use case**: Analytics dashboards, admin panels

### 5. Split Layout
- **Large**: 50/50 horizontal
- **Medium**: 60/40 horizontal
- **Small**: Vertical stack
- **Use case**: User profiles, comparisons

## 🛠️ Tech Stack

- **Tailwind CSS** v3.4+ - Utility-first CSS framework
- **DaisyUI** v4+ - Beautiful component library
- **@tailwindcss/container-queries** - Container query support
- **Vite** - Fast build tool and dev server

## 📦 Project Structure

```
slideo/
├── src/
│   ├── input.css          # Main styles with container queries
│   └── app.js             # Interactive functionality
├── dist/
│   └── output.css         # Compiled CSS
├── tests/                 # Test suites
├── docs/                  # Additional documentation
├── index.html             # Demo page
├── tailwind.config.js     # Tailwind configuration
└── package.json           # Dependencies and scripts
```

## 🎯 Usage Example

```html
<!-- Container provides container query context -->
<div class="card-container">

  <!-- Card with layout class -->
  <div class="sidebar-layout layout-card">
    <img src="image.jpg" class="sidebar-image" alt="Product">
    <div class="sidebar-content">
      <h2 class="adaptive-text-2xl">Product Title</h2>
      <p class="adaptive-text-base">Description...</p>
      <button class="btn btn-primary">Buy Now</button>
    </div>
  </div>

</div>
```

## 📝 Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm test           # Run all tests
npm run test:e2e   # Run end-to-end tests
```

## 🌐 Browser Support

Container Queries are supported in:
- Chrome 105+
- Safari 16+
- Firefox 110+
- Edge 105+

## 📚 Documentation

- [Quick Start Guide](./docs/QUICK_START.md)
- [Testing Guide](./docs/TESTING.md)
- [Implementation Details](./docs/IMPLEMENTATION_SUMMARY.md)

## 📄 License

MIT

## 🙏 Credits

Built with [Tailwind CSS](https://tailwindcss.com/), [DaisyUI](https://daisyui.com/), and [@tailwindcss/container-queries](https://github.com/tailwindlabs/tailwindcss-container-queries)
