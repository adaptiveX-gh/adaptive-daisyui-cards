# Adaptive Cards Platform API - Usage Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Build CSS (if not already built)

```bash
npm run build
```

### 3. Start the API Server

```bash
npm run api
```

Or for development with auto-reload:

```bash
npm run api:dev
```

The server will start on `http://localhost:3000`

## API Endpoints

### Health Check

**GET /health**

Check if the API is running.

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "ok",
  "version": "0.1.0",
  "phase": 1,
  "timestamp": "2025-10-23T12:00:00.000Z"
}
```

### API Information

**GET /api**

Get list of available endpoints and documentation.

```bash
curl http://localhost:3000/api
```

---

## Card Generation

### Generate Single Card Content

**POST /api/cards/generate-content**

Generate content for a single card based on topic and layout.

**Request Body:**
```json
{
  "topic": "AI in Product Discovery",
  "layoutType": "numbered-list",
  "tone": "professional",
  "contentSections": ["objectives"],
  "style": "professional",
  "theme": {
    "name": "corporate"
  }
}
```

**Parameters:**
- `topic` (required): Topic name. Available: "AI in Product Discovery", "Digital Marketing Trends 2025", "Remote Team Management"
- `layoutType` (required): Layout type. Options: "split", "numbered-list", "grid", "hero", "hero-overlay", "content-bullets"
- `tone` (optional): Content tone
- `contentSections` (optional): Specific sections to generate
- `style` (optional): Style hint. Options: "professional", "playful", "minimal", "bold"
- `theme` (optional): Theme configuration

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/cards/generate-content \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "AI in Product Discovery",
    "layoutType": "numbered-list"
  }'
```

**Response:**
```json
{
  "card": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "type": "objectives",
    "layout": "numbered-list",
    "content": {
      "intro": "By the end of this session, you'll be able to:",
      "items": [
        "Identify customer problems using AI on qualitative data",
        "Generate diverse product ideas with AI assistance",
        "Refine and select top ideas using AI scoring"
      ]
    },
    "theme": {
      "name": "light",
      "colors": { ... }
    }
  }
}
```

### Render Card to HTML

**POST /api/cards/render**

Render a card object to HTML.

**Request Body:**
```json
{
  "card": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "layout": "hero",
    "content": {
      "title": "Welcome",
      "subtitle": "To our presentation"
    }
  }
}
```

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/cards/render \
  -H "Content-Type: application/json" \
  -d '{
    "card": {
      "layout": "hero",
      "content": {
        "title": "Test Card",
        "subtitle": "This is a test"
      }
    }
  }'
```

**Response:**
```json
{
  "html": "<div class=\"layout-card hero-layout\">...</div>",
  "cardId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Get Available Layouts

**GET /api/cards/layouts**

Get list of available layouts with descriptions.

```bash
curl http://localhost:3000/api/cards/layouts
```

**Response:**
```json
{
  "layouts": [
    {
      "name": "split",
      "description": "Text content on left/right with image section",
      "useCases": ["Feature highlights", "Method explanations", "Process descriptions"]
    },
    ...
  ]
}
```

### Get Available Topics

**GET /api/cards/topics**

Get list of available topics (Phase 1 deterministic content).

```bash
curl http://localhost:3000/api/cards/topics
```

**Response:**
```json
{
  "topics": [
    {
      "name": "AI in Product Discovery",
      "sections": ["title", "objectives", "process", "benefits", "methodology", "conclusion"]
    },
    ...
  ]
}
```

---

## Presentation Generation

### Generate Complete Presentation

**POST /api/presentations/generate**

Generate a complete presentation (4-8 cards) for a topic.

**Request Body:**
```json
{
  "topic": "AI in Product Discovery",
  "cardCount": 6,
  "style": "professional",
  "includeImages": false,
  "theme": {
    "name": "corporate"
  }
}
```

**Parameters:**
- `topic` (required): Topic name
- `cardCount` (optional, default: 6): Number of cards (1-20)
- `style` (optional, default: "professional"): Presentation style
- `includeImages` (optional, default: false): Include image placeholders
- `provider` (optional, default: "placeholder"): Image provider (Phase 2)
- `layouts` (optional): Specific layouts to use
- `theme` (optional): Theme configuration

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/presentations/generate \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "AI in Product Discovery",
    "cardCount": 6,
    "style": "professional"
  }'
```

**Response:**
```json
{
  "cards": [
    {
      "id": "...",
      "type": "title",
      "layout": "hero-overlay",
      "content": {
        "title": "AI in Product Discovery",
        "subtitle": "Transforming Ideas into Innovation"
      },
      "theme": { ... }
    },
    ...
  ],
  "topic": "AI in Product Discovery",
  "theme": { ... },
  "metadata": {
    "cardCount": 6,
    "style": "professional",
    "includeImages": false
  }
}
```

### Render Presentation to HTML

**POST /api/presentations/render**

Render multiple cards to HTML.

**Request Body:**
```json
{
  "cards": [ ... ],
  "options": {
    "containerWidth": "800px",
    "theme": "corporate"
  }
}
```

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/presentations/render \
  -H "Content-Type: application/json" \
  -d '{
    "cards": [...],
    "options": {
      "theme": "dark"
    }
  }'
```

### Export Presentation

**POST /api/presentations/export**

Export presentation in various formats.

**Request Body:**
```json
{
  "cards": [ ... ],
  "format": "json",
  "options": {
    "title": "My Presentation",
    "theme": "corporate"
  }
}
```

**Formats:**
- `json`: Raw JSON export
- `html`: Complete HTML page with controls
- `bundle`: Static HTML bundle (requires manual CSS inclusion)

**Example Request (JSON export):**
```bash
curl -X POST http://localhost:3000/api/presentations/export \
  -H "Content-Type: application/json" \
  -d '{
    "cards": [...],
    "format": "json"
  }' > presentation.json
```

**Example Request (HTML export):**
```bash
curl -X POST http://localhost:3000/api/presentations/export \
  -H "Content-Type: application/json" \
  -d '{
    "cards": [...],
    "format": "html",
    "options": {
      "title": "My Presentation",
      "theme": "cyberpunk"
    }
  }' > presentation.html
```

### Quick Preview

**GET /api/presentations/preview/:topic**

Generate and preview a presentation in the browser.

**Query Parameters:**
- `theme` (optional, default: "light"): Theme name
- `cardCount` (optional, default: 6): Number of cards

**Example:**
```bash
# Open in browser
http://localhost:3000/api/presentations/preview/AI%20in%20Product%20Discovery?theme=corporate&cardCount=6

# Or using curl
curl "http://localhost:3000/api/presentations/preview/AI%20in%20Product%20Discovery?theme=dark&cardCount=4"
```

---

## Theme Management

### Get All Themes

**GET /api/themes**

Get list of all available themes.

```bash
curl http://localhost:3000/api/themes
```

**Response:**
```json
{
  "themes": [
    {
      "name": "light",
      "colors": { ... },
      "scale": "md",
      "typography": "classic"
    },
    ...
  ]
}
```

### Get Specific Theme

**GET /api/themes/:name**

Get details for a specific theme.

```bash
curl http://localhost:3000/api/themes/corporate
```

**Response:**
```json
{
  "name": "corporate",
  "colors": {
    "primary": "#4b6bfb",
    "secondary": "#7b92b2",
    "accent": "#67cba0",
    ...
  },
  "scale": "md",
  "typography": "classic"
}
```

---

## Complete Example Workflow

### 1. Generate a Presentation

```bash
curl -X POST http://localhost:3000/api/presentations/generate \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "AI in Product Discovery",
    "cardCount": 6,
    "style": "professional",
    "theme": {
      "name": "corporate"
    }
  }' | jq '.' > presentation.json
```

### 2. Export as HTML

```bash
curl -X POST http://localhost:3000/api/presentations/export \
  -H "Content-Type: application/json" \
  -d @presentation.json \
  -d '{"format": "html", "options": {"title": "AI Product Discovery Presentation"}}' \
  > presentation.html
```

### 3. View in Browser

Open `presentation.html` in your browser. Make sure `dist/output.css` is in the same directory structure.

---

## JavaScript/TypeScript Client Example

```javascript
// Generate a presentation
async function generatePresentation(topic) {
  const response = await fetch('http://localhost:3000/api/presentations/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      topic: topic,
      cardCount: 6,
      style: 'professional',
      theme: { name: 'corporate' }
    })
  });

  return await response.json();
}

// Render to HTML
async function renderPresentation(cards) {
  const response = await fetch('http://localhost:3000/api/presentations/render', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      cards: cards,
      options: {
        theme: 'dark',
        containerWidth: '900px'
      }
    })
  });

  const data = await response.json();
  return data.html;
}

// Usage
const presentation = await generatePresentation('AI in Product Discovery');
const html = await renderPresentation(presentation.cards);
document.getElementById('container').innerHTML = html;
```

---

## Error Handling

All endpoints return standard HTTP status codes:

- `200 OK`: Success
- `400 Bad Request`: Invalid input (missing required fields, invalid values)
- `404 Not Found`: Resource not found (unknown route, theme, etc.)
- `500 Internal Server Error`: Server error

**Error Response Format:**
```json
{
  "error": "Bad Request",
  "message": "Field 'topic' is required"
}
```

---

## Available Topics (Phase 1)

1. **AI in Product Discovery**
   - Sections: title, objectives, process, benefits, methodology, conclusion
   - Layouts: hero-overlay, numbered-list, grid, content-bullets, split, hero

2. **Digital Marketing Trends 2025**
   - Sections: title, objectives, trends, strategies, channels, action
   - Layouts: hero-overlay, numbered-list, grid, content-bullets, split, hero

3. **Remote Team Management**
   - Sections: title, objectives, challenges, solutions, tools, future
   - Layouts: hero-overlay, numbered-list, grid, content-bullets, split, hero

---

## Available Themes

**Professional/Classic:**
- light, dark, corporate, business, emerald, forest, winter

**Bold/Futuristic:**
- cyberpunk, synthwave, dracula, night, black, luxury

**Soft/Pastel:**
- cupcake, pastel, valentine, fantasy, garden, lemonade

**Quirky/Retro:**
- retro, acid, halloween, bumblebee, aqua, cmyk, autumn, coffee, lofi, wireframe

---

## Tips and Best Practices

1. **Always build CSS first**: Run `npm run build` to ensure `dist/output.css` exists
2. **Use preview for quick testing**: The `/preview` endpoint is fastest for seeing results
3. **Theme consistency**: Use the same theme across all cards in a presentation
4. **Card count**: 4-8 cards works best for presentations
5. **Layout variety**: Mix different layouts for visual interest

---

## Troubleshooting

### Server won't start
- Check that port 3000 is available
- Ensure all dependencies are installed: `npm install`

### Templates not rendering
- Verify `dist/output.css` exists: `npm run build`
- Check template files exist in `api/templates/`

### Unknown topic error
- Use `GET /api/cards/topics` to see available topics
- Topic names are case-sensitive

### 404 errors
- Verify the API server is running on port 3000
- Check endpoint URL spelling and HTTP method

---

## Next Steps (Future Phases)

- **Phase 2**: Image generation with multi-provider support
- **Phase 3**: SSE streaming for progressive rendering
- **Phase 4**: LLM-based content generation

See `docs/API-SPEC.md` for full specification and roadmap.
