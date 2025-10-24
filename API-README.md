# Adaptive Cards Platform API - Phase 1

Version 0.1.0 | Phase 1 Complete

## Overview

The Adaptive Cards Platform API is a REST API for generating presentation-ready, responsive card layouts with deterministic content. Built on top of the existing Adaptive DaisyUI Cards system, it provides programmatic access to create professional presentations with container-query responsive designs.

## Features

### Phase 1 (Current)

- **Card Generation API**: Generate single cards with layout-specific content
- **Presentation Generation**: Create complete 4-8 card presentations for topics
- **Template Engine**: 5 essential layouts (split, numbered-list, grid, hero, hero-overlay, content-bullets)
- **Theme Support**: 13+ DaisyUI themes with typography customization
- **Export Options**: JSON and HTML export
- **Live Preview**: Browser-based presentation preview
- **Deterministic Content**: Pre-built content for 3 MVP topics

### Future Phases

- **Phase 2**: Multi-provider image generation (Gemini, DALL-E, Stable Diffusion)
- **Phase 3**: SSE streaming for progressive rendering
- **Phase 4**: LLM-based intelligent content generation

## Quick Start

### Installation

```bash
# Install dependencies
npm install

# Build CSS assets
npm run build
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
├── server.js                  # Express server entry point
├── routes/
│   ├── cards.js              # Card generation endpoints
│   └── presentations.js      # Presentation endpoints
├── services/
│   ├── TemplateEngine.js     # Layout rendering with Handlebars
│   ├── ContentGenerator.js   # Deterministic content mapping
│   └── ThemeService.js       # DaisyUI theme management
├── models/
│   ├── Card.js               # Card data model
│   └── schemas.js            # Layout-specific content schemas
└── templates/
    ├── split.html            # Split layout template
    ├── numbered-list.html    # Numbered list template
    ├── grid.html             # Grid layout template
    ├── hero.html             # Hero layout template
    ├── hero-overlay.html     # Hero overlay template
    └── content-bullets.html  # Content bullets template
```

## API Endpoints

### Core Endpoints

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

See [API-USAGE.md](./docs/API-USAGE.md) for detailed documentation and examples.

## Available Layouts

1. **split** - Text + image side-by-side
2. **numbered-list** - Ordered list with large numbers
3. **grid** - 2x2 content grid
4. **hero** - Large title with side image
5. **hero-overlay** - Title overlaid on full-bleed image
6. **content-bullets** - Title with bulleted list

All layouts are fully responsive using CSS Container Queries.

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

## Roadmap

### Phase 2 (Weeks 3-4)
- Multi-provider image generation
- Smart placeholder system
- Fallback chain (Gemini → patterns → geometric)

### Phase 3 (Week 5)
- SSE streaming endpoint
- Progressive rendering stages
- Real-time image updates

### Phase 4 (Weeks 6-7)
- LLM integration (Gemini)
- Context-aware content generation
- Dynamic image prompt creation
- Custom topic support

## License

MIT License - Same as parent project

## Resources

- **API Specification**: [docs/API-SPEC.md](./docs/API-SPEC.md)
- **Usage Guide**: [docs/API-USAGE.md](./docs/API-USAGE.md)
- **Project README**: [CLAUDE.md](./CLAUDE.md)

## Support

For issues or questions:

1. Check troubleshooting section above
2. Review API-USAGE.md for examples
3. Verify server is running and accessible
4. Check console logs for errors

---

Built with Express, Handlebars, and the existing Adaptive DaisyUI Cards system.
