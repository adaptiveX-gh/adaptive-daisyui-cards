# API Quick Start Guide

Get the Adaptive Cards Platform API running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Terminal/command line access

## Step-by-Step Setup

### 1. Install Dependencies

```bash
# From project root
npm install
```

This will install:
- Express, Handlebars, UUID (API dependencies)
- Vite, Tailwind CSS, DaisyUI (build dependencies)
- Vitest, Playwright (testing dependencies)

### 2. Build CSS Assets

```bash
npm run build
```

This compiles `src/input.css` into `dist/output.css` with all container query styles.

### 3. Start the API Server

```bash
npm run api
```

You should see:

```
╔════════════════════════════════════════════════════════════╗
║   Adaptive Cards Platform API - Phase 1                   ║
║   Version: 0.1.0                                           ║
╟────────────────────────────────────────────────────────────╢
║   Server running on: http://localhost:3000                 ║
║   API documentation: http://localhost:3000/api             ║
║   Health check: http://localhost:3000/health               ║
╚════════════════════════════════════════════════════════════╝
```

### 4. Test the API

Open a new terminal and try these commands:

#### Health Check

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "version": "0.1.0",
  "phase": 1,
  "timestamp": "2025-10-23T..."
}
```

#### Generate a Card

```bash
curl -X POST http://localhost:3000/api/cards/generate-content \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "AI in Product Discovery",
    "layoutType": "numbered-list"
  }'
```

Expected response: Card JSON with ID, layout, content, and theme.

#### Generate a Presentation

```bash
curl -X POST http://localhost:3000/api/presentations/generate \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "AI in Product Discovery",
    "cardCount": 6
  }'
```

Expected response: Array of 6 cards with complete content.

#### View in Browser

Open this URL in your browser:

```
http://localhost:3000/api/presentations/preview/AI%20in%20Product%20Discovery
```

You should see a fully rendered presentation with 6 cards!

### 5. Explore Other Topics

Try the other MVP topics:

**Digital Marketing:**
```bash
curl "http://localhost:3000/api/presentations/preview/Digital%20Marketing%20Trends%202025?theme=cyberpunk"
```

**Remote Team Management:**
```bash
curl "http://localhost:3000/api/presentations/preview/Remote%20Team%20Management?theme=corporate"
```

## Common Commands

### Development Mode (Auto-reload)

```bash
npm run api:dev
```

Server restarts automatically when you edit API files.

### Run Tests

```bash
# All tests
npm test

# API tests only
npm test -- tests/api

# With coverage
npm run test:coverage
```

### Stop the Server

Press `Ctrl+C` in the terminal running the server.

## Next Steps

### 1. Read the Documentation

- **[API-README.md](./API-README.md)** - Complete overview
- **[docs/API-USAGE.md](./docs/API-USAGE.md)** - All endpoints with examples
- **[docs/PHASE1-ARCHITECTURE.md](./docs/PHASE1-ARCHITECTURE.md)** - Technical details

### 2. Try the Example Scripts

```bash
# Make executable (macOS/Linux)
chmod +x docs/API-EXAMPLES.sh

# Run examples
./docs/API-EXAMPLES.sh
```

### 3. Experiment with Themes

List all available themes:

```bash
curl http://localhost:3000/api/themes
```

Try different themes:

```bash
curl -X POST http://localhost:3000/api/presentations/generate \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "AI in Product Discovery",
    "cardCount": 6,
    "theme": {"name": "synthwave"}
  }'
```

### 4. Export Presentations

Export as HTML:

```bash
curl -X POST http://localhost:3000/api/presentations/generate \
  -H "Content-Type: application/json" \
  -d '{"topic": "AI in Product Discovery", "cardCount": 6}' \
  > presentation.json

curl -X POST http://localhost:3000/api/presentations/export \
  -H "Content-Type: application/json" \
  -d '{
    "cards": '$(cat presentation.json | jq '.cards')',
    "format": "html",
    "options": {"title": "My Presentation", "theme": "corporate"}
  }' > output.html

# Open in browser
open output.html  # macOS
start output.html # Windows
xdg-open output.html # Linux
```

### 5. Integrate with JavaScript

```javascript
// Example: Generate and display presentation
async function loadPresentation(topic) {
  const response = await fetch('http://localhost:3000/api/presentations/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic: topic,
      cardCount: 6,
      theme: { name: 'corporate' }
    })
  });

  const data = await response.json();
  console.log(`Generated ${data.cards.length} cards for "${data.topic}"`);
  return data;
}

loadPresentation('AI in Product Discovery');
```

## Troubleshooting

### "Port 3000 already in use"

Kill the process using port 3000 or use a different port:

```bash
# Use different port
PORT=3001 npm run api
```

### "Cannot find module 'express'"

Install dependencies:

```bash
npm install
```

### "Template not found"

Verify template files exist:

```bash
ls api/templates/
```

Should show: split.html, numbered-list.html, grid.html, hero.html, hero-overlay.html, content-bullets.html

### "CSS not loading in preview"

Build the CSS:

```bash
npm run build
```

Verify `dist/output.css` exists.

### Tests failing

Ensure server is not running during tests:

```bash
# Stop server (Ctrl+C)
# Then run tests
npm test
```

## Architecture Overview

```
api/
├── server.js              # Express server
├── routes/                # API endpoints
│   ├── cards.js
│   └── presentations.js
├── services/              # Business logic
│   ├── ContentGenerator.js
│   ├── TemplateEngine.js
│   └── ThemeService.js
├── models/                # Data models
│   ├── Card.js
│   └── schemas.js
└── templates/             # Handlebars templates
    ├── split.html
    ├── numbered-list.html
    └── ...
```

## What's Next?

You now have:

- REST API running on port 3000
- 3 MVP topics with complete content
- 5 responsive layouts
- 13+ DaisyUI themes
- JSON and HTML export
- Live browser preview

Ready to build something? Check out:

- **API Usage Guide**: Full endpoint documentation
- **Architecture Doc**: Technical deep-dive
- **Example Scripts**: More curl examples

## Phase 2 Preview

Coming soon:

- Image generation (Gemini, DALL-E, Stable Diffusion)
- Smart placeholders during image generation
- Async processing with status tracking

## Support

- Check documentation in `docs/` folder
- Review example scripts in `docs/API-EXAMPLES.sh`
- Run tests to verify setup: `npm test -- tests/api`

Happy coding!
