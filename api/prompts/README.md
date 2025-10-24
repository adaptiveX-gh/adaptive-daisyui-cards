# Slideo Prompt Engineering System

Content-first presentation generation powered by specialized LLM prompts. Inspired by gamma-presentation-generator philosophy: intelligent content organization, adaptive structuring, multi-format output.

## Philosophy

**Content Quality > Visual Design**

Great presentations start with clear thinking and strong narrative structure. Visual design supports the message—it doesn't create it.

This prompt system separates concerns:
1. **PresentationDesigner**: Architects narrative and content strategy
2. **VisualDesigner**: Matches layouts to content needs
3. **Copywriter**: Crafts compelling, concise copy

## Directory Structure

```
api/prompts/
├── README.md                          # This file
├── presentation-designer/
│   ├── system-prompt.md              # Core presentation architecture prompt
│   ├── frameworks/
│   │   ├── pitch.md                  # Problem→Solution→Proof structure
│   │   ├── education.md              # Teach→Apply→Reinforce structure
│   │   ├── report.md                 # Overview→Details→Insights structure
│   │   ├── workshop.md               # Learn→Do→Reflect structure
│   │   └── story.md                  # Hero's Journey adaptation
│   └── examples/
│       └── good-outlines.md          # Reference implementations
├── visual-designer/
│   ├── system-prompt.md              # Layout selection and visual strategy
│   ├── layout-selection.md           # Decision trees for choosing layouts
│   └── visual-suggestions.md         # Icon, image, chart guidance
└── copywriter/
    ├── system-prompt.md              # Copy crafting principles
    ├── title-generation.md           # Title formulas and techniques
    ├── body-generation.md            # Body copy best practices
    └── tone-guides/
        ├── professional.md           # Corporate, B2B, formal
        ├── creative.md               # Agency, design, innovation
        └── minimal.md                # Startup, tech, modern
```

## How to Use This System

### 1. Generate Presentation Outline

**Input**: Topic, type, audience, card count

**Prompt**: Use `presentation-designer/system-prompt.md` + appropriate framework

**Output**: Structured JSON outline with:
- Narrative arc
- Card-by-card content strategy
- Key messages and supporting points
- Visual needs
- Speaker notes

**Example**:
```json
{
  "meta": {
    "title": "Container Queries Explained",
    "type": "education",
    "audience": "Frontend developers",
    "card_count": 10
  },
  "cards": [...]
}
```

### 2. Design Visual Layout (Per Card)

**Input**: Card object from outline

**Prompt**: Use `visual-designer/system-prompt.md`

**Output**: Layout recommendation with:
- Primary layout choice (hero, split, sidebar, etc.)
- Visual structure and hierarchy
- Typography treatment
- Specific visual suggestions (icons, images, charts)
- Responsive behavior notes

**Example**:
```json
{
  "layout": "sidebar-layout",
  "layout_rationale": "Content needs visual support...",
  "visual_elements": {
    "recommended_visuals": ["Screenshot of..."],
    "icon_suggestions": "Shield for security, zap for speed"
  }
}
```

### 3. Write Copy (Per Card)

**Input**: Card object + layout + tone

**Prompt**: Use `copywriter/system-prompt.md` + appropriate tone guide

**Output**: Polished copy with:
- Title (optimized for impact)
- Subtitle (if needed)
- Body (bullets or paragraphs)
- Speaker notes
- Alternatives

**Example**:
```json
{
  "title": "Components That Know Their Context",
  "subtitle": null,
  "body": [
    "Container queries let components respond to container size",
    "Write once, adapts everywhere",
    "No more broken layouts in sidebars"
  ],
  "word_count": { "total": 24 }
}
```

## Available Layouts

| Layout | Best For | Complexity | Typical Use |
|--------|----------|------------|-------------|
| **hero-layout** | Title slides, bold statements | Low | 15-25% of cards |
| **hero-layout.overlay** | Inspirational moments | Low | 5-15% of cards |
| **split-layout** | Comparisons, before/after | Medium | 10-20% of cards |
| **sidebar-layout** | Concept + visual, profiles | Medium | 25-40% of cards |
| **feature-layout** | Multiple equal items | Medium-High | 15-25% of cards |
| **dashboard-layout** | Data/metrics | High | 5-15% of cards |
| **masonry-layout** | Image galleries | High | 5-10% of cards |

## Presentation Types

### Pitch
**Framework**: `frameworks/pitch.md`
**Structure**: Problem → Solution → Validation → Ask
**Best for**: Fundraising, sales, product launches
**Typical length**: 8-15 cards

### Education
**Framework**: `frameworks/education.md`
**Structure**: Foundation → Teach → Apply → Reinforce
**Best for**: Training, tutorials, explainers
**Typical length**: 10-20 cards

### Report
**Framework**: `frameworks/report.md`
**Structure**: Executive Summary → Analysis → Recommendations
**Best for**: Business reviews, research findings
**Typical length**: 12-25 cards

### Workshop
**Framework**: `frameworks/workshop.md`
**Structure**: Setup → Theory → Practice → Integration
**Best for**: Hands-on training, interactive sessions
**Typical length**: 15-30 cards

### Story
**Framework**: `frameworks/story.md`
**Structure**: Setup → Conflict → Resolution → Transformation
**Best for**: Case studies, brand stories, inspiration
**Typical length**: 12-20 cards

## Tone Variations

### Professional
**Guide**: `tone-guides/professional.md`
**Characteristics**: Formal, data-driven, credible
**Use for**: Corporate, B2B, executives, board presentations
**Language**: "We implemented a comprehensive approach resulting in 45% improvement"

### Creative
**Guide**: `tone-guides/creative.md`
**Characteristics**: Bold, story-driven, emotional
**Use for**: Agencies, design, innovation, inspiration
**Language**: "We killed 80% of our features. Best decision ever."

### Minimal
**Guide**: `tone-guides/minimal.md`
**Characteristics**: Concise, direct, modern
**Use for**: Startups, tech, developer tools, portfolios
**Language**: "3x faster. $0 config."

## Implementation Workflow

```
┌─────────────────────────────────────────────────────┐
│ 1. PRESENTATION DESIGNER                            │
│    Input: topic, type, audience, count              │
│    Output: Structured outline (all cards)           │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ 2. VISUAL DESIGNER (per card)                       │
│    Input: Card content + context                    │
│    Output: Layout + visual strategy                 │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ 3. COPYWRITER (per card)                            │
│    Input: Card + layout + tone                      │
│    Output: Polished copy ready for display          │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ 4. RENDER                                           │
│    Apply layout, visuals, and copy to template      │
│    Generate presentation cards                      │
└─────────────────────────────────────────────────────┘
```

## API Integration Pattern

### Step 1: Generate Outline
```javascript
const outline = await llm.generate({
  systemPrompt: readFile('presentation-designer/system-prompt.md'),
  userPrompt: {
    topic: "Container Queries in CSS",
    presentation_type: "education",
    audience: "Frontend developers",
    card_count: 10
  }
});
```

### Step 2: Design Each Card
```javascript
for (const card of outline.cards) {
  const visualDesign = await llm.generate({
    systemPrompt: readFile('visual-designer/system-prompt.md'),
    userPrompt: card
  });

  card.layout = visualDesign.layout;
  card.visuals = visualDesign.visual_elements;
}
```

### Step 3: Write Copy for Each Card
```javascript
for (const card of outline.cards) {
  const copy = await llm.generate({
    systemPrompt: readFile('copywriter/system-prompt.md') +
                  readFile(`copywriter/tone-guides/${tone}.md`),
    userPrompt: {
      key_message: card.key_message,
      supporting_points: card.supporting_points,
      layout: card.layout,
      tone: "minimal"
    }
  });

  card.title = copy.title;
  card.body = copy.body;
}
```

### Step 4: Render Cards
```javascript
const html = outline.cards.map(card =>
  renderCard(card.layout, card.title, card.body, card.visuals)
).join('\n');
```

## Prompt Engineering Best Practices

### What Makes These Prompts Effective

1. **Clear Role Definition**: Each prompt establishes expert persona
2. **Explicit Constraints**: Word counts, layout limits, tone boundaries
3. **Structured Output**: JSON schemas ensure consistency
4. **Examples Included**: Reference implementations show success patterns
5. **Error Prevention**: Common mistakes documented with fixes
6. **Decision Trees**: Clear logic for choices (layout selection, tone)
7. **Quality Criteria**: Checklists for self-evaluation
8. **Provider-Agnostic**: Works with Claude, GPT, Gemini, etc.

### Prompt Maintenance

When updating prompts:
- [ ] Test with multiple LLM providers (Claude, GPT-4, Gemini)
- [ ] Validate JSON output schemas
- [ ] Update examples to match current patterns
- [ ] Document any breaking changes
- [ ] Version control all changes

## Output Formats

### Presentation Outline JSON
```json
{
  "meta": { "title": "...", "type": "...", "audience": "...", "goal": "..." },
  "narrative_arc": { "opening": "...", "development": "...", "climax": "...", "closing": "..." },
  "cards": [
    {
      "card_number": 1,
      "role": "opening",
      "content_type": "title",
      "key_message": "...",
      "supporting_points": ["..."],
      "visual_needs": "...",
      "speaker_notes": "..."
    }
  ],
  "coherence": { "transitions": ["..."], "recurring_themes": ["..."] }
}
```

### Visual Design JSON
```json
{
  "layout": "sidebar-layout",
  "layout_rationale": "...",
  "visual_structure": { "primary_element": "...", "hierarchy": ["..."] },
  "typography": { "title_treatment": "...", "body_treatment": "..." },
  "visual_elements": {
    "recommended_visuals": ["..."],
    "icon_suggestions": "...",
    "chart_type": "..."
  },
  "accessibility_considerations": ["..."]
}
```

### Copy JSON
```json
{
  "title": "...",
  "subtitle": "...",
  "body": "..." or ["bullet 1", "bullet 2"],
  "kicker": "...",
  "speaker_notes": "...",
  "word_count": { "total": 45, "breakdown": "..." }
}
```

## Extending the System

### Adding a New Presentation Type
1. Create framework file: `frameworks/your-type.md`
2. Define structure pattern and phases
3. Provide card count guidelines
4. Include example card sequence
5. Document common mistakes
6. Update `system-prompt.md` to reference new framework

### Adding a New Tone
1. Create tone guide: `tone-guides/your-tone.md`
2. Define characteristics and language patterns
3. Provide title and body examples
4. Show tone variations by context
5. Include complete card examples
6. Document tone mistakes to avoid

### Adding a New Layout
1. Document in `visual-designer/layout-selection.md`
2. Define structure and characteristics
3. Specify content complexity fit
4. Provide responsive behavior notes
5. Update decision matrix
6. Add to `copywriter/system-prompt.md` constraints

## Testing Prompts

### Quality Checks
- **Clarity**: Can LLM understand instructions without ambiguity?
- **Consistency**: Same input → similar output across runs?
- **Completeness**: All required fields present in output?
- **Correctness**: Output follows specified format and constraints?
- **Creativity**: Variety in outputs (not templated/repetitive)?

### Test Cases
```javascript
// Test pitch generation
testPrompt('pitch', {
  topic: "AI code review tool",
  audience: "technical VCs",
  card_count: 8
});

// Test minimal tone
testPrompt('copywriter', {
  key_message: "Container queries enable responsive components",
  tone: "minimal",
  layout: "hero-layout"
});

// Test layout selection
testPrompt('visual-designer', {
  content_type: "comparison",
  key_message: "Before vs after",
  supporting_points: ["..."]
});
```

## Token Budget Considerations

### Prompt Sizes (Approximate)
- **PresentationDesigner system prompt**: ~3,500 tokens
- **Framework (pitch, education, etc.)**: ~1,500 tokens each
- **VisualDesigner system prompt**: ~3,000 tokens
- **Copywriter system prompt**: ~2,500 tokens
- **Tone guide**: ~2,000 tokens each

### Optimization Strategies
1. **Cache system prompts** (most providers support this)
2. **Load frameworks on-demand** (only the one needed)
3. **Batch card processing** (multiple cards per API call if possible)
4. **Progressive generation** (outline → design → copy in stages)

## Version History

- **v1.0** (2024): Initial prompt system
  - 5 presentation frameworks
  - 7 layout types
  - 3 tone guides
  - Full documentation

## Contributing

When contributing new prompts or improvements:
1. Follow existing structure and formatting
2. Include examples for all patterns
3. Document common mistakes and fixes
4. Test with multiple LLM providers
5. Update this README with changes

## License

These prompts are part of the Slideo project. See main project LICENSE.

## Credits

Prompt engineering inspired by:
- Anthropic's Constitutional AI principles
- OpenAI's prompt engineering guide
- Gamma presentation generator philosophy
- DaisyUI adaptive layout patterns

---

**Remember**: Great presentations start with great content structure. These prompts help LLMs architect compelling narratives, not just generate text.
