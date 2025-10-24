# Phase 1 Architecture Summary

## Overview

Phase 1 implements a REST API layer on top of the existing Adaptive DaisyUI Cards system, providing programmatic access to card generation and presentation assembly.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Client                               │
│  (Browser, curl, JavaScript, etc.)                          │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP/REST
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Express Server                            │
│                   (api/server.js)                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐      ┌──────────────────┐            │
│  │  Cards Routes    │      │ Presentations    │            │
│  │  /api/cards/*    │      │  Routes          │            │
│  │                  │      │  /api/presentations/*         │
│  └────────┬─────────┘      └────────┬─────────┘            │
│           │                          │                       │
│           └──────────┬───────────────┘                       │
│                      ▼                                       │
│         ┌──────────────────────────┐                        │
│         │   Service Layer          │                        │
│         ├──────────────────────────┤                        │
│         │  TemplateEngine          │                        │
│         │  ContentGenerator        │                        │
│         │  ThemeService            │                        │
│         └────────┬─────────────────┘                        │
│                  │                                           │
│                  ▼                                           │
│         ┌──────────────────────────┐                        │
│         │   Data Models            │                        │
│         ├──────────────────────────┤                        │
│         │  Card                    │                        │
│         │  Schemas (validation)    │                        │
│         └──────────────────────────┘                        │
│                                                              │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
          ┌────────────────────────┐
          │  Handlebars Templates  │
          │  (api/templates/)      │
          └────────────────────────┘
                       │
                       ▼
          ┌────────────────────────┐
          │  Compiled CSS          │
          │  (dist/output.css)     │
          └────────────────────────┘
```

## Component Details

### 1. Express Server (`api/server.js`)

**Responsibilities:**
- HTTP server setup and middleware configuration
- Route mounting
- CORS handling
- Static file serving (CSS assets)
- Error handling
- Request logging

**Key Features:**
- Port: 3000 (configurable via PORT env var)
- JSON body parsing (10MB limit)
- Health check endpoint
- API discovery endpoint

### 2. Route Handlers

#### Cards Routes (`api/routes/cards.js`)

**Endpoints:**
- `POST /api/cards/generate-content` - Single card generation
- `POST /api/cards/render` - Card to HTML conversion
- `GET /api/cards/layouts` - Layout metadata
- `GET /api/cards/topics` - Available topics

**Responsibilities:**
- Request validation
- Service orchestration
- Response formatting
- Error handling

#### Presentations Routes (`api/routes/presentations.js`)

**Endpoints:**
- `POST /api/presentations/generate` - Multi-card generation
- `POST /api/presentations/render` - Presentation to HTML
- `POST /api/presentations/export` - Export (JSON/HTML/bundle)
- `GET /api/presentations/preview/:topic` - Browser preview

**Responsibilities:**
- Presentation assembly logic
- Format conversion
- Export functionality
- Live preview rendering

### 3. Service Layer

#### TemplateEngine (`api/services/TemplateEngine.js`)

**Responsibilities:**
- Load and compile Handlebars templates
- Render cards to HTML snippets
- Generate complete HTML pages
- Export presentations in multiple formats
- Inject theme and styling

**Key Methods:**
- `render(card)` - Single card to HTML
- `renderCards(cards, options)` - Multiple cards with container
- `renderPage(cards, options)` - Complete HTML page
- `renderSkeleton(layout, id)` - Placeholder skeleton
- `exportJSON(cards)` - JSON export
- `exportBundle(cards, options)` - Static bundle

**Template System:**
- Uses Handlebars for templating
- One template per layout type
- Custom helpers for list numbering, conditionals
- Supports nested data structures

#### ContentGenerator (`api/services/ContentGenerator.js`)

**Responsibilities:**
- Map topics to structured content
- Content selection based on layout type
- Presentation assembly
- Topic and section discovery

**Key Methods:**
- `generateCardContent(spec)` - Single card content
- `generatePresentation(spec)` - Complete presentation
- `getAvailableTopics()` - Topic list
- `getTopicSections(topic)` - Section list

**Data Structure:**
```javascript
CONTENT_DATABASE = {
  'Topic Name': {
    sectionName: {
      layout: 'layout-type',
      content: { /* layout-specific content */ }
    },
    ...
  }
}
```

**Current Topics:**
1. AI in Product Discovery (6 sections)
2. Digital Marketing Trends 2025 (6 sections)
3. Remote Team Management (6 sections)

#### ThemeService (`api/services/ThemeService.js`)

**Responsibilities:**
- Theme configuration management
- Theme selection by name/style
- Color palette management
- Typography classification

**Key Methods:**
- `getTheme(name)` - Get theme by name
- `getThemeByStyle(style)` - Get theme by mood
- `normalizeTheme(input)` - Validate and merge themes
- `getTypographyClass(theme)` - Get typography personality
- `getRecommendedThemes(useCase)` - Get theme recommendations

**Theme Structure:**
```javascript
{
  name: 'corporate',
  colors: {
    primary: '#4b6bfb',
    secondary: '#7b92b2',
    accent: '#67cba0',
    neutral: '#181a2a',
    'base-100': '#ffffff',
    'base-200': '#f7f8f9',
    'base-300': '#e5e6e6'
  },
  scale: 'md',
  typography: 'classic'
}
```

### 4. Data Models

#### Card (`api/models/Card.js`)

**Properties:**
- `id` (UUID) - Unique identifier
- `type` (string) - Card type (title, objectives, etc.)
- `layout` (enum) - Layout type
- `content` (object) - Layout-specific content
- `theme` (object) - Theme configuration
- `image` (optional) - Image URL or generation status
- `placeholders` (optional) - Placeholder configuration
- `metadata` (optional) - Additional metadata

**Methods:**
- `validate()` - Schema validation
- `toJSON()` - Serialization

#### Schemas (`api/models/schemas.js`)

**Layout Schemas:**
- split: title, body, imagePrompt
- numbered-list: intro, items[]
- grid: title, cells[4]
- hero: title, subtitle, kicker, cta, imagePrompt
- hero-overlay: title, subtitle, kicker, cta, imagePrompt
- content-bullets: title, bullets[], footnote

**Validation:**
- Type checking
- Required field enforcement
- Array length validation
- Nested object validation

### 5. Templates (`api/templates/`)

**Format:** Handlebars HTML

**Files:**
- `split.html` - Split layout
- `numbered-list.html` - Numbered list
- `grid.html` - Grid layout
- `hero.html` - Hero layout
- `hero-overlay.html` - Hero overlay
- `content-bullets.html` - Content bullets

**Template Structure:**
```handlebars
<div class="layout-card {layout-class}" data-layout="{layout}" data-card-id="{{id}}">
  <!-- Layout-specific HTML with container-query classes -->
  <h2 class="adaptive-text-2xl">{{title}}</h2>
  <!-- ... -->
</div>
```

## Data Flow

### Generate Card Flow

```
1. Client sends POST /api/cards/generate-content
   {
     topic: "AI in Product Discovery",
     layoutType: "numbered-list"
   }

2. Cards route validates input

3. ContentGenerator.generateCardContent()
   - Looks up topic in database
   - Finds matching layout/section
   - Returns structured content

4. ThemeService.normalizeTheme()
   - Resolves theme configuration
   - Merges custom colors if provided

5. Card model created and validated

6. Response returned as JSON
   {
     card: {
       id: "...",
       type: "objectives",
       layout: "numbered-list",
       content: { ... },
       theme: { ... }
     }
   }
```

### Generate Presentation Flow

```
1. Client sends POST /api/presentations/generate
   {
     topic: "AI in Product Discovery",
     cardCount: 6
   }

2. Presentations route validates input

3. ContentGenerator.generatePresentation()
   - Retrieves all sections for topic
   - Limits to cardCount
   - Returns array of card data

4. ThemeService resolves theme

5. Card objects created for each section

6. Response returned with all cards
   {
     cards: [ ... ],
     topic: "...",
     theme: { ... }
   }
```

### Render to HTML Flow

```
1. Client sends card data to /render or /export

2. TemplateEngine.render(card)
   - Selects template for layout
   - Prepares template data
   - Handles special cases (array body, images)
   - Compiles with Handlebars

3. HTML snippet returned with:
   - Container-query classes
   - Adaptive typography classes
   - Layout-specific structure
   - Data attributes for testing

4. For complete page:
   - TemplateEngine.renderPage()
   - Wraps cards in HTML structure
   - Includes CSS link
   - Adds theme data attribute
   - Optionally adds controls
```

## Integration with Existing System

### CSS Reuse

The API leverages the existing `dist/output.css` which includes:

- Container query setup (`.card-container`)
- Layout classes (`.split-layout`, `.hero-layout`, etc.)
- Adaptive typography (`.adaptive-text-*`)
- Theme-specific CSS variables
- DaisyUI component classes

### Container Query Pattern

```css
/* In src/input.css */
.card-container {
  container-type: inline-size;
  container-name: card;
}

.split-layout {
  display: flex;
  flex-direction: row;
}

@container card (max-width: 599px) {
  .split-layout {
    flex-direction: column;
  }
}
```

### Theme Integration

All 29 DaisyUI themes from the demo are available via the API:
- Professional: light, dark, corporate, business
- Bold: cyberpunk, synthwave, dracula
- Soft: cupcake, pastel, valentine
- Quirky: retro, halloween, forest
- And 16+ more

## Error Handling

### Validation Errors (400)

```json
{
  "error": "Bad Request",
  "message": "Field 'topic' is required"
}
```

### Not Found Errors (404)

```json
{
  "error": "Not Found",
  "message": "Theme not found: unknown-theme"
}
```

### Server Errors (500)

```json
{
  "error": "Internal Server Error",
  "message": "Template not found for layout: unknown-layout"
}
```

## Performance Characteristics

### Phase 1 (Deterministic)

- **Card generation**: <50ms
  - No external API calls
  - Simple database lookup
  - In-memory content mapping

- **Template rendering**: <10ms per card
  - Pre-compiled templates
  - Minimal data transformation
  - No I/O operations

- **Complete presentation**: <200ms for 6 cards
  - Parallel card generation
  - Efficient template compilation
  - Single-pass rendering

### Future Phases

- **Phase 2**: Image generation will be async (3-10s)
- **Phase 3**: SSE streaming for progressive updates
- **Phase 4**: LLM calls will add 1-3s latency

## Security Considerations

### Current (Phase 1)

- No authentication (development only)
- No rate limiting (add for production)
- Input validation on all endpoints
- No sensitive data storage
- CORS enabled for development

### Recommended (Production)

- Add API key authentication
- Implement rate limiting (e.g., 100 req/hour)
- Add request signing for webhooks
- Enable HTTPS only
- Restrict CORS to known origins
- Add request logging and monitoring

## Testing Strategy

### Unit Tests

Located in `tests/api/`:

1. **ContentGenerator.test.js**
   - Topic validation
   - Content generation logic
   - Presentation assembly
   - Edge cases (unknown topics, invalid layouts)

2. **TemplateEngine.test.js**
   - Template loading
   - Rendering each layout
   - Page generation
   - Export functionality
   - Edge cases (missing templates, invalid data)

3. **ThemeService.test.js**
   - Theme retrieval
   - Theme normalization
   - Style-based selection
   - Typography classification

### Running Tests

```bash
# All tests
npm test

# API tests only
npm test -- tests/api

# With coverage
npm run test:coverage

# Watch mode
npm test -- --watch
```

## Extensibility Points

### Adding New Topics

1. Edit `api/services/ContentGenerator.js`
2. Add to `CONTENT_DATABASE` object
3. Follow existing structure:
   ```javascript
   'New Topic Name': {
     section1: {
       layout: 'hero-overlay',
       content: { ... }
     },
     ...
   }
   ```

### Adding New Layouts

1. Create template in `api/templates/new-layout.html`
2. Update `TemplateEngine.loadTemplates()`
3. Add schema to `models/schemas.js`
4. Update `Card.isValidLayout()`
5. Add content examples to topics

### Adding New Themes

1. Edit `api/services/ThemeService.js`
2. Add to `DAISYUI_THEMES` object
3. Include color palette and typography class
4. Update style mappings if needed

## Future Enhancements (Next Phases)

### Phase 2: Image Generation

- ImageGenerationService
- Multi-provider adapters (Gemini, DALL-E, SD)
- Placeholder system
- Fallback chain
- Async image processing

### Phase 3: Streaming

- SSE endpoint (`/api/cards/stream`)
- Progressive stages:
  1. Skeleton
  2. Content
  3. Styles
  4. Placeholders
  5. Images
- Real-time updates
- Client-side progressive enhancement

### Phase 4: LLM Integration

- ContentGenerator overhaul
- Gemini API integration
- Structured output parsing
- Context-aware image prompts
- Dynamic topic support
- Custom content generation

## Dependencies

### Production

- **express**: 4.18.2 - HTTP server
- **cors**: 2.8.5 - CORS middleware
- **handlebars**: 4.7.8 - Template engine
- **uuid**: 9.0.1 - UUID generation

### Development

- **nodemon**: 3.0.2 - Auto-reload
- **vitest**: 1.1.0 - Unit testing
- **@playwright/test**: 1.40.1 - E2E testing

### Shared

- **vite**: 5.0.10 - Build tool
- **tailwindcss**: 3.4.0 - CSS framework
- **daisyui**: 4.0.0 - Component library

## Deployment Considerations

### Development

```bash
npm run api:dev
```

- Port 3000
- Auto-reload on changes
- Full error stack traces
- CORS enabled

### Production

```bash
NODE_ENV=production npm run api
```

Recommendations:
- Use process manager (PM2, systemd)
- Enable logging to files
- Set up monitoring (Datadog, New Relic)
- Use reverse proxy (nginx)
- Enable HTTPS
- Configure environment variables
- Set up health checks

## Monitoring and Observability

### Current Logging

- Request logging (method, path, status, duration)
- Error logging with stack traces
- Service-level logs in development

### Recommended (Production)

- Structured logging (JSON format)
- Correlation IDs for request tracing
- Performance metrics (response times, error rates)
- Health check endpoint monitoring
- Alert thresholds for errors and latency

## Conclusion

Phase 1 provides a solid foundation for the Adaptive Cards Platform API with:

- Clean REST API design
- Separation of concerns (routes/services/models)
- Comprehensive input validation
- Flexible theme and layout system
- Deterministic content for MVP use cases
- Good test coverage
- Clear extension points for future phases

The architecture is designed to scale from Phase 1's simple deterministic content through Phase 4's LLM-powered intelligent generation while maintaining backward compatibility and clean separation between layers.
