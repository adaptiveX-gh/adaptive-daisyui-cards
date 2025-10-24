# Image Generation System - Comprehensive Guide

**Phase 2 Implementation | Version 0.2.0**

This document provides a complete guide to the image generation system in the Adaptive Cards Platform API.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Quick Start](#quick-start)
4. [API Endpoints](#api-endpoints)
5. [Providers](#providers)
6. [Fallback Chain](#fallback-chain)
7. [Async Image Generation](#async-image-generation)
8. [Prompt Enhancement](#prompt-enhancement)
9. [Examples](#examples)
10. [Configuration](#configuration)
11. [Troubleshooting](#troubleshooting)

## Overview

The image generation system provides:

- **Multi-provider support**: Gemini, placeholders, (DALL-E and Stable Diffusion planned)
- **Automatic fallbacks**: Graceful degradation when providers fail
- **Instant placeholders**: Beautiful SVG placeholders while images generate
- **Async processing**: Non-blocking image generation
- **Smart prompt enhancement**: Context-aware prompt optimization
- **Status tracking**: Monitor generation progress

## Architecture

```
┌─────────────────────────────────────────┐
│  ImageGenerationService                 │
│  ┌───────────────────────────────────┐  │
│  │ Fallback Chain                    │  │
│  │ Gemini → Placeholder              │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ├─ GeminiImageAdapter                 │
│  │   └─ Google Generative AI           │
│  │                                      │
│  ├─ PlaceholderAdapter                 │
│  │   └─ PlaceholderService             │
│  │       ├─ Geometric patterns         │
│  │       ├─ Repeating patterns         │
│  │       └─ Gradient solids            │
│  │                                      │
│  └─ ImageStatusStore                   │
│      └─ In-memory status tracking      │
└─────────────────────────────────────────┘
```

## Quick Start

### 1. Setup Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your API key
GEMINI_API_KEY=your_api_key_here
GEMINI_MOCK_MODE=false  # Set to true for testing without API key
```

### 2. Generate a Card with Image

```bash
POST /api/cards/generate-content
Content-Type: application/json

{
  "topic": "AI in Product Discovery",
  "layoutType": "hero",
  "style": "professional",
  "generateImage": true,
  "imageProvider": "gemini"
}
```

### 3. Check Image Status

```bash
GET /api/images/{cardId}/status
```

## API Endpoints

### Generate Card with Image

**POST** `/api/cards/generate-content`

```json
{
  "topic": "AI in Product Discovery",
  "layoutType": "hero",
  "style": "professional",
  "generateImage": true,        // Enable image generation
  "imagePrompt": "Optional custom prompt",
  "imageProvider": "gemini"     // or "placeholder"
}
```

**Response:**

```json
{
  "card": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "type": "title",
    "layout": "hero",
    "content": { ... },
    "theme": { ... },
    "image": {
      "status": "generating",
      "url": null,
      "provider": "gemini",
      "placeholder": {
        "type": "geometric",
        "url": "data:image/svg+xml;base64,...",
        "loadingState": true,
        "aspectRatio": "16:9"
      },
      "error": null,
      "generatedAt": null
    }
  }
}
```

### Generate Presentation with Images

**POST** `/api/presentations/generate`

```json
{
  "topic": "Digital Marketing Trends 2025",
  "cardCount": 6,
  "style": "professional",
  "includeImages": true,
  "provider": "gemini"
}
```

### Get Image Status

**GET** `/api/images/:cardId/status`

**Response:**

```json
{
  "cardId": "123e4567-e89b-12d3-a456-426614174000",
  "status": "ready",           // or "generating", "failed", "cancelled"
  "provider": "gemini",
  "url": "https://...",
  "placeholder": { ... },
  "error": null,
  "startedAt": "2025-10-23T10:00:00.000Z",
  "updatedAt": "2025-10-23T10:00:03.000Z",
  "completedAt": "2025-10-23T10:00:03.000Z"
}
```

### Regenerate Image

**POST** `/api/images/regenerate`

```json
{
  "cardId": "123e4567-e89b-12d3-a456-426614174000",
  "provider": "gemini"  // Try different provider
}
```

### Cancel Generation

**DELETE** `/api/images/:cardId`

### Get Provider Statuses

**GET** `/api/images/providers`

**Response:**

```json
{
  "providers": {
    "gemini": {
      "name": "GeminiImageAdapter",
      "available": true,
      "configured": true,
      "mockMode": false,
      "timeout": 30000,
      "retries": 2
    },
    "placeholder": {
      "name": "PlaceholderAdapter",
      "available": true,
      "instant": true
    }
  }
}
```

### Get Statistics

**GET** `/api/images/stats`

## Providers

### 1. Gemini (Primary)

**Provider**: Google Generative AI
**Status**: Implemented with mock mode
**Requires**: API key

**Features:**
- High-quality AI-generated images
- Prompt enhancement
- Style presets
- Theme-aware generation
- Automatic retry with exponential backoff

**Supported Styles:**
- `professional-presentation` - Clean, corporate, modern
- `abstract` - Geometric, artistic, contemporary
- `minimalist` - Simple, refined, elegant
- `illustrative` - Creative, hand-drawn, engaging

**Supported Aspect Ratios:**
- `16:9` - Widescreen (default for presentations)
- `1:1` - Square
- `4:3` - Standard
- `9:16` - Portrait
- `3:4` - Portrait standard

### 2. Placeholder (Fallback)

**Provider**: Internal SVG generation
**Status**: Fully implemented
**Requires**: Nothing - always available

**Features:**
- Instant generation
- Deterministic (same input = same output)
- Theme-aware colors
- Three pattern types

**Pattern Types:**
- **Geometric** - Triangles, circles, polygons, abstract shapes
- **Pattern** - Dots, lines, waves, grids
- **Solid** - Gradient backgrounds

## Fallback Chain

The system uses a fallback chain to ensure images are always available:

```
1. Gemini (30s timeout, 2 retries)
   ↓ (on failure)
2. Placeholder (instant, always succeeds)
```

**Disable Fallback:**

```bash
IMAGE_FALLBACK_ENABLED=false
```

## Async Image Generation

Images are generated asynchronously to avoid blocking API responses.

### Flow

1. **Request with `generateImage: true`**
2. **Immediate Response** with placeholder
3. **Background Generation** starts
4. **Status Updates** available via polling
5. **Client Swaps** placeholder for real image when ready

### Polling Strategy

```javascript
async function pollImageStatus(cardId) {
  const maxAttempts = 20;
  const interval = 1500; // 1.5 seconds

  for (let i = 0; i < maxAttempts; i++) {
    const status = await fetch(`/api/images/${cardId}/status`).then(r => r.json());

    if (status.status === 'ready') {
      return status.url;
    }

    if (status.status === 'failed') {
      throw new Error(status.error);
    }

    await new Promise(resolve => setTimeout(resolve, interval));
  }

  throw new Error('Image generation timeout');
}
```

### Future: Server-Sent Events (Phase 3)

SSE streaming will replace polling for real-time updates.

## Prompt Enhancement

The system automatically enhances prompts for better results.

### Base Enhancement

**Input:** `"AI technology background"`

**Enhanced:**
```
Professional presentation slide background image, AI technology background,
clean, minimal, artificial intelligence visualization, futuristic tech,
professional aesthetic, clean background for text overlay,
subtle, not distracting, high quality
```

### Style-Specific Enhancement

**Style: `professional-presentation`**
- Adds: "clean, minimal, corporate aesthetic"
- Suffix: "subtle, not distracting, suitable for text overlay"

**Style: `abstract`**
- Adds: "geometric shapes, flowing forms, contemporary art"
- Suffix: "visually striking, modern aesthetic"

### Theme-Aware Enhancement

**Theme: `cyberpunk`**
- Adds: "neon colors, futuristic, tech-noir aesthetic"

**Theme: `pastel`**
- Adds: "soft colors, gentle gradients, minimalist"

### Content-Aware Enhancement

Detects keywords and adds context:

- "AI" → "neural networks, artificial intelligence visualization"
- "data" → "data visualization, analytics"
- "business" → "corporate setting, professional environment"

### Custom Prompts

Override automatic generation:

```json
{
  "generateImage": true,
  "imagePrompt": "Futuristic city skyline at sunset with neon lights"
}
```

## Examples

### Example 1: Simple Card with Auto-Generated Image

```bash
POST /api/cards/generate-content
{
  "topic": "Remote Team Management",
  "layoutType": "hero",
  "style": "professional",
  "generateImage": true
}
```

The system will:
1. Generate card content
2. Create image prompt from card title
3. Enhance prompt with style/theme
4. Return card with placeholder immediately
5. Generate real image in background

### Example 2: Custom Image Prompt

```bash
POST /api/cards/generate-content
{
  "topic": "Digital Marketing",
  "layoutType": "hero",
  "style": "abstract",
  "generateImage": true,
  "imagePrompt": "Abstract representation of social media connections and engagement"
}
```

### Example 3: Placeholder Only (Instant)

```bash
POST /api/cards/generate-content
{
  "topic": "AI in Product Discovery",
  "layoutType": "hero",
  "generateImage": true,
  "imageProvider": "placeholder"
}
```

Returns instantly with beautiful geometric placeholder.

### Example 4: Full Presentation with Images

```bash
POST /api/presentations/generate
{
  "topic": "AI in Product Discovery",
  "cardCount": 6,
  "style": "professional",
  "includeImages": true,
  "provider": "gemini"
}
```

Generates 6 cards, each with:
- Placeholder image immediately
- Background generation for real images
- Individual status tracking per card

## Configuration

### Environment Variables

```bash
# Required for Gemini
GEMINI_API_KEY=your_api_key_here

# Optional
GEMINI_MOCK_MODE=false              # Enable mock mode
IMAGE_GENERATION_TIMEOUT=30000      # Timeout in ms
IMAGE_FALLBACK_ENABLED=true         # Enable fallback chain
PLACEHOLDER_STYLE=geometric         # Default placeholder type
```

### Service Configuration

```javascript
import ImageGenerationService from './services/ImageGenerationService.js';

const service = new ImageGenerationService({
  geminiApiKey: 'your-key',
  timeout: 30000,
  fallbackChain: ['gemini', 'placeholder'],
  fallbackEnabled: true
});
```

## Troubleshooting

### Issue: Images not generating

**Check:**
1. API key is set: `GET /api/images/providers`
2. Provider is configured: Look for `"configured": true`
3. Mock mode if needed: `GEMINI_MOCK_MODE=true`
4. Logs for errors: Check console output

### Issue: Generation is slow

**Solutions:**
1. Increase timeout: `IMAGE_GENERATION_TIMEOUT=60000`
2. Use placeholder provider for instant results
3. Enable fallback chain
4. Check network connectivity

### Issue: Images keep failing

**Check:**
1. API key is valid
2. Provider status: `GET /api/images/providers`
3. Test connection: `POST /api/images/test/gemini`
4. Try regenerating: `POST /api/images/regenerate`

### Issue: Placeholder not showing

**Check:**
1. `generateImage: true` in request
2. Card has `image` field in response
3. Placeholder URL is base64 SVG
4. Browser supports data URLs

### Mock Mode

For development without API access:

```bash
GEMINI_MOCK_MODE=true
```

Returns placeholder.co URLs instead of calling Gemini API.

## Best Practices

1. **Always use placeholders** - Provide instant feedback
2. **Poll status** - Check if real image is ready
3. **Handle failures** - Use fallback chain
4. **Cache results** - Store generated images
5. **Respect rate limits** - Don't generate too many at once
6. **Test with mocks** - Use mock mode for CI/CD
7. **Monitor status** - Check `/api/images/stats` for issues

## Security

- API keys stored server-side only
- Never expose keys to client
- Validate all prompts (max 500 chars)
- Sanitize user input
- Rate limiting (future)
- No PII in prompts

## Performance

- **Placeholder**: <50ms (instant)
- **Gemini**: 3-10 seconds (with API)
- **Mock mode**: <100ms
- **Status check**: <10ms (in-memory)

## Future Enhancements

- SSE streaming (Phase 3)
- DALL-E integration
- Stable Diffusion integration
- Image caching
- CDN integration
- Image optimization
- A/B testing different prompts
- Analytics and metrics
