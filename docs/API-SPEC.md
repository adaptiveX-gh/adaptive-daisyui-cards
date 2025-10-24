# Adaptive Cards Platform – API-First Specification (v0.1)

Last updated: 2025-10-23
Owner: adaptiveX-gh/adaptive-daisyui-cards
Status: Draft for Phase 1 implementation

## 1. Overview

This document specifies an API-first, streaming-capable card generation platform that produces presentation-ready, responsive “cards” (slides/sections) using a template engine, optional LLM-driven content, and multi-provider image generation. It aligns with your PDF examples, long-term roadmap, and existing container-query responsive system.

## 2. Goals and Non-Goals

- Goals
  - Provide a clean API for generating structured card content and rendering HTML.
  - Support essential layouts from the PDF (split, numbered list, grid, hero, content+bullets).
  - Enable multi-provider image generation with fallbacks and intelligent placeholders.
  - Offer progressive enhancement via server-sent events (SSE) streaming.
  - Maintain strong responsiveness with container queries and theme support.
  - Provide export options (live HTML, JSON, static bundle).

- Non-Goals (v0.1)
  - Template marketplace publishing UX (planned Sprint 2).
  - Collaborative editing or version control (planned Sprint 3).
  - Analytics & A/B testing (planned Sprint 4).

## 3. Scope and Phases

- Phase 1 (Week 1–2): Core Card Generation API
  - Template engine with 5 essential layouts.
  - Content Generation API (stubbed or simple heuristics; optional LLM later in Phase 4).

- Phase 2 (Week 3–4): Image Generation Integration
  - Multi-provider image adapters (Gemini, DALL·E, Stable Diffusion, Placeholder).
  - Smart placeholder system during async image creation.

- Phase 3 (Week 5): Streaming Architecture
  - SSE endpoint to stream progressive stages (skeleton → content → styles → placeholders → images).

- Phase 4 (Week 6–7): Intelligent Content System
  - LLM integration for content.
  - Context-aware image prompt generation.

## 4. High-Level Architecture

- Client
  - Calls REST APIs for card/presentation generation.
  - Subscribes to SSE for progressive assembly.
  - Renders HTML with container queries and theme variables.

- API Server
  - Routes:
    - POST /api/cards/generate-content
    - POST /api/presentations/generate
    - POST /api/cards/stream (SSE)
  - Services:
    - TemplateEngine (layout rendering + theming)
    - ContentGenerator (LLM, heuristics, mappings)
    - ImageGenerationService (adapters + fallback chain)
    - PlaceholderService (deterministic geometric placeholders)

- Storage (v0.1)
  - None required beyond ephemeral processing. Future: template registry and asset cache.

- Rendering
  - Server returns structured JSON + HTML snippets per section/card.
  - Client or server can compose full page; static export bundles supported.

## 5. Data Model

- Card
  - id: string (uuid)
  - type: string (e.g., "title", "objectives", "grid", "hero")
  - layout: enum ["split", "numbered-list", "grid", "hero", "content-bullets", "hero-overlay"]
  - content: object (layout-specific)
  - theme: object
    - name: string (e.g., "professional")
    - colors: { primary, secondary, accent, bg, text }
    - scale: string (e.g., "md", "lg")
  - image?: string | { status: "generating" | "ready" | "failed"; url?: string; provider?: string }
  - placeholders?: PlaceholderSpec | PlaceholderSpec[]
  - metadata?: { responsiveHints?: object; role?: string; accessibilityNotes?: string }

- PlaceholderSpec
  - type: enum ["geometric", "pattern", "solid"]
  - color: string | "based-on-theme"
  - loadingState: boolean
  - expectedDuration?: number (ms)
  - aspectRatio?: string (e.g., "16:9")

- Content (layout-specific schemas)
  - split
    - title: string
    - body: string | string[]
    - imagePrompt?: string
  - numbered-list
    - intro?: string
    - items: string[]
  - grid (2x2)
    - title?: string
    - cells: Array<{ title?: string; body?: string }>[4]
  - hero / hero-overlay
    - title: string
    - subtitle?: string
    - kicker?: string
    - cta?: { label: string; href?: string }
    - imagePrompt?: string
  - content-bullets
    - title: string
    - bullets: string[]
    - footnote?: string

## 6. API Design

### 6.1 POST /api/cards/generate-content

Request
```
{
  "topic": "AI in Product Discovery",
  "layoutType": "numbered-list",
  "tone": "professional",
  "contentSections": ["title", "objectives", "keyPoints"],
  "style"?: "professional" | "playful" | "minimal",
  "theme"?: { "name"?: string, "colors"?: { "primary"?: string, "bg"?: string } }
}
```

Response
```
{
  "card": {
    "id": "...",
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
    "theme": { "name": "professional" }
  }
}
```

Notes
- Phase 1 may use deterministic templates + heuristics; Phase 4 integrates LLM.

### 6.2 POST /api/presentations/generate

Request
```
{
  "topic": "AI in Product Discovery",
  "cardCount": 6,
  "style": "professional",
  "includeImages": true,
  "provider": "gemini",            // image provider preference
  "layouts"?: ["hero-overlay", "numbered-list", "grid"],
  "theme"?: { "name": "professional" }
}
```

Response
```
{
  "cards": [
    {
      "type": "title",
      "layout": "hero-overlay",
      "content": {
        "title": "AI in Product Discovery",
        "subtitle": "Transforming Ideas into Innovation"
      },
      "image": { "status": "generating", "provider": "gemini" }
    },
    {
      "type": "objectives",
      "layout": "numbered-list",
      "content": {
        "intro": "By the end of this session, you'll be able to:",
        "items": [
          "Identify customer problems using AI on qualitative data",
          "Generate diverse product ideas with AI assistance",
          "Refine and select top ideas using AI scoring"
        ]
      }
    }
  ],
  "topic": "AI in Product Discovery",
  "theme": { "name": "professional" }
}
```

### 6.3 POST /api/cards/stream (SSE)

- Content-Type: text/event-stream
- Stages (order expected, but clients must be resilient):
  1. skeleton → layout skeleton HTML
  2. content → text sections
  3. style → styled components
  4. placeholder → placeholder URLs or inline SVG
  5. image → final generated images

Example stream messages
```
// event: message
// data: {"stage":"skeleton","cardId":"...","html":"<div class='card-skeleton'>..."}

// event: message
// data: {"stage":"content","cardId":"...","section":"title","html":"AI in Product Discovery"}

// event: message
// data: {"stage":"placeholder","cardId":"...","section":"hero","placeholder":{"type":"geometric","color":"based-on-theme","loadingState":true}}

// event: message
// data: {"stage":"image","cardId":"...","section":"hero","url":"https://..."}
```

## 7. Template Engine

- Inputs
  - layout: enum
  - content: layout-specific content object
  - theme: name + colors + scale
  - responsive hints: breakpoints via container queries

- Outputs
  - HTML snippet, CSS classes (Tailwind/DaisyUI), data attributes for testing

- Layouts (Phase 1)
  - split (text + image)
  - numbered-list (objectives/steps)
  - grid (2x2)
  - hero (and hero-overlay variant)
  - content-bullets

- Responsiveness
  - Use existing container query setup to size and adapt components.
  - Ensure keyboard navigation and ARIA roles for accessibility.

## 8. Image Generation Service

Adapter abstraction
```ts
class ImageGenerationService {
  providers = {
    gemini: new GeminiImageAdapter(),
    dalle: new DalleAdapter(),
    'stable-diffusion': new StableDiffusionAdapter(),
    placeholder: new PlaceholderService()
  };

  async generateImage(prompt: string, options: {
    provider?: 'gemini'|'dalle'|'stable-diffusion'|'placeholder',
    aspectRatio?: string,
    style?: string
  }) {
    const provider = this.providers[options.provider || 'gemini'];
    return provider.generate({
      prompt: this.enhancePrompt(prompt, options.style),
      aspectRatio: options.aspectRatio || '16:9',
      style: options.style || 'professional-presentation'
    });
  }
}
```

Fallback chain (MVP)
```
Gemini → Pattern generator → Geometric placeholders
```

## 9. Placeholder System

- While images generate, return deterministic geometric/pattern placeholders.
- Spec example
```
{
  "placeholder": {
    "type": "geometric",
    "color": "based-on-theme",
    "loadingState": true,
    "expectedDuration": 3000
  }
}
```

## 10. Streaming/Progressive Enhancement

- SSE-based pipeline stages (Section 6.3).
- Clients progressively render as stages arrive.
- Timeouts and retries: client should handle missing image events by keeping placeholders.

## 11. Intelligent Content (Phase 4)

- ContentGenerator (LLM-based)
```ts
class ContentGenerator {
  async generateCardContent(spec: {
    layout: string; topic: string; sections: string[]; style?: string
  }) {
    const geminiResponse = await gemini.generate({
      prompt: `Create presentation card content:\nLayout: ${spec.layout}\nTopic: ${spec.topic}\nSections needed: ${spec.sections}\nStyle: ${spec.style}`,
      responseFormat: 'structured_json'
    });
    return this.mapToCardSchema(geminiResponse);
  }
}
```

- Context-aware image prompts
```ts
async function generateImagePrompts(cardContent: any) {
  return {
    hero: `Professional presentation slide image: ${cardContent.title}, abstract geometric style, ${cardContent.theme?.name || 'professional'} colors`,
    icon: `Simple icon representing ${cardContent.keyPoint}`,
    background: `Subtle pattern for ${cardContent.section}`
  };
}
```

## 12. MVP Topics and Defaults

- Topics
  - AI in Product Discovery (matches PDF)
  - Digital Marketing Trends 2025
  - Remote Team Management

- Defaults
  - style: "professional"
  - theme: DaisyUI-friendly palette; accessible contrast ratios

## 13. Export Options

- Live HTML preview (server-rendered page with cards)
- Raw JSON (schema above)
- Static HTML bundle (HTML + CSS + assets)

## 14. Non-Functional Requirements

- Performance
  - Initial HTML skeleton under 200ms on average (server-only target, non-binding in dev).
  - Image generation is async; placeholders must render instantly.
- Accessibility
  - ARIA roles for sections; keyboard focus order preserved.
  - Color contrast AA for text.
- Security
  - No PII processing; rate limiting for generation endpoints.
  - Provider API keys stored server-side; never exposed to clients.
- Observability
  - Log stage timings per card for SSE pipeline.

## 15. Error Handling

- 400: Invalid input (unknown layout, bad schema)
- 429: Rate limit exceeded
- 500: Internal error (provider failure, template rendering error)
- SSE-specific
  - If an image provider fails, emit `{ stage: 'image', status: 'failed' }` and retain placeholder.

## 16. Testing Strategy

- Unit tests
  - TemplateEngine renders required sections with correct classes and data attributes.
  - ContentGenerator maps LLM output to schema.
- E2E tests
  - Streaming order and resilience: skeleton → content → placeholder → image.
  - Layout/theme separation and container query behavior.
  - Accessibility smoke (role landmarks present).
- Visual regression (optional, Phase 2+): baseline for each layout with placeholders.

## 17. Milestones and Acceptance Criteria

- Phase 1 (Week 1–2) Acceptance Criteria
  - Implement POST /api/cards/generate-content returning valid card JSON for each of the 5 layouts.
  - Implement POST /api/presentations/generate that returns a set of 4–8 cards for a topic using the MVP topics list.
  - Template engine outputs HTML snippets per layout with container-query-ready classes.
  - Theme support minimally includes a professional palette.
  - Export JSON and a basic live HTML preview page.

- Phase 2 (Week 3–4)
  - ImageGenerationService with at least one real provider + placeholder fallback.
  - Placeholders render instantly and swap when images are ready.

- Phase 3 (Week 5)
  - /api/cards/stream (SSE) endpoint streaming all stages.

- Phase 4 (Week 6–7)
  - LLM-generated content with structured mapping and prompt templates.

## 18. OpenAPI (abridged)

```yaml
openapi: 3.0.3
info:
  title: Adaptive Cards API
  version: 0.1.0
paths:
  /api/cards/generate-content:
    post:
      summary: Generate content for a single card layout
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/GenerateContentRequest'
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CardResponse'
  /api/presentations/generate:
    post:
      summary: Generate a set of cards for a topic
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/GeneratePresentationRequest'
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PresentationResponse'
components:
  schemas:
    GenerateContentRequest:
      type: object
      properties:
        topic: { type: string }
        layoutType: { type: string, enum: [split, numbered-list, grid, hero, content-bullets] }
        tone: { type: string }
        contentSections: { type: array, items: { type: string } }
        style: { type: string }
        theme: { type: object }
      required: [topic, layoutType]
    CardResponse:
      type: object
      properties:
        card: { $ref: '#/components/schemas/Card' }
    GeneratePresentationRequest:
      type: object
      properties:
        topic: { type: string }
        cardCount: { type: integer, minimum: 1, maximum: 20 }
        style: { type: string }
        includeImages: { type: boolean }
        provider: { type: string, enum: [gemini, dalle, stable-diffusion, placeholder] }
        layouts: { type: array, items: { type: string } }
        theme: { type: object }
      required: [topic]
    PresentationResponse:
      type: object
      properties:
        cards:
          type: array
          items: { $ref: '#/components/schemas/Card' }
        topic: { type: string }
        theme: { type: object }
    Card:
      type: object
      properties:
        id: { type: string }
        type: { type: string }
        layout: { type: string }
        content: { type: object }
        theme: { type: object }
        image: { type: [string, object] }
        placeholders: { type: [object, array] }
```

## 19. Assumptions and Open Questions

- Assumptions
  - Server runs Node with Vite/Tailwind/DaisyUI on the client.
  - Container queries are already wired and available in the CSS pipeline.
  - Initial LLM provider likely Gemini; can be feature-flagged.

- Open Questions
  - Do we store generated images or URLs persistently?
  - Do we allow custom user-defined templates in Phase 1 or wait for Sprint 2 registry?
  - How do we scope per-tenant theming (env, headers, or payload)?

## 20. Next Steps (For Devs)

- Phase 1 Implementation Checklist
  - [ ] Define schemas and DTOs for requests/responses.
  - [ ] Implement TemplateEngine for 5 layouts.
  - [ ] Implement /api/cards/generate-content with deterministic content mapping.
  - [ ] Implement /api/presentations/generate assembling 6-card sets for MVP topics.
  - [ ] Build live HTML preview route and JSON export.
  - [ ] Add unit/e2e tests for layout rendering and theme separation.

- Phase 2 Preparation
  - [ ] Define ImageGenerationService interface + adapters.
  - [ ] Implement PlaceholderService and fallback chain.

- Phase 3 Preparation
  - [ ] Implement SSE streaming endpoint with staged outputs.

- Phase 4 Preparation
  - [ ] Wire LLM content generation and mapping functions.
