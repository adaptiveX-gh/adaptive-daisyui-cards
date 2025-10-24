# Visual Suggestions Guide

How to recommend effective visual elements that support (not distract from) the message.

## Guiding Principles

1. **Every visual must have a purpose**: No decoration
2. **Specificity matters**: "Photo of team at whiteboard" > "team image"
3. **Authenticity over perfection**: Real > stock photos
4. **Cognitive load**: Each visual should reduce mental effort, not increase it
5. **Cultural awareness**: Visuals can carry unintended meanings

## Icon Usage

### When to Recommend Icons
✅ **Aid scanning**: Help audience quickly identify categories
✅ **Reinforce concepts**: Visual mnemonic for abstract ideas
✅ **Create visual rhythm**: Repeated pattern in feature lists
✅ **Replace text**: Icon + label > full sentence

### When to Avoid Icons
❌ **Arbitrary decoration**: "Make it less boring"
❌ **Unclear mapping**: Icon doesn't obviously connect to concept
❌ **Overuse**: Icons on every text element
❌ **Complex ideas**: Better explained with words/diagrams

### Good Icon Suggestions

**Example 1: Feature List**
```json
{
  "icon_suggestions": "Use consistent icon style (line icons, ~24px). Security: shield, Speed: lightning bolt, Scalability: trending-up arrow, Support: message-circle, Integration: plug"
}
```
Why this works: Specific icons named, style guidance, size specified

**Example 2: Process Steps**
```json
{
  "icon_suggestions": "Numbered circles (1-4) with subtle arrow connectors to show sequence. Keep numbers primary focus, icons secondary if needed."
}
```
Why this works: Functional use, hierarchy clear

### Poor Icon Suggestions

❌ "Use relevant icons" - Too vague
❌ "Add icons for visual interest" - No functional purpose
❌ "Lightbulb, rocket, magnifying glass" - Generic, overused
❌ Icons for every bullet point - Cluttered

## Image Usage

### When to Recommend Images
✅ **Show, don't tell**: Product screenshot > description
✅ **Emotional connection**: Faces, real moments
✅ **Context**: Where/how something is used
✅ **Proof**: Before/after, results, evidence

### When to Avoid Images
❌ **Generic stock photos**: Handshakes, jumping people, light bulbs
❌ **Unrelated**: Image doesn't connect to content
❌ **Low quality**: Pixelated, poorly lit, amateur
❌ **Text-heavy**: Image of text (just use text)

### Good Image Suggestions

**Example 1: Product Demo Card**
```json
{
  "image_guidance": "Screenshot of dashboard showing key feature in use, annotated with 2-3 callouts pointing to important UI elements. Use actual product, not mockup. Ensure text in screenshot is readable."
}
```
Why this works: Specific content, quality criteria, functional annotations

**Example 2: Team Card**
```json
{
  "image_guidance": "Authentic photo of team collaborating - prefer candid working shot over posed group photo. Natural lighting, diverse team visible. Crop to show faces clearly. 4:3 aspect ratio."
}
```
Why this works: Style guidance, authenticity emphasized, technical specs

**Example 3: Concept Card**
```json
{
  "image_guidance": "Diagram showing container queries concept: nested boxes with parent container wrapping child elements that respond to container (not viewport) size. Use color to distinguish container from viewport. Arrows showing query direction."
}
```
Why this works: Describes diagram content precisely, explains visual strategy

### Poor Image Suggestions

❌ "Use an image of the product" - What aspect? Angle? Context?
❌ "Stock photo of happy customer" - Generic, inauthentic
❌ "Relevant image" - Meaningless
❌ "Chart or graph" - What kind? Showing what data?

## Chart/Data Visualization

### Chart Type Selection

| Data Type | Best Chart | Alternative |
|-----------|------------|-------------|
| **Trend over time** | Line chart | Area chart |
| **Category comparison** | Bar chart (horizontal) | Column chart (vertical) |
| **Part-to-whole** | Stacked bar | Pie (3-4 segments max) |
| **Relationship** | Scatter plot | Bubble chart |
| **Distribution** | Histogram | Box plot |
| **Hierarchy** | Treemap | Sunburst |
| **Progress** | Progress bar | Gauge |
| **Ranking** | Bar chart | Dot plot |

### Good Chart Suggestions

**Example 1: Growth Data**
```json
{
  "chart_type": "Line chart showing monthly revenue growth Jan-Dec. Use single bold color. Annotate inflection point in June with label 'Product launch'. Y-axis: $0-$500K, X-axis: month labels. Show data points with small circles on line.",
  "color_usage": "Primary brand color for line, lighter shade for area fill beneath. Red annotation for June spike."
}
```
Why this works: Chart type + data + design details + specific annotations

**Example 2: Comparison Data**
```json
{
  "chart_type": "Horizontal bar chart comparing 5 competitor features (yes/no). Us at top in primary color, competitors in neutral gray. Use checkmark/X icons instead of bars for binary data. Order by number of features (most to least).",
  "color_usage": "Our row: brand green with checkmarks. Competitors: light gray with red X for missing features."
}
```
Why this works: Chart type, data structure, sorting logic, visual encoding explained

**Example 3: Multiple Metrics**
```json
{
  "chart_type": "Dashboard with 4 KPI cards: Revenue (large number + sparkline), Growth (percentage with up arrow), Churn (percentage with trend), MRR (number with comparison to last month). Arrange in 2x2 grid.",
  "color_usage": "Positive metrics (revenue, growth) in green, negative (churn) in red, neutral (MRR) in blue. Use subtle background colors for card differentiation."
}
```
Why this works: Specifies dashboard composition, data types, layout, semantic color usage

### Poor Chart Suggestions

❌ "Show data in a chart" - What data? What chart type?
❌ "Bar chart" - Horizontal or vertical? What's being compared?
❌ "Pie chart showing breakdown" - How many segments? Colors? Order?
❌ "Use a graph" - Unhelpfully vague

## Color Usage

### Strategic Color Application

**Semantic Use**
```json
{
  "color_usage": "Use red for decreased/negative metrics (-23% churn), green for increased/positive metrics (+45% revenue). Keep neutral metrics in default text color."
}
```

**Emphasis Use**
```json
{
  "color_usage": "Highlight the key statistic '92%' in accent color (rest of text in neutral gray) to draw eye to most important number."
}
```

**Categorical Use**
```json
{
  "color_usage": "Assign distinct colors to three product tiers: Basic (blue), Pro (purple), Enterprise (gold). Use consistently across all cards showing tier information."
}
```

**Accessibility-First Use**
```json
{
  "color_usage": "Use color plus shape/icon to distinguish categories (not color alone). Ensure all color combinations meet WCAG AA contrast ratio (4.5:1 for text)."
}
```

### Color Anti-Patterns

❌ **Rainbow everything**: Too many colors = visual chaos
❌ **Arbitrary colors**: No logic to color choices
❌ **Low contrast**: Can't read text on background
❌ **Color-only encoding**: Inaccessible to colorblind users

## Typography Hierarchy

### Title Treatment Examples

**Maximum Impact**
```json
{
  "title_treatment": "Extra-large (3-4rem), bold weight, minimal words (3-5), generous letter-spacing for elegance. Consider all-caps for very short titles (2-3 words)."
}
```

**Clear Hierarchy**
```json
{
  "title_treatment": "Large (2rem), bold weight. Secondary heading at 1.5rem, medium weight. Body at 1rem, regular weight. Clear size jumps between levels (1.33 ratio)."
}
```

**Data-Focused**
```json
{
  "title_treatment": "Number/stat: Extra-large (4rem), bold. Label: Small caps, 0.75rem, letter-spaced, secondary color. Description: 1rem, regular weight."
}
```

### Body Treatment Examples

**Scannable List**
```json
{
  "body_treatment": "Bullet points with generous line-height (1.6). Limit to 3-5 items. Bold first 2-3 words of each point as scannable hook. Rest in regular weight."
}
```

**Readable Paragraphs**
```json
{
  "body_treatment": "Short paragraphs (2-3 lines max). Line-height: 1.5. Max width: 60 characters per line. Regular weight, slightly larger than typical body (1.125rem) for presentations."
}
```

**Minimalist**
```json
{
  "body_treatment": "Single sentence or short phrase. Medium-large size (1.5rem), regular weight. Generous white space around text."
}
```

## Complete Visual Suggestion Examples

### Example 1: Opening Card
```json
{
  "recommended_visuals": [
    "Background: Full-bleed image of code on dark IDE with shallow depth of field (blurred background)",
    "Text overlay: White title with dark gradient overlay ensuring 5:1 contrast ratio"
  ],
  "icon_suggestions": "None needed - title should stand alone",
  "image_guidance": "Use authentic screenshot of actual development environment, not stock 'coding' image. Should feel professional and technical. Crop to show code but keep it unreadable (for aesthetic, not literal reading).",
  "color_usage": "White text on dark image with gradient overlay (dark at bottom fading to transparent). Brand accent color on subtitle if used."
}
```

### Example 2: Comparison Card
```json
{
  "recommended_visuals": [
    "Left side: Screenshot of old cluttered dashboard UI",
    "Right side: Screenshot of new clean dashboard UI",
    "Centered arrow or 'vs' label between them"
  ],
  "icon_suggestions": "None - screenshots are primary visuals",
  "image_guidance": "Show exact same data in both UIs for fair comparison. Same screen size/crop. Left (old) should clearly look more complex/cluttered. Right (new) should appear cleaner/simpler. Add subtle labels 'Before' and 'After' above each.",
  "color_usage": "Before image: slight red tint/border. After image: slight green tint/border. Subtle semantic reinforcement."
}
```

### Example 3: Feature List Card
```json
{
  "recommended_visuals": [
    "3-column grid with icon + title + description for each feature",
    "Background: Subtle gradient or texture (not distracting)"
  ],
  "icon_suggestions": "Line icons in accent color: Security (shield-check), Speed (zap), Scale (trending-up). Icons at ~32px size, positioned above title. Same style/weight across all three.",
  "image_guidance": "No photos needed - icons carry visual weight. Consider subtle background illustration (abstract shapes) if card feels too sparse, but keep it at <20% opacity.",
  "chart_type": "N/A",
  "color_usage": "Icons in brand accent color. Titles in primary text color (dark gray/black). Descriptions in secondary color (medium gray). Optional: subtle background color tint for each feature card for differentiation."
}
```

### Example 4: Data Card
```json
{
  "recommended_visuals": [
    "Large number (primary metric) at top",
    "Sparkline chart below showing trend",
    "Supporting metrics in smaller text at bottom"
  ],
  "icon_suggestions": "Optional: Small trend icon (arrow-up/arrow-down) next to percentage change",
  "image_guidance": "N/A - data visualization is the visual",
  "chart_type": "Sparkline: Simple line chart without axes or labels, showing shape of trend only. 3:1 aspect ratio (wide and short). Single color matching sentiment (green for positive trend, red for negative).",
  "color_usage": "Large number: Brand color if neutral, green if positive, red if negative. Sparkline: Same semantic color as number. Supporting text: Medium gray."
}
```

## Visual Consistency Rules

1. **Icon style**: Choose one style (line, filled, duotone) and stick with it
2. **Image treatment**: Consistent aspect ratios, borders, shadows (or none)
3. **Chart style**: Same color palette, axis style, font across all charts
4. **Spacing**: Consistent margins, padding, gaps throughout
5. **Typography**: Limit to 2-3 font sizes/weights per card

## Accessibility Checklist

- [ ] All text has minimum 4.5:1 contrast with background (7:1 for large text)
- [ ] Color is not the only means of conveying information
- [ ] Images have descriptive alt text
- [ ] Charts have data tables or descriptions available
- [ ] Icon meanings are reinforced with text labels
- [ ] Animations can be paused or disabled
- [ ] Focus indicators visible for interactive elements

## Testing Visual Suggestions

Ask yourself:
1. **Is it specific?** Could someone implement this without guessing?
2. **Is it purposeful?** Does it support the message or just decorate?
3. **Is it accessible?** Works for diverse audiences and abilities?
4. **Is it consistent?** Fits with overall visual system?
5. **Is it feasible?** Can be created with available tools/assets?

If answer to any is "no", revise the suggestion.
