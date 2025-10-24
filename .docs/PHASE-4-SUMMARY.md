# Phase 4 Architecture Summary

**Quick Reference Guide for LLM-Powered Content Generation**

## Overview

Phase 4 replaces the static content database (Phase 1) with intelligent, LLM-powered content generation. The architecture is modular, content-first, and framework-driven.

**Key Documents:**
- **Full Architecture**: `.docs/PHASE-4-ARCHITECTURE.md` (comprehensive design, 700+ lines)
- **Implementation Checklist**: `.docs/PHASE-4-IMPLEMENTATION-CHECKLIST.md` (week-by-week tasks)
- **This Summary**: Quick reference and decision guide

---

## Core Concept: 3-Stage Pipeline

```
Topic Input
    ↓
┌─────────────────┐
│Stage 1:         │  → Narrative structure (outline, flow, purpose)
│Presentation     │
│Designer         │
└────────┬────────┘
         ↓
┌─────────────────┐
│Stage 2:         │  → Layout assignments (visual design per section)
│Visual Designer  │
└────────┬────────┘
         ↓
┌─────────────────┐
│Stage 3:         │  → Final copy (titles, body text, bullets, CTAs)
│Copywriter       │
└────────┬────────┘
         ↓
    Complete Cards → Streaming API (existing)
```

**Why 3 stages?**
- **Separation of concerns**: Structure, visuals, and copy are different skills
- **Reusability**: Each stage can be improved independently
- **Quality**: Focus on one aspect at a time
- **Testability**: Easier to validate each stage

---

## Key Design Decisions

### 1. Content-First Approach
Start with "what to say" before "how it looks."

**Implementation:**
- PresentationDesigner generates outline WITHOUT knowing layouts
- VisualDesigner maps structure to layouts AFTER structure is solid
- Copywriter writes for specific layouts AFTER visual plan is set

### 2. Framework-Driven Generation
Different presentation types follow proven patterns.

**Frameworks:**
- **Pitch**: Problem → Solution → Market → Traction → Ask
- **Education**: Foundation → Build → Practice → Apply
- **Report**: Summary → Data → Insights → Recommendations
- **Workshop**: Context → Learn → Practice → Next Steps
- **Story**: Setup → Challenge → Journey → Resolution

### 3. Provider-Agnostic Design
Easy to swap LLM providers (Gemini, GPT, Claude).

**Implementation:**
- Abstract `LLMProviderAdapter` base class
- Concrete adapters: `GeminiLLMAdapter`, `GPTAdapter`, `ClaudeAdapter`
- Services depend on adapter interface, not implementation

### 4. Backward Compatibility
Existing API unchanged; new mode is opt-in.

**API Change:**
```javascript
POST /api/presentations/stream
{
  "topic": "AI in Product Discovery",
  "mode": "smart",              // NEW - defaults to "fast"
  "presentationType": "pitch",  // NEW - required for smart mode
  "audience": "investors"       // NEW - optional
  // ... existing params unchanged
}
```

---

## File Structure

```
api/
├── services/
│   ├── LLMContentGenerator.js       # Orchestrator (NEW)
│   ├── llm/
│   │   ├── PresentationDesigner.js  # Stage 1 (NEW)
│   │   ├── VisualDesigner.js        # Stage 2 (NEW)
│   │   ├── Copywriter.js            # Stage 3 (NEW)
│   │   └── PromptLoader.js          # Load prompts (NEW)
│   └── adapters/
│       ├── LLMProviderAdapter.js    # Abstract base (NEW)
│       └── GeminiLLMAdapter.js      # Gemini impl (NEW)
│
├── prompts/                         # Markdown templates (NEW)
│   ├── presentation-designer/
│   │   ├── base.md                  # Core instructions
│   │   ├── frameworks/
│   │   │   ├── pitch.md
│   │   │   ├── education.md
│   │   │   ├── report.md
│   │   │   ├── workshop.md
│   │   │   └── story.md
│   │   └── examples/
│   │       └── *.json               # Few-shot examples
│   │
│   ├── visual-designer/
│   │   ├── base.md
│   │   ├── layouts/
│   │   │   └── layout-catalog.md   # All 6 layouts explained
│   │   └── image-prompts.md
│   │
│   └── copywriter/
│       ├── base.md
│       ├── sections/
│       │   ├── title-generation.md
│       │   ├── body-generation.md
│       │   ├── bullets-generation.md
│       │   └── cta-generation.md
│       └── tone/
│           ├── professional.md
│           ├── casual.md
│           └── technical.md
│
└── routes/
    └── presentations.js             # UPDATED - add mode param
```

---

## Service Interfaces (Quick Reference)

### LLMContentGenerator (Orchestrator)

```javascript
class LLMContentGenerator {
  async generatePresentation({
    topic,
    cardCount = 6,
    presentationType = 'education',
    audience = 'general',
    style = 'professional'
  }) {
    // Stage 1: Structure
    const structure = await presentationDesigner.generateStructure();

    // Stage 2: Layouts
    const layoutPlan = await visualDesigner.assignLayouts(structure);

    // Stage 3: Copy
    const cards = await copywriter.generateCards(layoutPlan, structure);

    return { cards };
  }
}
```

### PresentationDesigner (Stage 1)

```javascript
class PresentationDesigner {
  async generateStructure({ topic, cardCount, presentationType, audience }) {
    // Load prompts
    const basePrompt = await promptLoader.load('presentation-designer/base.md');
    const framework = await promptLoader.load(`frameworks/${presentationType}.md`);

    // Call LLM
    const response = await llm.generate({ prompt: composedPrompt });

    // Parse and validate
    return parseStructure(response);
    // Returns: { sections: [...], flow: 'linear', narrativeArc: '...' }
  }
}
```

### VisualDesigner (Stage 2)

```javascript
class VisualDesigner {
  async assignLayouts({ structure, style, cardCount }) {
    // Load layout catalog
    const layoutCatalog = await promptLoader.load('layouts/layout-catalog.md');

    // Call LLM
    const response = await llm.generate({ prompt: composedPrompt });

    // Parse and validate
    return parseLayoutPlan(response);
    // Returns: { cards: [{ sectionId, layout, imagePrompt, ... }] }
  }
}
```

### Copywriter (Stage 3)

```javascript
class Copywriter {
  async generateCards({ layoutPlan, structure, tone, audience }) {
    const cards = [];

    for (let i = 0; i < layoutPlan.cards.length; i++) {
      const card = await this.generateCard({
        layoutCard: layoutPlan.cards[i],
        section: structure.sections[i],
        tone,
        audience
      });
      cards.push(card);
    }

    return cards;
    // Returns: Array of Card objects ready for streaming
  }
}
```

---

## Data Flow Example

Let's trace a request through the system:

### Input
```json
{
  "topic": "AI-Powered Product Discovery",
  "cardCount": 6,
  "presentationType": "pitch",
  "audience": "investors",
  "style": "professional",
  "mode": "smart"
}
```

### Stage 1: PresentationDesigner Output
```json
{
  "sections": [
    {
      "id": "hook",
      "title": "The $50B Problem in Product Development",
      "purpose": "Hook attention with problem magnitude",
      "keyPoints": [
        "70% of products fail",
        "Average cost: $2.5M per failed product",
        "Problem: Guessing instead of knowing"
      ],
      "suggestedLength": "short",
      "contentDensity": "low",
      "emotionalTone": "urgent"
    },
    {
      "id": "problem",
      "title": "Why Products Fail",
      "purpose": "Establish the pain point",
      "keyPoints": [
        "Manual research takes months",
        "Teams rely on intuition",
        "Customers aren't heard"
      ],
      "suggestedLength": "medium",
      "contentDensity": "medium",
      "emotionalTone": "urgent"
    }
    // ... 4 more sections
  ],
  "flow": "linear",
  "narrativeArc": "problem-solution",
  "totalCards": 6
}
```

### Stage 2: VisualDesigner Output
```json
{
  "cards": [
    {
      "sectionId": "hook",
      "layout": "hero-overlay",
      "imagePrompt": "abstract data visualization showing failure statistics, professional red and dark tones",
      "visualHierarchy": "title-first",
      "informationDensity": "low"
    },
    {
      "sectionId": "problem",
      "layout": "grid",
      "imagePrompt": "frustrated product team in meeting, modern office environment",
      "visualHierarchy": "balanced",
      "informationDensity": "high"
    }
    // ... 4 more cards
  ]
}
```

### Stage 3: Copywriter Output (First Card)
```json
{
  "type": "hook",
  "layout": "hero-overlay",
  "content": {
    "title": "70% of New Products Fail",
    "subtitle": "That's $50 Billion Lost Every Year",
    "kicker": "The Cost of Guessing"
  },
  "imagePrompt": "abstract data visualization showing failure statistics, professional red and dark tones"
}
```

### Final Output
Array of 6 complete Card objects → StreamingService → SSE to client

---

## Prompt Template Structure

Prompts are markdown files loaded dynamically. They guide the LLM to produce structured output.

### Example: Base Prompt Pattern

```markdown
# [Service Name] - Base Instructions

You are an expert [role] specializing in [domain].

## Your Role
[What this service does]

## Core Principles
1. Principle 1
2. Principle 2

## Output Format
You must return valid JSON with this structure:
```json
{
  "field": "value"
}
```

## Guidelines
- Do this
- Don't do that

## Examples
[Few-shot examples]
```

### Why Markdown?
- **Human-readable**: Easy to edit and version control
- **Composable**: Combine base + framework + examples
- **Testable**: Can test prompts independently
- **Maintainable**: Non-technical team members can improve

---

## Environment Variables

Add to `.env`:

```bash
# Phase 4: LLM Content Generation
LLM_PROVIDER=gemini
GEMINI_TEXT_MODEL=gemini-2.0-flash-exp
LLM_TEMPERATURE=0.7
LLM_MAX_TOKENS=2000
LLM_TIMEOUT=30000
LLM_MOCK_MODE=false
PROMPT_CACHE_ENABLED=true
PROMPT_CACHE_TTL=3600000
```

---

## Performance Characteristics

### Latency (per 6-card presentation)
- **Stage 1 (Structure)**: ~2-5s
- **Stage 2 (Layouts)**: ~1-3s
- **Stage 3 (Copywriting)**: ~2-4s per card (parallelizable)
- **Total**: ~20-35s

### Cost (Gemini 2.0 Flash)
- **Input**: ~5K tokens
- **Output**: ~3K tokens
- **Cost per generation**: ~$0.001 (very cheap)
- **Monthly (1000 presentations)**: ~$1

### Optimization Strategies
1. **Prompt caching**: Cache loaded markdown prompts
2. **Parallel generation**: Generate cards in parallel (Stage 3)
3. **Model selection**: Use flash models for speed
4. **Streaming**: Stream LLM responses for faster TTFB (future)

---

## Testing Strategy

### Unit Tests
- Mock LLM adapter
- Test each service independently
- Validate JSON parsing
- Test error handling

### Integration Tests
- End-to-end flow with mock LLM
- Test all presentation types
- Verify backward compatibility

### Manual Testing
- Generate real presentations
- Evaluate quality
- Test edge cases

---

## Migration Path (4 Weeks)

### Week 1: Foundation
- Create directory structure
- Implement adapters (base + Gemini)
- Implement PromptLoader
- Write first prompts (education framework)

### Week 2: Core Services
- Implement PresentationDesigner
- Implement VisualDesigner
- Implement Copywriter
- Write remaining prompts

### Week 3: Integration
- Implement LLMContentGenerator
- Update API routes
- Integration tests

### Week 4: Polish
- All frameworks
- Performance optimization
- Documentation
- E2E testing

---

## Common Questions

### Q: Why not use LLM to generate everything in one call?
**A:** Separation of concerns improves quality. Each stage has a clear job. LLMs work better with focused tasks.

### Q: Can I use a different LLM provider?
**A:** Yes! Implement `LLMProviderAdapter` for your provider (GPT, Claude, etc.). Swap in constructor.

### Q: How do I improve generation quality?
**A:** Edit prompt templates in `api/prompts/`. They're markdown files. Improve instructions, add examples.

### Q: What if LLM returns invalid JSON?
**A:** Each service validates and retries. If validation fails 3x, falls back to fast mode (existing database).

### Q: How much does this cost?
**A:** Very little. Gemini Flash is ~$0.001 per generation. Even at scale, costs are negligible.

### Q: Can I still use the old database mode?
**A:** Yes! Default is `mode: 'fast'` which uses existing ContentGenerator. Smart mode is opt-in.

---

## Next Steps

1. **Read full architecture**: `.docs/PHASE-4-ARCHITECTURE.md`
2. **Follow checklist**: `.docs/PHASE-4-IMPLEMENTATION-CHECKLIST.md`
3. **Start with Week 1**: Foundation (adapters, prompt loader)
4. **Test incrementally**: Don't build everything before testing

---

## Key Files at a Glance

| File | Purpose | LOC |
|------|---------|-----|
| `LLMContentGenerator.js` | Orchestrator | ~150 |
| `PresentationDesigner.js` | Stage 1 | ~200 |
| `VisualDesigner.js` | Stage 2 | ~150 |
| `Copywriter.js` | Stage 3 | ~250 |
| `PromptLoader.js` | Load prompts | ~100 |
| `LLMProviderAdapter.js` | Abstract base | ~50 |
| `GeminiLLMAdapter.js` | Gemini impl | ~150 |
| Prompt templates | Guide LLM | ~2000+ |
| **Total** | | **~3,050** |

---

## Success Criteria

- [ ] Smart mode generates valid presentations 95%+ of time
- [ ] Generation completes in <30s
- [ ] Cost per generation <$0.01
- [ ] All 5 presentation types work
- [ ] Backward compatible (fast mode unchanged)
- [ ] Unit test coverage >80%
- [ ] Documentation complete

---

## Resources

- **Full Architecture**: `.docs/PHASE-4-ARCHITECTURE.md`
- **Checklist**: `.docs/PHASE-4-IMPLEMENTATION-CHECKLIST.md`
- **Gemini API**: https://ai.google.dev/docs
- **Prompt Engineering**: https://www.promptingguide.ai/
- **Existing Streaming**: `docs/SSE-STREAMING.md`

---

**Ready to start?** Begin with Week 1 in the checklist!
