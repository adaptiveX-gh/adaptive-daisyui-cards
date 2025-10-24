# Phase 4 Architecture: LLM-Powered Content Generation

**Status:** Design Complete - Ready for Implementation
**Version:** 1.0
**Author:** Backend System Architect
**Date:** 2025-10-24

## Executive Summary

Phase 4 introduces intelligent, LLM-powered content generation to replace the static content database from Phase 1. The architecture is modular, content-first, and designed to be reusable across different contexts (API, Claude Code skills, CLI tools).

**Key Design Principles:**
1. **Content-First**: Start with narrative structure before visual design
2. **Modular Prompts**: Separate concerns (structure, visuals, copy)
3. **Framework-Driven**: Apply presentation frameworks (pitch, education, workshop, etc.)
4. **Provider-Agnostic**: Easy to swap LLM providers
5. **Backward Compatible**: Existing streaming API unchanged

---

## Architecture Overview

### Service Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Existing)                     │
│  POST /api/presentations/stream?mode=smart                  │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│              LLMContentGenerator (NEW)                      │
│  Orchestrates the 3-stage content generation pipeline       │
└─────┬───────────────┬────────────────┬──────────────────────┘
      │               │                │
┌─────▼───────┐  ┌───▼──────────┐  ┌──▼─────────────┐
│Presentation │  │    Visual    │  │   Copywriter   │
│  Designer   │  │   Designer   │  │   (Stage 3)    │
│ (Stage 1)   │  │  (Stage 2)   │  │                │
└─────┬───────┘  └───┬──────────┘  └──┬─────────────┘
      │              │                │
      │              │                │
┌─────▼──────────────▼────────────────▼─────────────┐
│          LLMProviderAdapter (Abstract)             │
│   • GeminiAdapter (default)                        │
│   • GPTAdapter (future)                            │
│   • ClaudeAdapter (future)                         │
└────────────────────────────────────────────────────┘
```

### Data Flow

```
1. Topic Input
   └─> PresentationDesigner
       ├─> Analyze topic
       ├─> Apply framework (pitch/education/etc.)
       ├─> Generate outline (sections + flow)
       └─> Output: Narrative structure
           │
2. Structure    │
   └────────────┴─> VisualDesigner
                    ├─> Map sections to layouts
                    ├─> Consider visual hierarchy
                    ├─> Design image prompts
                    └─> Output: Layout assignments
                        │
3. Layout Assignments  │
   └───────────────────┴─> Copywriter
                           ├─> Generate section titles
                           ├─> Write body content
                           ├─> Craft CTAs
                           └─> Output: Complete cards
                               │
4. Complete Cards          │
   └────────────────────────┴─> StreamingService (Existing)
                               └─> SSE to client
```

---

## Directory Structure

```
api/
├── services/
│   ├── ContentGenerator.js              # Existing (Phase 1)
│   ├── LLMContentGenerator.js           # NEW - Main orchestrator
│   ├── llm/
│   │   ├── PresentationDesigner.js      # NEW - Stage 1: Outline
│   │   ├── VisualDesigner.js            # NEW - Stage 2: Layouts
│   │   ├── Copywriter.js                # NEW - Stage 3: Copy
│   │   └── PromptLoader.js              # NEW - Load prompt templates
│   └── adapters/
│       ├── LLMProviderAdapter.js        # NEW - Abstract base
│       └── GeminiLLMAdapter.js          # NEW - Gemini implementation
│
├── prompts/                              # NEW - Markdown templates
│   ├── presentation-designer/
│   │   ├── base.md                      # Core instructions
│   │   ├── frameworks/
│   │   │   ├── pitch.md                 # Investor pitch framework
│   │   │   ├── education.md             # Educational presentation
│   │   │   ├── report.md                # Business report
│   │   │   ├── workshop.md              # Workshop/training
│   │   │   └── story.md                 # Narrative storytelling
│   │   └── examples/                    # Few-shot examples
│   │       ├── pitch-example.json
│   │       └── education-example.json
│   │
│   ├── visual-designer/
│   │   ├── base.md                      # Core visual design rules
│   │   ├── layouts/
│   │   │   ├── layout-catalog.md        # All 6 layouts explained
│   │   │   ├── hero-selection.md        # When to use hero
│   │   │   ├── grid-selection.md        # When to use grid
│   │   │   └── split-selection.md       # When to use split
│   │   └── image-prompts.md             # Image prompt best practices
│   │
│   └── copywriter/
│       ├── base.md                      # Core copywriting principles
│       ├── sections/
│       │   ├── title-generation.md      # Headline writing
│       │   ├── body-generation.md       # Body text
│       │   ├── bullets-generation.md    # Bullet points
│       │   └── cta-generation.md        # Call-to-action
│       └── tone/
│           ├── professional.md          # Professional tone
│           ├── casual.md                # Casual tone
│           └── technical.md             # Technical tone
│
├── routes/
│   └── presentations.js                 # UPDATED - Add mode param
│
└── models/
    └── schemas.js                       # Existing
```

---

## Service Interfaces

### 1. LLMContentGenerator (Main Orchestrator)

**File:** `api/services/LLMContentGenerator.js`

```javascript
/**
 * LLMContentGenerator - Orchestrates 3-stage content generation
 *
 * Stage 1: PresentationDesigner → Structure/outline
 * Stage 2: VisualDesigner → Layout selection
 * Stage 3: Copywriter → Final copy
 */
class LLMContentGenerator {
  constructor(config = {}) {
    this.llmAdapter = config.llmAdapter || new GeminiLLMAdapter();
    this.promptLoader = new PromptLoader();

    this.presentationDesigner = new PresentationDesigner(
      this.llmAdapter,
      this.promptLoader
    );

    this.visualDesigner = new VisualDesigner(
      this.llmAdapter,
      this.promptLoader
    );

    this.copywriter = new Copywriter(
      this.llmAdapter,
      this.promptLoader
    );
  }

  /**
   * Generate complete presentation using LLM
   *
   * @param {Object} params
   * @param {string} params.topic - Presentation topic
   * @param {number} params.cardCount - Number of cards (4-8)
   * @param {string} params.presentationType - pitch|education|report|workshop|story
   * @param {string} params.audience - technical|executive|general|mixed
   * @param {string} params.style - professional|casual|technical
   * @param {string} params.tone - Optional tone override
   * @returns {Promise<Object>} - { cards: Array<Card> }
   */
  async generatePresentation({
    topic,
    cardCount = 6,
    presentationType = 'education',
    audience = 'general',
    style = 'professional',
    tone = null
  }) {
    // Stage 1: Generate narrative structure
    const structure = await this.presentationDesigner.generateStructure({
      topic,
      cardCount,
      presentationType,
      audience
    });

    // Stage 2: Assign layouts and visual design
    const layoutPlan = await this.visualDesigner.assignLayouts({
      structure,
      style,
      cardCount
    });

    // Stage 3: Generate final copy for each section
    const cards = await this.copywriter.generateCards({
      layoutPlan,
      structure,
      tone: tone || style,
      audience
    });

    return {
      cards,
      metadata: {
        topic,
        presentationType,
        audience,
        generatedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Generate single card using LLM
   */
  async generateCard({
    topic,
    layoutType,
    section,
    style = 'professional',
    audience = 'general'
  }) {
    // Simplified single-card generation
    const miniStructure = await this.presentationDesigner.generateSection({
      topic,
      section,
      audience
    });

    const layoutPlan = await this.visualDesigner.assignLayout({
      section: miniStructure,
      layoutType,
      style
    });

    const card = await this.copywriter.generateCard({
      layoutPlan,
      section: miniStructure,
      tone: style,
      audience
    });

    return card;
  }
}

export default LLMContentGenerator;
```

---

### 2. PresentationDesigner (Stage 1)

**File:** `api/services/llm/PresentationDesigner.js`

```javascript
/**
 * PresentationDesigner - Stage 1: Narrative Structure
 *
 * Responsibilities:
 * - Analyze topic and audience
 * - Apply presentation framework
 * - Generate outline with logical flow
 * - Define section purposes
 */
class PresentationDesigner {
  constructor(llmAdapter, promptLoader) {
    this.llm = llmAdapter;
    this.promptLoader = promptLoader;
  }

  async generateStructure({
    topic,
    cardCount,
    presentationType,
    audience
  }) {
    // Load base prompt + framework-specific prompt
    const basePrompt = await this.promptLoader.load(
      'presentation-designer/base.md'
    );

    const frameworkPrompt = await this.promptLoader.load(
      `presentation-designer/frameworks/${presentationType}.md`
    );

    // Load few-shot examples
    const examples = await this.promptLoader.loadExamples(
      `presentation-designer/examples/${presentationType}-example.json`
    );

    // Compose final prompt
    const prompt = this.composePrompt({
      basePrompt,
      frameworkPrompt,
      examples,
      topic,
      cardCount,
      audience
    });

    // Call LLM
    const response = await this.llm.generate({
      prompt,
      temperature: 0.7,
      maxTokens: 2000
    });

    // Parse and validate structure
    const structure = this.parseStructure(response);

    return structure;
  }

  composePrompt({
    basePrompt,
    frameworkPrompt,
    examples,
    topic,
    cardCount,
    audience
  }) {
    return `${basePrompt}

${frameworkPrompt}

## Examples
${JSON.stringify(examples, null, 2)}

## Your Task
Topic: ${topic}
Card Count: ${cardCount}
Audience: ${audience}

Generate a presentation outline following the framework above.`;
  }

  parseStructure(llmResponse) {
    // Parse JSON structure from LLM response
    // Expected format:
    // {
    //   sections: [
    //     {
    //       id: 'intro',
    //       title: 'Introduction',
    //       purpose: 'Hook the audience',
    //       keyPoints: ['...', '...'],
    //       suggestedLength: 'short'
    //     },
    //     ...
    //   ],
    //   flow: 'linear|modular',
    //   narrativeArc: 'problem-solution|journey|comparison'
    // }

    const parsed = JSON.parse(llmResponse);

    // Validate required fields
    this.validateStructure(parsed);

    return parsed;
  }

  validateStructure(structure) {
    if (!structure.sections || !Array.isArray(structure.sections)) {
      throw new Error('Invalid structure: missing sections array');
    }

    for (const section of structure.sections) {
      if (!section.id || !section.title || !section.purpose) {
        throw new Error(`Invalid section: ${JSON.stringify(section)}`);
      }
    }
  }
}

export default PresentationDesigner;
```

---

### 3. VisualDesigner (Stage 2)

**File:** `api/services/llm/VisualDesigner.js`

```javascript
/**
 * VisualDesigner - Stage 2: Layout Selection
 *
 * Responsibilities:
 * - Map sections to appropriate layouts
 * - Design visual hierarchy
 * - Generate image prompts
 * - Consider information density
 */
class VisualDesigner {
  constructor(llmAdapter, promptLoader) {
    this.llm = llmAdapter;
    this.promptLoader = promptLoader;
  }

  async assignLayouts({
    structure,
    style,
    cardCount
  }) {
    // Load layout catalog and selection guides
    const basePrompt = await this.promptLoader.load(
      'visual-designer/base.md'
    );

    const layoutCatalog = await this.promptLoader.load(
      'visual-designer/layouts/layout-catalog.md'
    );

    const imagePromptGuide = await this.promptLoader.load(
      'visual-designer/image-prompts.md'
    );

    // Compose prompt
    const prompt = this.composePrompt({
      basePrompt,
      layoutCatalog,
      imagePromptGuide,
      structure,
      style
    });

    // Call LLM
    const response = await this.llm.generate({
      prompt,
      temperature: 0.5, // Lower temp for more consistent layout choices
      maxTokens: 1500
    });

    // Parse layout plan
    const layoutPlan = this.parseLayoutPlan(response);

    return layoutPlan;
  }

  composePrompt({
    basePrompt,
    layoutCatalog,
    imagePromptGuide,
    structure,
    style
  }) {
    return `${basePrompt}

## Available Layouts
${layoutCatalog}

## Image Prompt Guidelines
${imagePromptGuide}

## Presentation Structure
${JSON.stringify(structure, null, 2)}

## Style
${style}

## Your Task
For each section in the structure, select the most appropriate layout and design image prompts.`;
  }

  parseLayoutPlan(llmResponse) {
    // Expected format:
    // {
    //   cards: [
    //     {
    //       sectionId: 'intro',
    //       layout: 'hero-overlay',
    //       imagePrompt: 'modern technology abstract background',
    //       visualHierarchy: 'title-first',
    //       informationDensity: 'low'
    //     },
    //     ...
    //   ]
    // }

    const parsed = JSON.parse(llmResponse);
    this.validateLayoutPlan(parsed);
    return parsed;
  }

  validateLayoutPlan(layoutPlan) {
    const validLayouts = [
      'split',
      'numbered-list',
      'grid',
      'hero',
      'hero-overlay',
      'content-bullets'
    ];

    for (const card of layoutPlan.cards) {
      if (!validLayouts.includes(card.layout)) {
        throw new Error(`Invalid layout: ${card.layout}`);
      }
    }
  }
}

export default VisualDesigner;
```

---

### 4. Copywriter (Stage 3)

**File:** `api/services/llm/Copywriter.js`

```javascript
/**
 * Copywriter - Stage 3: Final Copy Generation
 *
 * Responsibilities:
 * - Generate compelling titles
 * - Write concise body text
 * - Craft effective bullets
 * - Create clear CTAs
 */
class Copywriter {
  constructor(llmAdapter, promptLoader) {
    this.llm = llmAdapter;
    this.promptLoader = promptLoader;
  }

  async generateCards({
    layoutPlan,
    structure,
    tone,
    audience
  }) {
    const cards = [];

    for (let i = 0; i < layoutPlan.cards.length; i++) {
      const layoutCard = layoutPlan.cards[i];
      const section = structure.sections[i];

      const card = await this.generateCard({
        layoutCard,
        section,
        tone,
        audience
      });

      cards.push(card);
    }

    return cards;
  }

  async generateCard({
    layoutCard,
    section,
    tone,
    audience
  }) {
    // Load prompts based on layout type
    const basePrompt = await this.promptLoader.load(
      'copywriter/base.md'
    );

    const tonePrompt = await this.promptLoader.load(
      `copywriter/tone/${tone}.md`
    );

    // Load layout-specific generation guides
    const layoutGuides = await this.loadLayoutGuides(layoutCard.layout);

    // Compose prompt
    const prompt = this.composePrompt({
      basePrompt,
      tonePrompt,
      layoutGuides,
      layoutCard,
      section,
      audience
    });

    // Call LLM
    const response = await this.llm.generate({
      prompt,
      temperature: 0.8, // Higher temp for creative copy
      maxTokens: 1000
    });

    // Parse and format content
    const content = this.parseContent(response, layoutCard.layout);

    // Build final card object
    return {
      type: section.id,
      layout: layoutCard.layout,
      content,
      imagePrompt: layoutCard.imagePrompt
    };
  }

  async loadLayoutGuides(layoutType) {
    // Load specific guides for each content field
    const guides = {};

    // All layouts need title
    guides.title = await this.promptLoader.load(
      'copywriter/sections/title-generation.md'
    );

    // Layout-specific fields
    switch (layoutType) {
      case 'numbered-list':
        guides.items = await this.promptLoader.load(
          'copywriter/sections/bullets-generation.md'
        );
        break;

      case 'grid':
        guides.cells = await this.promptLoader.load(
          'copywriter/sections/body-generation.md'
        );
        break;

      case 'hero':
      case 'hero-overlay':
        guides.cta = await this.promptLoader.load(
          'copywriter/sections/cta-generation.md'
        );
        break;

      // ... other layouts
    }

    return guides;
  }

  composePrompt({
    basePrompt,
    tonePrompt,
    layoutGuides,
    layoutCard,
    section,
    audience
  }) {
    return `${basePrompt}

## Tone
${tonePrompt}

## Layout-Specific Guidelines
${Object.values(layoutGuides).join('\n\n')}

## Section Details
${JSON.stringify(section, null, 2)}

## Layout
${layoutCard.layout}

## Audience
${audience}

## Your Task
Generate compelling copy for this card following the guidelines above.`;
  }

  parseContent(llmResponse, layoutType) {
    // Parse based on layout schema
    const parsed = JSON.parse(llmResponse);

    // Validate against layout schema
    this.validateContent(parsed, layoutType);

    return parsed;
  }

  validateContent(content, layoutType) {
    // Validate against schemas from models/schemas.js
    const schemas = require('../../models/schemas.js');
    const schema = schemas[layoutType];

    if (!schema) {
      throw new Error(`No schema found for layout: ${layoutType}`);
    }

    // Validate required fields
    for (const field of schema.required) {
      if (!content[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
  }
}

export default Copywriter;
```

---

## LLM Provider Adapters

### Abstract Base Adapter

**File:** `api/services/adapters/LLMProviderAdapter.js`

```javascript
/**
 * Abstract LLM Provider Adapter
 * Defines interface for all LLM providers
 */
class LLMProviderAdapter {
  /**
   * Generate text from prompt
   *
   * @param {Object} params
   * @param {string} params.prompt - The prompt text
   * @param {number} params.temperature - 0.0-1.0 creativity
   * @param {number} params.maxTokens - Max response length
   * @param {Array<string>} params.stopSequences - Stop generation at these
   * @returns {Promise<string>} - Generated text
   */
  async generate({
    prompt,
    temperature = 0.7,
    maxTokens = 2000,
    stopSequences = []
  }) {
    throw new Error('generate() must be implemented by subclass');
  }

  /**
   * Generate with streaming (for future use)
   */
  async *generateStream(params) {
    throw new Error('generateStream() must be implemented by subclass');
  }

  /**
   * Get provider name
   */
  getName() {
    throw new Error('getName() must be implemented by subclass');
  }

  /**
   * Check if provider is available
   */
  async isAvailable() {
    throw new Error('isAvailable() must be implemented by subclass');
  }
}

export default LLMProviderAdapter;
```

---

### Gemini Implementation

**File:** `api/services/adapters/GeminiLLMAdapter.js`

```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';
import LLMProviderAdapter from './LLMProviderAdapter.js';

/**
 * Gemini LLM Adapter
 * Uses Google's Generative AI SDK
 */
class GeminiLLMAdapter extends LLMProviderAdapter {
  constructor(config = {}) {
    super();

    this.apiKey = config.apiKey || process.env.GEMINI_API_KEY;
    this.modelName = config.modelName || 'gemini-2.0-flash-exp';
    this.mockMode = config.mockMode || process.env.GEMINI_MOCK_MODE === 'true';

    if (!this.mockMode && !this.apiKey) {
      throw new Error('Gemini API key required (set GEMINI_API_KEY)');
    }

    if (!this.mockMode) {
      this.client = new GoogleGenerativeAI(this.apiKey);
      this.model = this.client.getGenerativeModel({ model: this.modelName });
    }
  }

  async generate({
    prompt,
    temperature = 0.7,
    maxTokens = 2000,
    stopSequences = []
  }) {
    if (this.mockMode) {
      return this.generateMock(prompt);
    }

    try {
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
          stopSequences: stopSequences.length > 0 ? stopSequences : undefined
        }
      });

      const response = result.response;
      return response.text();

    } catch (error) {
      console.error('Gemini generation error:', error);
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }

  generateMock(prompt) {
    // Mock response for testing
    console.log('[GeminiLLMAdapter] Mock mode - generating test response');

    // Return valid JSON based on prompt type
    if (prompt.includes('presentation outline')) {
      return JSON.stringify({
        sections: [
          {
            id: 'intro',
            title: 'Introduction',
            purpose: 'Hook the audience',
            keyPoints: ['Key point 1', 'Key point 2'],
            suggestedLength: 'short'
          }
        ],
        flow: 'linear',
        narrativeArc: 'problem-solution'
      });
    }

    // Default mock
    return JSON.stringify({
      title: 'Mock Generated Content',
      body: 'This is mock content generated in test mode.'
    });
  }

  getName() {
    return 'gemini';
  }

  async isAvailable() {
    if (this.mockMode) return true;

    try {
      // Test with simple prompt
      await this.generate({
        prompt: 'Test',
        maxTokens: 10
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default GeminiLLMAdapter;
```

---

## Prompt Template System

### PromptLoader

**File:** `api/services/llm/PromptLoader.js`

```javascript
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * PromptLoader - Loads and caches prompt templates
 */
class PromptLoader {
  constructor(promptsDir = null) {
    this.promptsDir = promptsDir || path.join(__dirname, '../../prompts');
    this.cache = new Map();
  }

  /**
   * Load a prompt template by path
   *
   * @param {string} promptPath - Relative path from prompts dir
   * @returns {Promise<string>} - Prompt content
   */
  async load(promptPath) {
    // Check cache
    if (this.cache.has(promptPath)) {
      return this.cache.get(promptPath);
    }

    const fullPath = path.join(this.promptsDir, promptPath);

    try {
      const content = await fs.readFile(fullPath, 'utf-8');

      // Cache for future use
      this.cache.set(promptPath, content);

      return content;
    } catch (error) {
      throw new Error(`Failed to load prompt: ${promptPath} - ${error.message}`);
    }
  }

  /**
   * Load JSON examples
   */
  async loadExamples(examplesPath) {
    const fullPath = path.join(this.promptsDir, examplesPath);

    try {
      const content = await fs.readFile(fullPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to load examples: ${examplesPath} - ${error.message}`);
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Reload a specific prompt (bypass cache)
   */
  async reload(promptPath) {
    this.cache.delete(promptPath);
    return this.load(promptPath);
  }
}

export default PromptLoader;
```

---

## API Integration

### Updated Streaming Endpoint

**File:** `api/routes/presentations.js` (add new route)

```javascript
/**
 * POST /api/presentations/stream
 *
 * New parameter: mode = 'fast' | 'smart'
 * - fast: Use existing ContentGenerator (Phase 1 database)
 * - smart: Use LLMContentGenerator (Phase 4 LLM)
 */
router.post('/presentations/stream', sseMiddleware, async (req, res) => {
  const clientId = generateClientId();

  try {
    const {
      topic,
      cardCount = 6,
      style = 'professional',
      mode = 'fast',              // NEW
      presentationType = 'education',  // NEW
      audience = 'general',       // NEW
      includeImages = false,
      provider = 'gemini',
      theme,
      streamDelay
    } = req.body;

    // Validate
    if (!topic) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Field "topic" is required'
      });
    }

    let cards;

    if (mode === 'smart') {
      // NEW: LLM-powered generation
      const llmGenerator = new LLMContentGenerator();

      const result = await llmGenerator.generatePresentation({
        topic,
        cardCount,
        presentationType,
        audience,
        style
      });

      cards = result.cards.map(cardData => new Card(cardData));

    } else {
      // EXISTING: Database generation
      const presentationData = contentGenerator.generatePresentation({
        topic,
        cardCount,
        style
      });

      cards = presentationData.cards.map(cardData => new Card(cardData));
    }

    // Rest of streaming logic unchanged...
    // (existing code continues)
  }
});
```

---

## Prompt Templates Structure

### Example: Pitch Framework

**File:** `api/prompts/presentation-designer/frameworks/pitch.md`

```markdown
# Investor Pitch Framework

You are an expert pitch deck designer helping entrepreneurs create compelling investor presentations.

## Framework Structure

A successful pitch deck follows this narrative arc:

1. **Hook** (1 card) - Grab attention with the problem or opportunity
2. **Problem** (1 card) - Paint the pain point vividly
3. **Solution** (1-2 cards) - Introduce your product/service
4. **Market** (1 card) - Show market size and opportunity
5. **Business Model** (1 card) - Explain how you make money
6. **Traction** (1 card) - Proof it works (metrics, customers)
7. **Ask** (1 card) - Clear call to action

## Key Principles

- **Start strong**: First card must hook investors in 10 seconds
- **Tell a story**: Connect problem → solution → future
- **Be specific**: Numbers, names, real examples
- **Show momentum**: Growth, traction, validation
- **End with clarity**: What you're asking for

## Section Guidelines

### Hook Card
- Purpose: Grab attention immediately
- Approach: Bold statement, surprising stat, or provocative question
- Length: Short and punchy

### Problem Card
- Purpose: Make them feel the pain
- Approach: Specific examples, real user quotes, cost of problem
- Length: Concise but vivid

### Solution Card
- Purpose: Position your product as the answer
- Approach: Clear value prop, key features, differentiation
- Length: Medium - enough detail to understand

### Market Card
- Purpose: Show opportunity size
- Approach: TAM/SAM/SOM, growth trends, market forces
- Length: Medium - data-driven

### Business Model Card
- Purpose: Explain revenue model
- Approach: Pricing, unit economics, customer lifetime value
- Length: Short - clarity over complexity

### Traction Card
- Purpose: Prove validation
- Approach: Metrics, customers, revenue, growth charts
- Length: Short - let numbers speak

### Ask Card
- Purpose: Clear next steps
- Approach: Funding amount, use of funds, timeline
- Length: Short and direct

## Output Format

Generate a JSON structure with:
- sections: Array of section objects
- Each section has: id, title, purpose, keyPoints, suggestedLength
- flow: 'linear' (pitch decks are always linear)
- narrativeArc: 'problem-solution'
```

---

### Example: Layout Catalog

**File:** `api/prompts/visual-designer/layouts/layout-catalog.md`

```markdown
# Layout Catalog

You have 6 layout options. Choose based on content type and information density.

## 1. split
**Best for:** Concept + visual pairing, side-by-side comparisons
**Information density:** Medium
**Structure:**
- Left: Text content (title, body paragraphs)
- Right: Image
**Use when:**
- Explaining a concept with visual aid
- Before/after comparisons
- Process explanations

**Example sections:** Problem explanation, Solution overview, Methodology

## 2. numbered-list
**Best for:** Sequential steps, ordered items, rankings
**Information density:** Medium-high
**Structure:**
- Large numbers (1, 2, 3...)
- Short item descriptions
**Use when:**
- Steps in a process
- Top N items
- Ordered priorities

**Example sections:** Process steps, Key metrics, Top strategies

## 3. grid
**Best for:** Multiple related items, feature comparisons, categories
**Information density:** High
**Structure:**
- 2x2 or 3x1 grid of cells
- Each cell has title + body
**Use when:**
- Comparing features
- Showing categories
- Multiple benefits

**Example sections:** Feature comparison, Market segments, Benefits overview

## 4. hero
**Best for:** Opening/closing, major announcements, CTAs
**Information density:** Low
**Structure:**
- Large title
- Subtitle
- Side image
- Optional CTA button
**Use when:**
- Title slide
- Section breaks
- Closing/CTA slide

**Example sections:** Introduction, Conclusion, Call to action

## 5. hero-overlay
**Best for:** High-impact openings, emotional appeal
**Information density:** Very low
**Structure:**
- Full-bleed background image
- Text overlay with gradient
- Large typography
**Use when:**
- Maximum impact needed
- Emotional connection
- Presentation opener

**Example sections:** Title slide, Inspirational close

## 6. content-bullets
**Best for:** Lists, key takeaways, feature lists
**Information density:** Medium-high
**Structure:**
- Title
- Bulleted list (4-6 items)
- Optional footnote
**Use when:**
- Key points summary
- Feature lists
- Benefits/advantages

**Example sections:** Key benefits, What you'll learn, Requirements

## Selection Strategy

1. **Opening card:** Use hero-overlay or hero for maximum impact
2. **Middle cards:** Vary between split, grid, numbered-list, content-bullets
3. **Closing card:** Use hero with CTA
4. **Avoid repetition:** Don't use same layout 3 times in a row
5. **Match content:** High-density content → grid/bullets, Low-density → hero
```

---

### Example: Title Generation

**File:** `api/prompts/copywriter/sections/title-generation.md`

```markdown
# Title Generation Guidelines

Titles are the most important element of your card. They must be:
- **Clear**: Audience understands immediately
- **Compelling**: Makes them want to read more
- **Concise**: 5-8 words maximum
- **Action-oriented**: Use strong verbs when possible

## Title Types by Layout

### Hero/Hero-Overlay Titles
- Largest text on slide
- Can be bold, provocative, or inspirational
- Examples:
  - "Transform Your Product Discovery"
  - "The Future of Remote Work"
  - "AI-Powered Marketing Starts Here"

### Split/Grid/Bullets Titles
- Informative and specific
- Sets context for content below
- Examples:
  - "Why AI-Powered Discovery Works"
  - "Common Remote Challenges"
  - "Winning Strategies for 2025"

### Numbered-List Titles
- Often starts with "How to" or question
- Promises value delivery
- Examples:
  - "How to Get Started"
  - "What You'll Learn Today"
  - "Your 5-Step Success Plan"

## Power Words

Use these for impact:
- Transform, Discover, Master, Unlock
- Proven, Essential, Critical, Game-changing
- Simple, Effortless, Instant, Automatic

## Avoid

- Generic phrases: "About Us", "Introduction"
- Jargon without context
- Questions without answers
- Titles longer than 10 words
```

---

## Environment Variables

**File:** `.env.example` (additions)

```bash
# Phase 4: LLM Content Generation
# Default LLM provider (gemini|gpt|claude)
LLM_PROVIDER=gemini

# Model selection
GEMINI_TEXT_MODEL=gemini-2.0-flash-exp
# GPT_MODEL=gpt-4-turbo
# CLAUDE_MODEL=claude-3-5-sonnet-20241022

# LLM generation settings
LLM_TEMPERATURE=0.7
LLM_MAX_TOKENS=2000
LLM_TIMEOUT=30000

# Enable mock mode for testing without API costs
LLM_MOCK_MODE=false

# Prompt caching (speeds up repeated generations)
PROMPT_CACHE_ENABLED=true
PROMPT_CACHE_TTL=3600000
```

---

## Testing Strategy

### Unit Tests

```javascript
// Test PresentationDesigner
describe('PresentationDesigner', () => {
  it('generates valid structure for pitch', async () => {
    const designer = new PresentationDesigner(mockLLM, promptLoader);

    const structure = await designer.generateStructure({
      topic: 'AI Product',
      cardCount: 6,
      presentationType: 'pitch',
      audience: 'investors'
    });

    expect(structure.sections).toHaveLength(6);
    expect(structure.flow).toBe('linear');
    expect(structure.narrativeArc).toBe('problem-solution');
  });
});

// Test VisualDesigner
describe('VisualDesigner', () => {
  it('assigns appropriate layouts', async () => {
    const designer = new VisualDesigner(mockLLM, promptLoader);

    const layoutPlan = await designer.assignLayouts({
      structure: mockStructure,
      style: 'professional',
      cardCount: 6
    });

    expect(layoutPlan.cards[0].layout).toBe('hero-overlay');
    expect(layoutPlan.cards[5].layout).toBe('hero');
  });
});

// Test Copywriter
describe('Copywriter', () => {
  it('generates valid content for split layout', async () => {
    const copywriter = new Copywriter(mockLLM, promptLoader);

    const card = await copywriter.generateCard({
      layoutCard: { layout: 'split', imagePrompt: '...' },
      section: mockSection,
      tone: 'professional',
      audience: 'general'
    });

    expect(card.content.title).toBeDefined();
    expect(card.content.body).toBeDefined();
  });
});
```

---

## Migration Plan

### Phase 1: Foundation (Week 1)
1. Create directory structure
2. Implement LLMProviderAdapter base class
3. Implement GeminiLLMAdapter
4. Implement PromptLoader
5. Write first prompt template (education framework)

### Phase 2: Core Services (Week 2)
1. Implement PresentationDesigner
2. Implement VisualDesigner
3. Implement Copywriter
4. Create remaining prompt templates
5. Unit tests for each service

### Phase 3: Integration (Week 3)
1. Implement LLMContentGenerator orchestrator
2. Update streaming routes with `mode` parameter
3. Add environment variables
4. Integration tests

### Phase 4: Polish (Week 4)
1. Add all presentation frameworks (pitch, education, report, workshop, story)
2. Add all copywriting guides
3. Performance optimization (prompt caching)
4. Documentation and examples
5. E2E testing

---

## Performance Considerations

### Latency
- **PresentationDesigner**: ~2-5s (structure generation)
- **VisualDesigner**: ~1-3s (layout selection)
- **Copywriter**: ~2-4s per card
- **Total for 6 cards**: ~20-35s

### Optimization Strategies
1. **Prompt caching**: Cache loaded prompts in memory
2. **Parallel generation**: Generate cards in parallel (Stage 3)
3. **Streaming LLM**: Use streaming API for faster TTFB
4. **Model selection**: Use faster models (flash vs pro)

### Cost
- Gemini 2.0 Flash: ~$0.10 per 1M input tokens
- Average presentation: ~5K input + 3K output tokens
- Cost per generation: ~$0.001 (very cheap)

---

## Scaling Considerations

### Horizontal Scaling
- Stateless design allows easy scaling
- LLM adapters are thread-safe
- Prompt templates loaded from disk (shared across instances)

### Rate Limiting
- Implement per-user rate limits on `/stream?mode=smart`
- Track LLM API quota usage
- Fallback to `mode=fast` if quota exceeded

### Monitoring
- Log LLM response times
- Track generation success/failure rates
- Monitor token usage per request
- Alert on high latency or errors

---

## Security

### API Key Management
- Store in environment variables
- Never log API keys
- Rotate keys regularly
- Use separate keys for dev/staging/prod

### Input Validation
- Sanitize topic input (XSS prevention)
- Limit cardCount (1-20)
- Validate presentationType against whitelist
- Rate limit per IP

### Output Validation
- Validate LLM responses against schemas
- Sanitize HTML output
- Check for injection attempts
- Log suspicious patterns

---

## Future Enhancements

### Phase 5: Advanced Features
1. **Multi-language**: Generate presentations in multiple languages
2. **Brand voice**: Train on company's existing content
3. **Collaborative editing**: Real-time multiplayer editing
4. **A/B testing**: Generate multiple variants

### Phase 6: Claude Skills Integration
1. Export as reusable Claude Code skill
2. Interactive refinement with Claude
3. Template library management
4. Style guide enforcement

---

## Summary

This architecture provides:

1. **Modularity**: Three independent services (Designer, Visual, Copywriter)
2. **Content-First**: Start with narrative before visuals
3. **Framework-Driven**: Apply proven presentation patterns
4. **Provider-Agnostic**: Easy to swap LLM providers
5. **Backward Compatible**: Existing API unchanged
6. **Testable**: Clear interfaces and mock support
7. **Extensible**: Easy to add new frameworks and layouts

**Key Files to Create:**
- 9 service files (LLMContentGenerator, PresentationDesigner, VisualDesigner, Copywriter, PromptLoader, adapters)
- 20+ prompt templates (frameworks, layouts, copywriting guides)
- 1 updated route file
- Unit tests for all services

**Estimated LOC:** ~2,500 lines of code + prompts

Ready for implementation!
