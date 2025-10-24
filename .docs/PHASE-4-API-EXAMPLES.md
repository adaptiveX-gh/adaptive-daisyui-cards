# Phase 4 API Examples

Practical examples for using the LLM-powered smart mode API.

---

## Quick Start: Smart Mode

### Basic Request (Education Presentation)

```bash
curl -X POST http://localhost:3000/api/presentations/stream \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{
    "topic": "Introduction to Machine Learning",
    "cardCount": 6,
    "mode": "smart",
    "presentationType": "education",
    "audience": "general",
    "style": "professional"
  }'
```

### Response (SSE Stream)

```
data: {"stage":"skeleton","cards":[...]}

data: {"stage":"content","cardId":"abc123","section":"title","content":"Introduction to Machine Learning"}

data: {"stage":"content","cardId":"abc123","section":"body","content":"..."}

data: {"stage":"style","cardId":"abc123","theme":"light","layout":"hero"}

data: {"stage":"complete","summary":{"cardCount":6,"stages":3}}
```

---

## All Presentation Types

### 1. Investor Pitch

```javascript
fetch('http://localhost:3000/api/presentations/stream', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'text/event-stream'
  },
  body: JSON.stringify({
    topic: 'AI-Powered Customer Support Platform',
    cardCount: 7,
    mode: 'smart',
    presentationType: 'pitch',
    audience: 'investors',
    style: 'professional',
    includeImages: true
  })
})
```

**Expected Structure:**
1. Hook/Problem statement
2. Problem deep-dive
3. Solution overview
4. Market opportunity
5. Business model
6. Traction metrics
7. The ask

---

### 2. Educational Presentation

```javascript
{
  "topic": "Introduction to Kubernetes",
  "cardCount": 6,
  "mode": "smart",
  "presentationType": "education",
  "audience": "technical",
  "style": "technical"
}
```

**Expected Structure:**
1. What is Kubernetes?
2. Core concepts
3. Architecture overview
4. Hands-on example
5. Best practices
6. Next steps

---

### 3. Business Report

```javascript
{
  "topic": "Q4 2024 Marketing Performance",
  "cardCount": 6,
  "mode": "smart",
  "presentationType": "report",
  "audience": "executive",
  "style": "professional"
}
```

**Expected Structure:**
1. Executive summary
2. Key metrics
3. Performance by channel
4. Insights and trends
5. Recommendations
6. Action items

---

### 4. Workshop/Training

```javascript
{
  "topic": "Effective Remote Communication",
  "cardCount": 8,
  "mode": "smart",
  "presentationType": "workshop",
  "audience": "mixed",
  "style": "casual"
}
```

**Expected Structure:**
1. Workshop objectives
2. Current challenges
3. Communication frameworks
4. Exercise 1
5. Best practices
6. Exercise 2
7. Common mistakes
8. Action plan

---

### 5. Narrative/Story

```javascript
{
  "topic": "The Journey of Building Our Product",
  "cardCount": 6,
  "mode": "smart",
  "presentationType": "story",
  "audience": "general",
  "style": "casual"
}
```

**Expected Structure:**
1. The beginning
2. The challenge
3. The struggle
4. The breakthrough
5. The impact
6. What's next

---

## JavaScript Client Example (Full)

```javascript
// Initialize SSE connection
async function generateSmartPresentation(params) {
  const response = await fetch('http://localhost:3000/api/presentations/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream'
    },
    body: JSON.stringify({
      topic: params.topic,
      cardCount: params.cardCount || 6,
      mode: 'smart',
      presentationType: params.type || 'education',
      audience: params.audience || 'general',
      style: params.style || 'professional',
      includeImages: params.includeImages || false
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  // Read SSE stream
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  const cards = new Map();

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');

    // Process complete lines
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.substring(6));
        handleStageEvent(data, cards);
      }
    }
  }

  return Array.from(cards.values());
}

function handleStageEvent(data, cards) {
  switch (data.stage) {
    case 'skeleton':
      // Initialize cards
      data.cards.forEach(card => {
        cards.set(card.id, {
          id: card.id,
          layout: card.layout,
          content: {},
          theme: null
        });
        renderSkeleton(card);
      });
      break;

    case 'content':
      // Update card content
      const card = cards.get(data.cardId);
      if (card) {
        card.content[data.section] = data.content;
        updateCardContent(data.cardId, data.section, data.content);
      }
      break;

    case 'style':
      // Apply theme and styles
      const styledCard = cards.get(data.cardId);
      if (styledCard) {
        styledCard.theme = data.theme;
        applyStyles(data.cardId, data.theme);
      }
      break;

    case 'placeholder':
      // Show placeholder image
      showPlaceholder(data.cardId, data.placeholder);
      break;

    case 'image':
      // Replace with final image
      swapToFinalImage(data.cardId, data.image);
      break;

    case 'complete':
      console.log('Generation complete!', data.summary);
      break;

    case 'error':
      console.error('Generation error:', data.error);
      break;
  }
}

// Usage
generateSmartPresentation({
  topic: 'Introduction to GraphQL',
  cardCount: 6,
  type: 'education',
  audience: 'technical',
  style: 'professional',
  includeImages: true
}).then(cards => {
  console.log('Presentation complete!', cards);
}).catch(error => {
  console.error('Error:', error);
});
```

---

## Comparing Fast vs Smart Mode

### Fast Mode (Existing)

```javascript
// Fast mode uses predefined content database
{
  "topic": "AI in Product Discovery",  // Must match database
  "cardCount": 6,
  "mode": "fast",  // or omit, defaults to fast
  "style": "professional"
}
```

**Pros:**
- Instant (<1s)
- Consistent quality
- No API costs
- Works offline

**Cons:**
- Limited to 3 topics
- Cannot customize content
- Fixed structure

---

### Smart Mode (Phase 4)

```javascript
// Smart mode generates custom content for any topic
{
  "topic": "Quantum Computing for Beginners",  // Any topic!
  "cardCount": 6,
  "mode": "smart",
  "presentationType": "education",
  "audience": "general",
  "style": "professional"
}
```

**Pros:**
- Any topic
- Framework-driven structure
- Audience-specific content
- Professional quality

**Cons:**
- Slower (~20-30s)
- Requires LLM API
- Small cost (~$0.001)
- Requires internet

---

## Parameter Reference

| Parameter | Type | Required | Default | Smart Only | Description |
|-----------|------|----------|---------|------------|-------------|
| `topic` | string | Yes | - | No | Presentation topic |
| `cardCount` | number | No | 6 | No | Number of cards (1-20) |
| `mode` | string | No | "fast" | - | Generation mode: "fast" or "smart" |
| `presentationType` | string | Yes* | - | Yes | Framework: pitch, education, report, workshop, story |
| `audience` | string | No | "general" | Yes | Target audience: technical, executive, general, mixed |
| `style` | string | No | "professional" | No | Tone: professional, casual, technical |
| `includeImages` | boolean | No | false | No | Generate images |
| `provider` | string | No | "gemini" | No | Image provider (if includeImages=true) |
| `theme` | object | No | null | No | DaisyUI theme override |
| `streamDelay` | number | No | 0 | No | Debug: delay between stages (ms) |

*Required when mode="smart"

---

## Error Handling

### Invalid Topic (Fast Mode)

```javascript
// Request
{
  "topic": "Nonexistent Topic",
  "mode": "fast"
}

// Response
{
  "error": "Bad Request",
  "message": "Unknown topic: Nonexistent Topic. Available topics: AI in Product Discovery, Digital Marketing Trends 2025, Remote Team Management"
}
```

### LLM Error (Smart Mode)

```javascript
// If LLM fails 3 times, automatically falls back to fast mode
data: {"stage":"error","error":"LLM generation failed, falling back to fast mode"}
data: {"stage":"skeleton","cards":[...]}  // Continues with database content
```

### Invalid Presentation Type

```javascript
// Request
{
  "topic": "Any Topic",
  "mode": "smart",
  "presentationType": "invalid"
}

// Response
{
  "error": "Bad Request",
  "message": "Invalid presentationType. Must be one of: pitch, education, report, workshop, story"
}
```

---

## Advanced Usage

### Custom Streaming Delays (for demos)

```javascript
{
  "topic": "Demo Presentation",
  "mode": "smart",
  "presentationType": "education",
  "streamDelay": 1000  // 1 second between stages
}
```

### Specific Theme

```javascript
{
  "topic": "Dark Mode APIs",
  "mode": "smart",
  "presentationType": "technical",
  "theme": {
    "name": "dark",
    "primaryColor": "#3b82f6",
    "accentColor": "#10b981"
  }
}
```

### Images with Smart Mode

```javascript
{
  "topic": "Visual Design Principles",
  "mode": "smart",
  "presentationType": "education",
  "includeImages": true,
  "provider": "gemini"
}
```

**Note**: Images are generated after content is complete. Placeholders appear first, then final images stream in.

---

## Testing Smart Mode

### Test with Mock LLM (No API costs)

```bash
# Set in .env
LLM_MOCK_MODE=true

# Make request
curl -X POST http://localhost:3000/api/presentations/stream \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Test Topic",
    "mode": "smart",
    "presentationType": "education"
  }'

# Returns mock data instantly
```

### Test with Real LLM

```bash
# Set in .env
LLM_MOCK_MODE=false
GEMINI_API_KEY=your_actual_api_key

# Make request (will take 20-30s)
```

---

## Performance Monitoring

### Check Generation Stats

```javascript
// After generation completes, check server logs

// Example output:
[LLMContentGenerator] Stage 1 (Structure): 2.3s
[LLMContentGenerator] Stage 2 (Layouts): 1.8s
[LLMContentGenerator] Stage 3 (Copywriting): 12.4s (6 cards)
[LLMContentGenerator] Total: 16.5s
[LLMContentGenerator] Tokens used: 4,823 input, 2,156 output
[LLMContentGenerator] Estimated cost: $0.0008
```

---

## Migration Guide: Fast to Smart

### Before (Fast Mode Only)

```javascript
const response = await fetch('/api/presentations/stream', {
  method: 'POST',
  body: JSON.stringify({
    topic: 'AI in Product Discovery',  // Limited to 3 topics
    cardCount: 6
  })
});
```

### After (Choose Mode)

```javascript
// Option 1: Keep using fast mode (backward compatible)
const response = await fetch('/api/presentations/stream', {
  method: 'POST',
  body: JSON.stringify({
    topic: 'AI in Product Discovery',
    cardCount: 6,
    mode: 'fast'  // Or omit, defaults to fast
  })
});

// Option 2: Use smart mode for any topic
const response = await fetch('/api/presentations/stream', {
  method: 'POST',
  body: JSON.stringify({
    topic: 'Any Topic You Want!',
    cardCount: 6,
    mode: 'smart',
    presentationType: 'education',
    audience: 'general'
  })
});
```

---

## Common Use Cases

### 1. Sales Pitch for Investor Meeting

```javascript
{
  "topic": "SaaS Platform for Healthcare",
  "cardCount": 8,
  "mode": "smart",
  "presentationType": "pitch",
  "audience": "investors",
  "style": "professional",
  "includeImages": true
}
```

### 2. Technical Training Workshop

```javascript
{
  "topic": "Microservices Architecture Patterns",
  "cardCount": 10,
  "mode": "smart",
  "presentationType": "workshop",
  "audience": "technical",
  "style": "technical",
  "includeImages": false  // Code-heavy, fewer images
}
```

### 3. Quarterly Business Review

```javascript
{
  "topic": "Q1 2025 Product Performance",
  "cardCount": 6,
  "mode": "smart",
  "presentationType": "report",
  "audience": "executive",
  "style": "professional",
  "includeImages": true  // Charts and graphs
}
```

### 4. Customer Success Story

```javascript
{
  "topic": "How Acme Corp Increased Conversion by 300%",
  "cardCount": 6,
  "mode": "smart",
  "presentationType": "story",
  "audience": "mixed",
  "style": "casual",
  "includeImages": true
}
```

### 5. Internal Training for New Hires

```javascript
{
  "topic": "Company Culture and Values",
  "cardCount": 8,
  "mode": "smart",
  "presentationType": "education",
  "audience": "general",
  "style": "casual",
  "includeImages": true
}
```

---

## Best Practices

### Topic Naming
- **Good**: "Introduction to Docker Containers"
- **Good**: "2024 Marketing Strategy Review"
- **Bad**: "docker" (too vague)
- **Bad**: "we need to talk about stuff" (unclear)

### Card Count Selection
- **Pitch**: 6-8 cards (concise, impactful)
- **Education**: 6-10 cards (thorough coverage)
- **Report**: 5-7 cards (data-focused)
- **Workshop**: 8-12 cards (interactive, detailed)
- **Story**: 5-7 cards (narrative flow)

### Audience Matching
- **technical**: Engineers, developers, architects
- **executive**: C-level, decision makers, investors
- **general**: Mixed audience, broad appeal
- **mixed**: Technical + non-technical

### Style Selection
- **professional**: Corporate, formal, data-driven
- **casual**: Friendly, approachable, conversational
- **technical**: Code examples, architecture, deep dives

---

## Troubleshooting

### Generation Takes Too Long
- Reduce cardCount
- Use faster model (set `GEMINI_TEXT_MODEL=gemini-2.0-flash-exp`)
- Check network connectivity
- Enable mock mode for testing

### Content Quality Issues
- Be more specific in topic
- Choose appropriate presentationType
- Match audience to content complexity
- Refine prompt templates in `api/prompts/`

### API Errors
- Check `GEMINI_API_KEY` is set
- Verify API quota not exceeded
- Check server logs for details
- Try mock mode to isolate issue

---

## Next Steps

1. **Try examples above** in your environment
2. **Experiment with parameters** to understand impact
3. **Read prompt templates** in `api/prompts/` to understand how LLM is guided
4. **Monitor performance** and adjust settings
5. **Customize prompts** for your specific needs

---

For more details, see:
- **Full Architecture**: `.docs/PHASE-4-ARCHITECTURE.md`
- **Implementation Guide**: `.docs/PHASE-4-IMPLEMENTATION-CHECKLIST.md`
- **Visual Diagrams**: `.docs/PHASE-4-DIAGRAMS.md`
