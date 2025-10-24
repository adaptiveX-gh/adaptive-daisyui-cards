# Adaptive Cards Platform API - Phase 3

Version 0.3.0 | Phase 3 Complete - SSE Streaming Architecture

## Overview

The Adaptive Cards Platform API is a REST API for generating presentation-ready, responsive card layouts with deterministic content. Built on top of the existing Adaptive DaisyUI Cards system, it provides programmatic access to create professional presentations with container-query responsive designs.

## Features

### Phase 1 (Complete)

- **Card Generation API**: Generate single cards with layout-specific content
- **Presentation Generation**: Create complete 4-8 card presentations for topics
- **Template Engine**: 5 essential layouts (split, numbered-list, grid, hero, hero-overlay, content-bullets)
- **Theme Support**: 13+ DaisyUI themes with typography customization
- **Export Options**: JSON and HTML export
- **Live Preview**: Browser-based presentation preview
- **Deterministic Content**: Pre-built content for 3 MVP topics

### Phase 2 (Complete)

- **Multi-Provider Image Generation**: Gemini AI and instant placeholders
- **Smart Fallback Chain**: Automatic provider fallback (Gemini → Placeholder)
- **Async Image Processing**: Non-blocking background generation
- **Instant Placeholders**: Beautiful SVG placeholders (geometric, pattern, solid)
- **Prompt Enhancement**: Context-aware prompt optimization
- **Status Tracking**: Real-time generation monitoring
- **Theme-Aware Placeholders**: Placeholders match card themes

### Phase 3 (Current - NEW)

- **SSE Streaming Architecture**: Progressive card assembly with Server-Sent Events
- **Stage-Based Pipeline**: 5-stage streaming (skeleton → content → style → placeholder → image)
- **Real-Time Updates**: Stream image generation progress as it happens
- **Connection Management**: Heartbeat, reconnection, and graceful cleanup
- **Instant Visual Feedback**: Skeleton structure in <100ms
- **Non-Blocking Images**: Content appears immediately, images stream when ready
- **Resilient Clients**: Handle out-of-order messages and missing stages

### Future Phases

- **Phase 4**: LLM-based intelligent content generation

## Quick Start

### Installation

```bash
# Install dependencies
npm install

# Build CSS assets
npm run build
```

### Configure Environment (Phase 2 - NEW)

```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your Gemini API key (optional)
GEMINI_API_KEY=your_api_key_here

# Or use mock mode for testing
GEMINI_MOCK_MODE=true
```

### Start API Server

```bash
# Production mode
npm run api

# Development mode (with auto-reload)
npm run api:dev
```

Server runs on `http://localhost:3000`

### Your First Request

Generate a presentation:

```bash
curl -X POST http://localhost:3000/api/presentations/generate \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "AI in Product Discovery",
    "cardCount": 6,
    "style": "professional"
  }'
```

Preview in browser:

```
http://localhost:3000/api/presentations/preview/AI%20in%20Product%20Discovery?theme=corporate
```

## Project Structure

```
api/
├── server.js                         # Express server entry point
├── routes/
│   ├── cards.js                     # Card generation endpoints
│   ├── presentations.js             # Presentation endpoints
│   ├── images.js                    # Image generation endpoints (Phase 2)
│   └── streaming.js                 # SSE streaming endpoints (Phase 3)
├── services/
│   ├── TemplateEngine.js            # Layout rendering with Handlebars
│   ├── ContentGenerator.js          # Deterministic content mapping
│   ├── ThemeService.js              # DaisyUI theme management
│   ├── ImageGenerationService.js    # Image generation orchestrator (Phase 2, EventEmitter in Phase 3)
│   ├── PlaceholderService.js        # SVG placeholder generator (Phase 2)
│   ├── ImageStatusStore.js          # In-memory status tracking (Phase 2)
│   ├── StreamingService.js          # SSE streaming service (Phase 3)
│   └── ConnectionStore.js           # SSE connection management (Phase 3)
├── middleware/
│   └── sseSetup.js                  # SSE headers and validation (Phase 3)
├── adapters/                        # Image provider adapters (Phase 2)
│   ├── BaseImageAdapter.js          # Abstract base class
│   ├── GeminiImageAdapter.js        # Google Gemini AI
│   ├── PlaceholderAdapter.js        # Instant placeholders
│   └── README.md                    # Adapter documentation
├── utils/
│   ├── promptEnhancer.js            # Image prompt enhancement (Phase 2)
│   └── sseFormatter.js              # SSE message formatting (Phase 3)
├── models/
│   ├── Card.js                      # Card data model
│   └── schemas.js                   # Layout-specific content schemas
└── templates/
    ├── split.html                   # Split layout template
    ├── numbered-list.html           # Numbered list template
    ├── grid.html                    # Grid layout template
    ├── hero.html                    # Hero layout template
    ├── hero-overlay.html            # Hero overlay template
    └── content-bullets.html         # Content bullets template
```

## API Endpoints

### Core Endpoints (Phase 1)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/cards/generate-content` | POST | Generate single card content |
| `/api/presentations/generate` | POST | Generate complete presentation |
| `/api/presentations/preview/:topic` | GET | Quick browser preview |
| `/api/cards/render` | POST | Render card to HTML |
| `/api/presentations/export` | POST | Export presentation (JSON/HTML) |
| `/api/themes` | GET | List available themes |
| `/api/cards/layouts` | GET | List available layouts |
| `/api/cards/topics` | GET | List available topics |

### Image Generation Endpoints (Phase 2)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/images/:cardId/status` | GET | Get image generation status |
| `/api/images/regenerate` | POST | Regenerate image with different provider |
| `/api/images/:cardId` | DELETE | Cancel image generation |
| `/api/images/providers` | GET | Get all provider statuses |
| `/api/images/stats` | GET | Get generation statistics |

See [IMAGE-GENERATION.md](./docs/IMAGE-GENERATION.md) for comprehensive image generation guide.

### SSE Streaming Endpoints (Phase 3 - NEW)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/presentations/stream` | POST | Stream presentation generation (SSE) |
| `/api/cards/stream` | POST | Stream single card generation (SSE) |
| `/api/stream/demo` | GET | Demo SSE streaming with configurable delays |

See [SSE-STREAMING.md](./docs/SSE-STREAMING.md) for comprehensive streaming guide.

## Available Layouts

1. **split** - Text + image side-by-side
2. **numbered-list** - Ordered list with large numbers
3. **grid** - 2x2 content grid
4. **hero** - Large title with side image
5. **hero-overlay** - Title overlaid on full-bleed image
6. **content-bullets** - Title with bulleted list

All layouts are fully responsive using CSS Container Queries.

## Image Generation (Phase 2 - NEW)

### Quick Start: Generate Card with Image

```bash
curl -X POST http://localhost:3000/api/cards/generate-content \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "AI in Product Discovery",
    "layoutType": "hero",
    "style": "professional",
    "generateImage": true,
    "imageProvider": "gemini"
  }'
```

Response includes placeholder immediately:

```json
{
  "card": {
    "id": "uuid...",
    "image": {
      "status": "generating",
      "provider": "gemini",
      "placeholder": {
        "type": "geometric",
        "url": "data:image/svg+xml;base64,...",
        "loadingState": true
      }
    }
  }
}
```

### Check Image Status

```bash
curl http://localhost:3000/api/images/{cardId}/status
```

### Generate Presentation with Images

```bash
curl -X POST http://localhost:3000/api/presentations/generate \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Digital Marketing Trends 2025",
    "cardCount": 6,
    "includeImages": true,
    "provider": "gemini"
  }'
```

### Available Providers

- **gemini**: Google Gemini AI (requires API key or mock mode)
- **placeholder**: Instant SVG placeholders (always available)

### Placeholder Types

Three beautiful placeholder patterns:

1. **Geometric**: Triangles, circles, polygons, diagonal stripes
2. **Pattern**: Dots, lines, waves, grids
3. **Solid**: Gradient backgrounds

All placeholders are:
- Deterministic (same content = same placeholder)
- Theme-aware (use card theme colors)
- Instant (<50ms generation)
- Lightweight (2-10KB SVG)

See [PLACEHOLDER-SYSTEM.md](./docs/PLACEHOLDER-SYSTEM.md) for details.

## MVP Topics (Phase 1)

Deterministic content is available for:

1. **AI in Product Discovery**
   - 6 sections covering AI-powered product development

2. **Digital Marketing Trends 2025**
   - 6 sections on emerging marketing strategies

3. **Remote Team Management**
   - 6 sections on distributed team best practices

## Themes

13+ DaisyUI themes grouped by personality:

- **Professional**: light, dark, corporate, business
- **Bold**: cyberpunk, synthwave, dracula
- **Soft**: cupcake, pastel, valentine
- **Quirky**: retro, halloween, forest

## Architecture

### Service Layer

**TemplateEngine** (`services/TemplateEngine.js`)
- Loads and compiles Handlebars templates
- Renders cards with layout-specific logic
- Generates complete HTML pages with theme support
- Exports presentations in multiple formats

**ImageGenerationService** (`services/ImageGenerationService.js`) - Phase 2
- Orchestrates multi-provider image generation
- Manages fallback chain (Gemini → Placeholder)
- Handles async background processing
- Tracks generation status in memory

**PlaceholderService** (`services/PlaceholderService.js`) - Phase 2
- Generates SVG placeholders (geometric, pattern, solid)
- Deterministic selection based on content hash
- Theme-aware color extraction
- Instant generation (<50ms)

**ContentGenerator** (`services/ContentGenerator.js`)
- Maps topics to structured content
- Provides deterministic content for Phase 1
- Will integrate with LLMs in Phase 4

**ThemeService** (`services/ThemeService.js`)
- Manages DaisyUI theme configurations
- Provides theme recommendations by style/use case
- Handles custom theme merging

### Data Models

**Card** (`models/Card.js`)
- Core card data structure
- Validation against layout schemas
- UUID generation
- JSON serialization

**Schemas** (`models/schemas.js`)
- Layout-specific content validation
- Type checking and required field enforcement
- Support for nested objects and arrays

## Testing

Unit tests cover core services:

```bash
# Run all tests
npm test

# Run API tests specifically
npm test -- tests/api

# Run with coverage
npm run test:coverage
```

Test files:
- `tests/api/ContentGenerator.test.js` - Content generation logic
- `tests/api/TemplateEngine.test.js` - Template rendering
- `tests/api/ThemeService.test.js` - Theme management

## Example Usage

### Generate and Export Presentation

```javascript
import fetch from 'node-fetch';
import fs from 'fs';

// 1. Generate presentation
const response = await fetch('http://localhost:3000/api/presentations/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    topic: 'AI in Product Discovery',
    cardCount: 6,
    style: 'professional',
    theme: { name: 'corporate' }
  })
});

const presentation = await response.json();

// 2. Export as HTML
const exportResponse = await fetch('http://localhost:3000/api/presentations/export', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    cards: presentation.cards,
    format: 'html',
    options: {
      title: 'AI Product Discovery',
      theme: 'corporate',
      includeControls: true
    }
  })
});

const html = await exportResponse.text();
fs.writeFileSync('presentation.html', html);
```

### Generate Single Card

```javascript
const response = await fetch('http://localhost:3000/api/cards/generate-content', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    topic: 'Digital Marketing Trends 2025',
    layoutType: 'numbered-list',
    style: 'professional'
  })
});

const { card } = await response.json();
console.log(card);
```

## Integration with Existing Project

The API seamlessly integrates with the existing Adaptive DaisyUI Cards demo:

- **Reuses CSS**: Uses the same `dist/output.css` with container queries
- **Same themes**: All 29 DaisyUI themes from the demo
- **Consistent layouts**: API-generated cards match demo layouts exactly
- **Shared patterns**: Container query classes, adaptive typography, theme-aware styles

## Development

### Running Alongside Vite

```bash
# Terminal 1: Vite dev server (demo page)
npm run dev

# Terminal 2: API server
npm run api:dev
```

Vite runs on `http://localhost:5173`, API on `http://localhost:3000`.

### Adding New Content

To add a new topic to the content database:

1. Edit `api/services/ContentGenerator.js`
2. Add topic to `CONTENT_DATABASE` object
3. Follow existing structure with sections for each layout
4. Restart server

### Adding New Layouts

To add a new layout:

1. Create HTML template in `api/templates/`
2. Update `TemplateEngine.loadTemplates()` to include new layout
3. Add layout validation in `models/Card.js`
4. Define content schema in `models/schemas.js`
5. Add sample content in `ContentGenerator.js`

## Performance

Phase 1 performance characteristics:

- **Card generation**: <50ms (deterministic, no API calls)
- **Template rendering**: <10ms per card
- **Complete presentation**: <200ms for 6 cards
- **HTML export**: <100ms

Phase 2+ will introduce async image generation with placeholders.

## Security Considerations

Phase 1 security:

- No authentication (add in production)
- No rate limiting (add before public deployment)
- Input validation on all endpoints
- No PII processing
- CORS enabled for development

## Browser Support

Generated HTML works in all modern browsers with:

- CSS Container Queries support (Chrome 105+, Safari 16+, Firefox 110+)
- Modern JavaScript (ES6+)

Fallback gracefully in older browsers to single-column layout.

## Accessibility

All generated cards include:

- Semantic HTML elements
- ARIA roles where appropriate
- Keyboard navigation support
- Color contrast AA compliance (via DaisyUI themes)
- Screen reader compatibility

## Troubleshooting

### Port 3000 already in use

```bash
# Use custom port
PORT=3001 npm run api
```

### Templates not found

Ensure you're running from project root and template files exist:

```bash
ls api/templates/
```

### CSS not loading in preview

Build the CSS first:

```bash
npm run build
```

### Unknown topic error

Check available topics:

```bash
curl http://localhost:3000/api/cards/topics
```

## Contributing

When adding features:

1. Follow existing code patterns
2. Add unit tests for new services
3. Update schemas for new layouts
4. Document in API-USAGE.md
5. Maintain backward compatibility

## SSE Streaming (Phase 3 - NEW)

### Quick Start: Stream a Presentation

```bash
# Using curl with SSE (limited, for demo only)
curl -N -H "Accept: text/event-stream" \
  -H "Content-Type: application/json" \
  -X POST http://localhost:3000/api/presentations/stream \
  -d '{"topic":"AI in Product Discovery","cardCount":3,"includeImages":false}'

# Better: Use the test client in browser
# http://localhost:3000/tests/api/streaming-client.html
```

### JavaScript Client Example

```javascript
fetch('http://localhost:3000/api/presentations/stream', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'text/event-stream'
  },
  body: JSON.stringify({
    topic: 'AI in Product Discovery',
    cardCount: 6,
    includeImages: true
  })
}).then(response => {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  function readStream() {
    reader.read().then(({ done, value }) => {
      if (done) return;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.substring(6));
          handleStage(data);
        }
      }

      readStream();
    });
  }

  readStream();
});

function handleStage(data) {
  switch(data.stage) {
    case 'skeleton':
      renderSkeleton(data.cards);
      break;
    case 'content':
      updateContent(data.cardId, data.section, data.content);
      break;
    case 'placeholder':
      showPlaceholder(data.cardId, data.placeholder);
      break;
    case 'image':
      swapImage(data.cardId, data.image);
      break;
  }
}
```

### Streaming Stages

1. **Skeleton** (50ms) - Card structure and layout
2. **Content** (100-200ms) - Text sections
3. **Style** (50ms) - Theme colors and classes
4. **Placeholder** (50ms) - Image placeholders
5. **Image** (0-30s) - Final generated images (async)

**Time to Interactive**: <350ms (without images)

### Test Client

Open the visual test client:
```
http://localhost:3000/tests/api/streaming-client.html
```

Features:
- Real-time event visualization
- Configurable stage delays
- Multiple presentation options
- Network monitoring

### Documentation

- **[SSE-STREAMING.md](./docs/SSE-STREAMING.md)** - Complete streaming architecture guide
- **[SSE-CLIENT-GUIDE.md](./docs/SSE-CLIENT-GUIDE.md)** - Client implementation patterns
- **[streaming-client.html](./tests/api/streaming-client.html)** - Reference implementation

## Roadmap

### Phase 2 (Weeks 3-4) - COMPLETE
- Multi-provider image generation
- Smart placeholder system
- Fallback chain (Gemini → patterns → geometric)

### Phase 3 (Week 5) - COMPLETE
- SSE streaming endpoint
- Progressive rendering stages
- Real-time image updates
- Connection management with heartbeat

### Phase 4 (Weeks 6-7) - UPCOMING
- LLM integration (Gemini)
- Context-aware content generation
- Dynamic image prompt creation
- Custom topic support

## License

MIT License - Same as parent project

## Resources

- **API Specification**: [docs/API-SPEC.md](./docs/API-SPEC.md)
- **Usage Guide**: [docs/API-USAGE.md](./docs/API-USAGE.md)
- **SSE Streaming**: [docs/SSE-STREAMING.md](./docs/SSE-STREAMING.md)
- **Client Guide**: [docs/SSE-CLIENT-GUIDE.md](./docs/SSE-CLIENT-GUIDE.md)
- **Image Generation**: [docs/IMAGE-GENERATION.md](./docs/IMAGE-GENERATION.md)
- **Placeholder System**: [docs/PLACEHOLDER-SYSTEM.md](./docs/PLACEHOLDER-SYSTEM.md)
- **Project README**: [CLAUDE.md](./CLAUDE.md)

## Support

For issues or questions:

1. Check troubleshooting section above
2. Review API-USAGE.md for examples
3. Verify server is running and accessible
4. Check console logs for errors

---

Built with Express, Handlebars, and the existing Adaptive DaisyUI Cards system.
