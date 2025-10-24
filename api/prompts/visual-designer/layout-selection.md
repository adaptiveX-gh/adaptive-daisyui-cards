# Layout Selection Guide

Quick reference for choosing the right layout based on content characteristics.

## Decision Matrix

| Content Type | Primary Use Case | Best Layout | Alternative |
|-------------|------------------|-------------|-------------|
| **Title card** | Opening, section break | hero-layout | hero-layout.overlay |
| **Key takeaway** | Main insight, conclusion | hero-layout | feature-layout (if multiple) |
| **Bold statement** | Provocative claim, hook | hero-layout.overlay | hero-layout |
| **Single statistic** | One big number | hero-layout | dashboard-layout |
| **Multiple metrics** | Dashboard, KPI summary | dashboard-layout | feature-layout |
| **Comparison (2 items)** | Before/after, A vs B | split-layout | sidebar-layout |
| **Comparison (3+ items)** | Feature matrix, options | feature-layout | dashboard-layout |
| **Concept + image** | Explanation with visual | sidebar-layout | split-layout |
| **Process/steps** | How-to, workflow | sidebar-layout | feature-layout |
| **Quote** | Testimonial, insight | hero-layout | sidebar-layout (with photo) |
| **Image gallery** | Portfolio, screenshots | masonry-layout | feature-layout |
| **Team/people** | Bios, introductions | feature-layout | sidebar-layout |
| **Case study** | Story with visuals | sidebar-layout | split-layout |

## Layout Characteristics

### Hero Layout
```
┌─────────────────────────┐
│                         │
│    LARGE TITLE TEXT     │
│                         │
│   Optional subtitle     │
│                         │
└─────────────────────────┘
```
- **Complexity**: Low (1-2 text elements)
- **Best message type**: Simple, bold, memorable
- **Responsive behavior**: Text scales, stays centered
- **Typical use**: 15-25% of cards in a presentation

### Hero Layout (Overlay)
```
┌─────────────────────────┐
│ ╔═══════════════════╗   │
│ ║ BACKGROUND IMAGE  ║   │
│ ║   with gradient   ║   │
│ ║                   ║   │
│ ║  Text overlaid    ║   │
│ ╚═══════════════════╝   │
└─────────────────────────┘
```
- **Complexity**: Low text, high visual impact
- **Best message type**: Emotional, inspirational, brand
- **Responsive behavior**: Image fills, text adjusts
- **Typical use**: 5-15% of cards (opening, climax, closing)

### Split Layout
```
┌─────────────────────────┐
│          │              │
│  Left    │   Right      │
│ Content  │  Content     │
│          │              │
└─────────────────────────┘
```
- **Complexity**: Medium (2 distinct elements)
- **Best message type**: Comparisons, dual concepts
- **Responsive behavior**: 50/50 → 60/40 → stacks
- **Typical use**: 10-20% of cards

### Sidebar Layout
```
┌─────────────────────────┐
│ ┌────┐                  │
│ │Img │  Content with    │
│ │    │  multiple points │
│ └────┘                  │
└─────────────────────────┘
```
- **Complexity**: Medium (image + structured text)
- **Best message type**: Concept explanation, profiles
- **Responsive behavior**: Horizontal → stacks at 600px
- **Typical use**: 25-40% of cards (workhorse layout)

### Feature Layout
```
┌─────────────────────────┐
│ ┌─────┐ ┌─────┐ ┌─────┐ │
│ │  1  │ │  2  │ │  3  │ │
│ └─────┘ └─────┘ └─────┘ │
└─────────────────────────┘
```
- **Complexity**: Medium-high (3-6 items)
- **Best message type**: Lists, features, team
- **Responsive behavior**: 3-col → 2-col → 1-col
- **Typical use**: 15-25% of cards

### Dashboard Layout
```
┌─────────────────────────┐
│ ┌───────┐ ┌─────┐       │
│ │ Metric│ │Chart│       │
│ └───────┘ └─────┘       │
│ ┌─────┐ ┌───────┐       │
│ │Chart│ │ Metric│       │
│ └─────┘ └───────┘       │
└─────────────────────────┘
```
- **Complexity**: High (multiple data elements)
- **Best message type**: Analytics, reports, KPIs
- **Responsive behavior**: Grid → 2-col → stack
- **Typical use**: 5-15% of cards (data-heavy presentations)

### Masonry Layout
```
┌─────────────────────────┐
│ ┌───┐ ┌─────┐ ┌───┐     │
│ │Img│ │Image│ │Img│     │
│ └───┘ │     │ └───┘     │
│ ┌─────┐ └─────┘ ┌─────┐ │
│ │Image│         │Image│ │
│ └─────┘         └─────┘ │
└─────────────────────────┘
```
- **Complexity**: High (multiple visuals)
- **Best message type**: Visual portfolios, galleries
- **Responsive behavior**: 3-col → 2-col → 1-col
- **Typical use**: 5-10% of cards (visual-focused presentations)

## Selection Workflow

### Step 1: Assess Content Density
- **Low**: 1-2 main elements → hero or hero.overlay
- **Medium**: 2-4 elements → split, sidebar, or feature
- **High**: 5+ elements → dashboard or masonry

### Step 2: Identify Relationship
- **Equal weight**: feature or split (if 2 items)
- **Primary + support**: sidebar or hero
- **Comparison**: split or feature
- **Hierarchy**: hero or sidebar

### Step 3: Consider Message Complexity
- **Simple statement**: hero
- **Concept requiring explanation**: sidebar
- **Multiple related points**: feature
- **Data analysis**: dashboard

### Step 4: Evaluate Visual Needs
- **No visual**: hero
- **One supporting visual**: sidebar
- **Two visuals**: split
- **Multiple visuals of same type**: masonry or feature
- **Mixed content types**: dashboard

### Step 5: Check Responsive Requirements
- **Mobile-critical**: Prefer hero, sidebar (simpler stacking)
- **Desktop-primary**: Can use dashboard, masonry (complex grids)
- **Universal**: All layouts work, choose by content

## Common Scenarios

### Scenario: Opening Card
**Content**: Presentation title + tagline
**Selection**: hero-layout
**Rationale**: Maximum impact, establishes tone, no competing elements

### Scenario: Problem Statement with Data
**Content**: "73% of teams struggle with X" + 2-3 supporting points
**Selection**: sidebar-layout
**Rationale**: Large stat on left (image-like treatment), explanation on right

### Scenario: Before/After Comparison
**Content**: Two screenshots showing improvement
**Selection**: split-layout
**Rationale**: Equal visual weight, clear left-right narrative

### Scenario: Three Key Takeaways
**Content**: Three equally important conclusions
**Selection**: feature-layout
**Rationale**: Equal treatment, clean grouping, scannable

### Scenario: Quarterly Metrics Summary
**Content**: 6 KPIs (revenue, churn, CAC, LTV, etc.)
**Selection**: dashboard-layout
**Rationale**: Efficient presentation of multiple data points, executive view

### Scenario: Inspirational Quote
**Content**: "The best way to predict the future is to create it." - Peter Drucker
**Selection**: hero-layout.overlay with relevant background image
**Rationale**: Emotional resonance, memorable visual moment

### Scenario: Case Study
**Content**: Company logo + 3 paragraphs about their success
**Selection**: sidebar-layout
**Rationale**: Logo as visual anchor, text content structured on right

### Scenario: Product Features
**Content**: 5 features with icons and descriptions
**Selection**: feature-layout
**Rationale**: Equal importance, icon+text pattern repeats, scannable grid

## Layout Mixing Strategy

### Good Variety Pattern (10-card presentation)
1. Hero (opening)
2. Sidebar (context)
3. Sidebar (problem)
4. Hero (solution intro)
5. Split (comparison)
6. Feature (benefits)
7. Dashboard (data)
8. Sidebar (case study)
9. Feature (next steps)
10. Hero (closing)

**Why this works**:
- Variety prevents monotony
- Hero at key moments (1, 4, 10)
- Workhorse layouts (sidebar) for content
- Complex layouts (dashboard) used sparingly

### Poor Variety (Anti-Pattern)
1-10: All sidebar-layout

**Why this fails**:
- Visual monotony reduces engagement
- No emphasis on key moments
- Misses opportunity to match layout to content

## Mobile-First Considerations

When audience will primarily view on mobile:
- **Favor**: hero, sidebar (clean stacking)
- **Use carefully**: split, feature (ensure readable when stacked)
- **Avoid**: dashboard, masonry (too complex when linearized)

## Accessibility Checklist

- [ ] Text readable at all container sizes
- [ ] Color not the only differentiator
- [ ] Images have text alternatives
- [ ] Overlay text has sufficient contrast (4.5:1 minimum)
- [ ] Layout order makes sense when linearized (screen readers)
- [ ] Touch targets large enough on mobile (44px minimum)

## Layout Performance

### Fast Loading
- hero, sidebar (fewer elements)

### Moderate Loading
- split, feature (multiple elements)

### Potentially Slower
- dashboard, masonry (many images/charts)

**Optimization tip**: For dashboard/masonry, lazy-load images and use placeholders.
