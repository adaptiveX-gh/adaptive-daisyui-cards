# Phase 4 Implementation Checklist

Track your progress implementing the LLM-powered content generation architecture.

## Quick Reference

**Architecture Doc:** `.docs/PHASE-4-ARCHITECTURE.md`
**Estimated Time:** 4 weeks
**Estimated LOC:** ~2,500 lines + prompts

---

## Week 1: Foundation

### Directory Structure
- [ ] Create `api/services/llm/` directory
- [ ] Create `api/services/adapters/` directory (if not exists)
- [ ] Create prompt subdirectories:
  - [ ] `api/prompts/presentation-designer/frameworks/`
  - [ ] `api/prompts/presentation-designer/examples/`
  - [ ] `api/prompts/visual-designer/layouts/`
  - [ ] `api/prompts/copywriter/sections/`
  - [ ] `api/prompts/copywriter/tone/`

### LLM Adapters (Base Infrastructure)
- [ ] `api/services/adapters/LLMProviderAdapter.js` (abstract base)
  - [ ] `generate(params)` method
  - [ ] `generateStream(params)` method (stub)
  - [ ] `getName()` method
  - [ ] `isAvailable()` method
  - [ ] JSDoc comments
  - [ ] Unit tests

- [ ] `api/services/adapters/GeminiLLMAdapter.js` (Gemini implementation)
  - [ ] Constructor with config/env vars
  - [ ] `generate()` implementation
  - [ ] Mock mode support
  - [ ] Error handling
  - [ ] Unit tests with mock API

### Prompt Loader
- [ ] `api/services/llm/PromptLoader.js`
  - [ ] `load(promptPath)` - load markdown prompts
  - [ ] `loadExamples(path)` - load JSON examples
  - [ ] `clearCache()` - cache management
  - [ ] `reload(path)` - bypass cache
  - [ ] Error handling for missing files
  - [ ] Unit tests

### First Prompt Template
- [ ] `api/prompts/presentation-designer/base.md`
  - [ ] Core instructions
  - [ ] Output format specification
  - [ ] General guidelines

- [ ] `api/prompts/presentation-designer/frameworks/education.md`
  - [ ] Educational presentation structure
  - [ ] Section guidelines
  - [ ] Example structure

- [ ] `api/prompts/presentation-designer/examples/education-example.json`
  - [ ] Complete example structure
  - [ ] All required fields

### Environment Variables
- [ ] Update `.env.example` with Phase 4 vars
- [ ] Update local `.env` with test values
- [ ] Document in README

---

## Week 2: Core Services

### PresentationDesigner Service
- [ ] `api/services/llm/PresentationDesigner.js`
  - [ ] Constructor (llmAdapter, promptLoader)
  - [ ] `generateStructure(params)` method
  - [ ] `composePrompt()` helper
  - [ ] `parseStructure()` - parse LLM JSON response
  - [ ] `validateStructure()` - schema validation
  - [ ] Error handling
  - [ ] JSDoc comments
  - [ ] Unit tests (use mock LLM)

### VisualDesigner Service
- [ ] `api/services/llm/VisualDesigner.js`
  - [ ] Constructor (llmAdapter, promptLoader)
  - [ ] `assignLayouts(params)` method
  - [ ] `composePrompt()` helper
  - [ ] `parseLayoutPlan()` - parse LLM response
  - [ ] `validateLayoutPlan()` - validate layouts
  - [ ] Error handling
  - [ ] Unit tests

### Copywriter Service
- [ ] `api/services/llm/Copywriter.js`
  - [ ] Constructor (llmAdapter, promptLoader)
  - [ ] `generateCards(params)` method
  - [ ] `generateCard(params)` - single card
  - [ ] `loadLayoutGuides(layoutType)` helper
  - [ ] `composePrompt()` helper
  - [ ] `parseContent()` - parse LLM response
  - [ ] `validateContent()` - validate against schemas
  - [ ] Error handling
  - [ ] Unit tests

### Prompt Templates (Visual Designer)
- [ ] `api/prompts/visual-designer/base.md`
  - [ ] Core visual design principles
  - [ ] Layout selection strategy

- [ ] `api/prompts/visual-designer/layouts/layout-catalog.md`
  - [ ] All 6 layouts described
  - [ ] When to use each
  - [ ] Information density guidelines

- [ ] `api/prompts/visual-designer/image-prompts.md`
  - [ ] Image prompt best practices
  - [ ] Style guidelines
  - [ ] Examples

### Prompt Templates (Copywriter - Base)
- [ ] `api/prompts/copywriter/base.md`
  - [ ] Core copywriting principles
  - [ ] General guidelines

- [ ] `api/prompts/copywriter/sections/title-generation.md`
  - [ ] Title writing guidelines
  - [ ] Power words
  - [ ] Examples

- [ ] `api/prompts/copywriter/sections/body-generation.md`
  - [ ] Body text guidelines
  - [ ] Length recommendations

- [ ] `api/prompts/copywriter/sections/bullets-generation.md`
  - [ ] Bullet point guidelines
  - [ ] Formatting

- [ ] `api/prompts/copywriter/sections/cta-generation.md`
  - [ ] CTA best practices
  - [ ] Action verbs

### Prompt Templates (Copywriter - Tone)
- [ ] `api/prompts/copywriter/tone/professional.md`
- [ ] `api/prompts/copywriter/tone/casual.md`
- [ ] `api/prompts/copywriter/tone/technical.md`

---

## Week 3: Integration & API

### LLMContentGenerator (Orchestrator)
- [ ] `api/services/LLMContentGenerator.js`
  - [ ] Constructor (config, adapter)
  - [ ] Initialize all 3 services (Designer, Visual, Copywriter)
  - [ ] `generatePresentation(params)` - main method
  - [ ] `generateCard(params)` - single card
  - [ ] Error handling and retries
  - [ ] Logging
  - [ ] JSDoc comments
  - [ ] Unit tests

### API Route Updates
- [ ] Update `api/routes/presentations.js`
  - [ ] Add `mode` parameter ('fast' | 'smart')
  - [ ] Add `presentationType` parameter
  - [ ] Add `audience` parameter
  - [ ] Branch logic for fast vs smart mode
  - [ ] Keep existing streaming logic
  - [ ] Error handling

- [ ] Update `api/routes/cards.js` (optional)
  - [ ] Add smart mode to single card generation

### API Documentation
- [ ] Update `API-README.md`
  - [ ] Document new parameters
  - [ ] Add examples for smart mode
  - [ ] Explain presentation types

- [ ] Update `QUICKSTART-API.md`
  - [ ] Add smart mode examples
  - [ ] Show both modes side-by-side

### Integration Tests
- [ ] Test end-to-end flow with mock LLM
- [ ] Test error handling (invalid LLM response)
- [ ] Test fallback to fast mode on error
- [ ] Test all presentation types

---

## Week 4: Complete & Polish

### Remaining Prompt Templates (Frameworks)
- [ ] `api/prompts/presentation-designer/frameworks/pitch.md`
  - [ ] Investor pitch structure
  - [ ] Section guidelines
  - [ ] Example in JSON

- [ ] `api/prompts/presentation-designer/frameworks/report.md`
  - [ ] Business report structure
  - [ ] Executive summary pattern

- [ ] `api/prompts/presentation-designer/frameworks/workshop.md`
  - [ ] Training/workshop structure
  - [ ] Interactive elements

- [ ] `api/prompts/presentation-designer/frameworks/story.md`
  - [ ] Narrative storytelling structure
  - [ ] Story arc

- [ ] `api/prompts/presentation-designer/examples/` (all frameworks)
  - [ ] `pitch-example.json`
  - [ ] `report-example.json`
  - [ ] `workshop-example.json`
  - [ ] `story-example.json`

### Performance Optimization
- [ ] Implement prompt caching
  - [ ] LRU cache in PromptLoader
  - [ ] Cache invalidation strategy
  - [ ] Environment variable for cache TTL

- [ ] Parallel card generation
  - [ ] Generate cards in parallel in Copywriter
  - [ ] Limit concurrency (e.g., 3 at a time)

- [ ] LLM response streaming (future)
  - [ ] Stub implementation in adapters
  - [ ] Plan for incremental card streaming

### Error Handling & Resilience
- [ ] Graceful degradation
  - [ ] Fall back to fast mode on LLM error
  - [ ] Retry logic with exponential backoff
  - [ ] Timeout handling

- [ ] Input validation
  - [ ] Validate topic length
  - [ ] Sanitize user input
  - [ ] Whitelist presentationType values

- [ ] Output validation
  - [ ] Validate LLM JSON structure
  - [ ] Handle malformed responses
  - [ ] Log validation failures

### Monitoring & Logging
- [ ] Add structured logging
  - [ ] Log LLM request/response times
  - [ ] Log token usage
  - [ ] Log errors with context

- [ ] Add metrics
  - [ ] Track generation success rate
  - [ ] Track average latency per stage
  - [ ] Track token costs

### Documentation
- [ ] Create `SMART-MODE-GUIDE.md`
  - [ ] Explain how smart mode works
  - [ ] When to use fast vs smart
  - [ ] Customization options

- [ ] Create prompt writing guide
  - [ ] How to add new frameworks
  - [ ] Prompt engineering tips
  - [ ] Testing prompts

- [ ] Update main README
  - [ ] Add Phase 4 section
  - [ ] Update feature list
  - [ ] Add examples

### End-to-End Testing
- [ ] Test all presentation types
  - [ ] Pitch (investor deck)
  - [ ] Education (training)
  - [ ] Report (business)
  - [ ] Workshop (interactive)
  - [ ] Story (narrative)

- [ ] Test all layouts generated
  - [ ] Verify appropriate layouts chosen
  - [ ] Check visual variety
  - [ ] Validate content quality

- [ ] Test error scenarios
  - [ ] Invalid topic
  - [ ] LLM timeout
  - [ ] Malformed LLM response
  - [ ] API key missing

- [ ] Performance testing
  - [ ] Measure end-to-end latency
  - [ ] Test concurrent requests
  - [ ] Monitor token usage

### Optional Enhancements
- [ ] Add GPT adapter
  - [ ] `GPTAdapter.js` implementing LLMProviderAdapter
  - [ ] Environment variable configuration

- [ ] Add Claude adapter
  - [ ] `ClaudeAdapter.js` implementing LLMProviderAdapter

- [ ] Add prompt versioning
  - [ ] Version prompts (v1, v2, etc.)
  - [ ] A/B test different prompt versions

- [ ] Add user feedback loop
  - [ ] Endpoint to rate generated content
  - [ ] Store ratings for analysis

---

## Testing Checklist

### Unit Tests (Target: >80% coverage)
- [ ] LLMProviderAdapter interface tests
- [ ] GeminiLLMAdapter tests
- [ ] PromptLoader tests
- [ ] PresentationDesigner tests
- [ ] VisualDesigner tests
- [ ] Copywriter tests
- [ ] LLMContentGenerator tests

### Integration Tests
- [ ] Fast mode still works (backward compatibility)
- [ ] Smart mode generates valid presentations
- [ ] All frameworks produce valid structures
- [ ] Error handling works end-to-end

### Manual Testing
- [ ] Generate pitch presentation
- [ ] Generate education presentation
- [ ] Generate report presentation
- [ ] Verify layouts make sense
- [ ] Verify copy quality
- [ ] Test with real Gemini API
- [ ] Test in mock mode

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Environment variables configured
- [ ] API keys secured
- [ ] Rate limits configured

### Deployment
- [ ] Deploy to staging
- [ ] Test in staging environment
- [ ] Monitor logs for errors
- [ ] Check latency metrics
- [ ] Deploy to production
- [ ] Monitor production metrics

### Post-Deployment
- [ ] Verify smart mode working
- [ ] Check error rates
- [ ] Monitor token usage
- [ ] Gather user feedback

---

## Success Criteria

- [ ] Smart mode generates 6-card presentation in <30s
- [ ] Generated content passes validation 95%+ of time
- [ ] All 5 presentation types work correctly
- [ ] Backward compatibility maintained (fast mode unchanged)
- [ ] Unit test coverage >80%
- [ ] Documentation complete and accurate
- [ ] Cost per generation <$0.01
- [ ] User satisfaction >4/5 (if collecting feedback)

---

## Troubleshooting

### Common Issues

**LLM returns invalid JSON**
- Check prompt clarity
- Add more examples to prompts
- Validate with schema before parsing
- Log raw response for debugging

**Generation too slow**
- Use faster model (flash vs pro)
- Implement parallel generation
- Add prompt caching
- Reduce max_tokens

**High costs**
- Use cheaper model
- Implement request caching
- Add rate limiting per user
- Monitor token usage

**Layouts don't make sense**
- Improve visual-designer prompts
- Add more examples
- Validate layout choices
- Adjust temperature (lower = more consistent)

---

## Resources

- [Gemini API Docs](https://ai.google.dev/docs)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)
- [Architecture Doc](.docs/PHASE-4-ARCHITECTURE.md)
- [Existing API Docs](API-README.md)

---

## Notes

Add implementation notes, decisions, and lessons learned here as you build.

**Example:**
```
2025-10-24: Started implementation. Decided to use Gemini 2.0 Flash
for speed/cost balance. Mock mode working well for tests.
```
