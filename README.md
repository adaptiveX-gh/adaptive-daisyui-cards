# Adaptive DaisyUI Cards

A demonstration of adaptive card layouts using CSS Container Queries with DaisyUI and Tailwind CSS.

**NEW**: Now includes a REST API for programmatic card generation! See [API Documentation](#-api-phase-1) below.

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

- **7 Responsive Layouts**: Sidebar, Feature, Masonry, Dashboard, Split, Hero/Presentation, Hero Overlay
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

### 6. Hero/Presentation Layout
- **Large**: 50/50 split with full-bleed image
- **Small**: Vertical stack with image on top
- **Typography**: Extra large, bold titles optimized for presentations
- **Variants**: Supports image-left or image-right placement
- **Use case**: Presentation slides, hero sections, landing pages

### 7. Hero Overlay Layout
- **All sizes**: Content overlays full-bleed background image
- **Features**: Gradient overlay for text readability, white text with shadow
- **Typography**: Same presentation-optimized typography as hero layout
- **Use case**: Card-style presentation slides, feature highlights, call-to-action cards

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
# Frontend Demo
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build

# API Server (Phase 1)
npm run api        # Start API server (port 3000)
npm run api:dev    # Start API with auto-reload

# Testing
npm test           # Run all tests
npm run test:e2e   # Run end-to-end tests
npm run test:coverage  # Run tests with coverage
```

## 🌐 Browser Support

Container Queries are supported in:
- Chrome 105+
- Safari 16+
- Firefox 110+
- Edge 105+

## 🔌 API (Phase 1)

The Adaptive Cards Platform now includes a REST API for generating presentations programmatically!

### Quick Start

```bash
# Start API server
npm run api

# Generate a presentation
curl -X POST http://localhost:3000/api/presentations/generate \
  -H "Content-Type: application/json" \
  -d '{"topic": "AI in Product Discovery", "cardCount": 6}'

# Preview in browser
open http://localhost:3000/api/presentations/preview/AI%20in%20Product%20Discovery
```

### Key Features

- **2 Core Endpoints**: Generate single cards or complete presentations
- **5 Layouts**: split, numbered-list, grid, hero, hero-overlay, content-bullets
- **13+ Themes**: All DaisyUI themes supported
- **3 MVP Topics**: AI in Product Discovery, Digital Marketing Trends 2025, Remote Team Management
- **Export Options**: JSON and HTML export
- **Live Preview**: Browser-based presentation rendering

### API Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /api/cards/generate-content` | Generate single card |
| `POST /api/presentations/generate` | Generate complete presentation |
| `GET /api/presentations/preview/:topic` | Live browser preview |
| `GET /api/themes` | List all themes |
| `GET /api/cards/layouts` | List all layouts |

### Example: Generate Presentation

```bash
curl -X POST http://localhost:3000/api/presentations/generate \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "AI in Product Discovery",
    "cardCount": 6,
    "style": "professional",
    "theme": {"name": "corporate"}
  }'
```

### Documentation

- **[API README](./API-README.md)** - Complete API overview
- **[API Usage Guide](./docs/API-USAGE.md)** - Detailed endpoint documentation
- **[API Specification](./docs/API-SPEC.md)** - Full technical specification
- **[Example Requests](./docs/API-EXAMPLES.sh)** - Curl examples

## 📚 Documentation

- [Quick Start Guide](./docs/QUICK_START.md)
- [Testing Guide](./docs/TESTING.md)
- [Implementation Details](./docs/IMPLEMENTATION_SUMMARY.md)
- [API Documentation](./API-README.md) - NEW!

## 📄 License

MIT

## 🙏 Credits

Built with [Tailwind CSS](https://tailwindcss.com/), [DaisyUI](https://daisyui.com/), and [@tailwindcss/container-queries](https://github.com/tailwindlabs/tailwindcss-container-queries)
