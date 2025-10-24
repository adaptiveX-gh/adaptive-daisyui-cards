# Good Outline Examples

Reference implementations showing well-structured presentation outlines across different types.

---

## Example 1: Education Presentation (10 cards)

**Topic**: Container Queries in CSS
**Audience**: Frontend developers
**Type**: Education

```json
{
  "meta": {
    "title": "Master CSS Container Queries",
    "type": "education",
    "audience": "Frontend developers familiar with media queries",
    "goal": "Enable developers to build component-responsive layouts",
    "duration_estimate": "20 minutes"
  },
  "narrative_arc": {
    "opening": "Hook with the limitations of viewport-based responsive design",
    "development": "Introduce container queries with progressively complex examples",
    "climax": "Live demo showing a card that adapts to its container, not viewport",
    "closing": "Practical patterns and browser support status"
  },
  "cards": [
    {
      "card_number": 1,
      "role": "opening",
      "purpose": "Establish the problem that container queries solve",
      "content_type": "concept",
      "key_message": "Media queries respond to viewport, but components don't know their own context",
      "supporting_points": [
        "Sidebar widget needs different layout than full-width",
        "Same component, different containers = layout breaks",
        "Can't make truly reusable responsive components"
      ],
      "visual_needs": "Split screen showing same card component in narrow sidebar vs wide main area, both breaking because of viewport-based media queries",
      "speaker_notes": "Ask: Has anyone struggled with this? Many will relate."
    },
    {
      "card_number": 2,
      "role": "body",
      "purpose": "Introduce container queries as the solution",
      "content_type": "title",
      "key_message": "Container queries let components respond to their parent's size, not the viewport",
      "supporting_points": [
        "Component knows its own context",
        "True component-level responsiveness",
        "Write once, adapts everywhere"
      ],
      "visual_needs": "Hero layout with bold title, minimal text, icon showing container wrapping responsive component",
      "speaker_notes": "Emphasize this is THE solution we've been waiting for"
    },
    {
      "card_number": 3,
      "role": "body",
      "purpose": "Explain the basic syntax",
      "content_type": "concept",
      "key_message": "Three steps: define container, set container type, write container queries",
      "supporting_points": [
        "container-type: inline-size on parent",
        "@container (min-width: 400px) for queries",
        "Uses container width units (cqw, cqh)"
      ],
      "visual_needs": "Code snippet showing the three-step pattern with color-coded annotations",
      "speaker_notes": "Keep this high-level, detailed syntax comes in next card"
    },
    {
      "card_number": 4,
      "role": "body",
      "purpose": "Show complete working example",
      "content_type": "process",
      "key_message": "Here's a card component that stacks at small sizes and goes horizontal when space allows",
      "supporting_points": [
        ".card-container { container-type: inline-size; }",
        "@container (min-width: 600px) { .card { flex-direction: row; } }",
        "Component adapts to container, not viewport"
      ],
      "visual_needs": "Side-by-side code and rendered output showing card at different container widths",
      "speaker_notes": "Walk through each line, explain why it matters"
    },
    {
      "card_number": 5,
      "role": "body",
      "purpose": "Demonstrate container query units",
      "content_type": "concept",
      "key_message": "Container query units scale typography and spacing based on container size",
      "supporting_points": [
        "cqw = 1% of container width",
        "font-size: clamp(1rem, 3cqw, 2rem) scales smoothly",
        "No more arbitrary breakpoints for text"
      ],
      "visual_needs": "Visual comparison showing text scaling with container using cqw units vs fixed sizes",
      "speaker_notes": "This is powerful for truly fluid typography"
    },
    {
      "card_number": 6,
      "role": "body",
      "purpose": "Show real-world pattern",
      "content_type": "comparison",
      "key_message": "Before container queries vs after: Same component, different contexts, perfect layouts",
      "supporting_points": [
        "Before: Viewport media queries break in sidebar",
        "After: Container queries adapt perfectly",
        "Write once, works everywhere"
      ],
      "visual_needs": "Before/after comparison: broken layouts with media queries vs perfect layouts with container queries",
      "speaker_notes": "This is the 'aha' moment - the power should be obvious"
    },
    {
      "card_number": 7,
      "role": "body",
      "purpose": "Address common gotchas",
      "content_type": "concept",
      "key_message": "Container queries have different behavior than media queries - know the quirks",
      "supporting_points": [
        "Can't query the element you're styling (must be descendant)",
        "Container type affects layout (inline-size doesn't shrink-wrap)",
        "Nesting containers works but adds complexity"
      ],
      "visual_needs": "Diagram showing valid vs invalid query patterns",
      "speaker_notes": "These trip people up - save them debugging time"
    },
    {
      "card_number": 8,
      "role": "transition",
      "purpose": "Practice opportunity",
      "content_type": "concept",
      "key_message": "Try it: Convert this media query card to use container queries",
      "supporting_points": [
        "Start with existing code using @media",
        "Add container-type to parent",
        "Change @media to @container",
        "Test by resizing container, not viewport"
      ],
      "visual_needs": "Code challenge showing starting point with media queries",
      "speaker_notes": "Give audience 2 minutes to try on their own or think through approach"
    },
    {
      "card_number": 9,
      "role": "body",
      "purpose": "Browser support and fallbacks",
      "content_type": "data",
      "key_message": "Container queries are stable in all modern browsers as of 2023",
      "supporting_points": [
        "Chrome 105+, Firefox 110+, Safari 16+",
        "~89% global support (caniuse.com)",
        "Fallback: feature detection with @supports"
      ],
      "visual_needs": "Browser compatibility chart with support percentages",
      "speaker_notes": "Safe to use in production with basic fallback strategy"
    },
    {
      "card_number": 10,
      "role": "closing",
      "purpose": "Provide next steps and resources",
      "content_type": "takeaway",
      "key_message": "Container queries unlock component-based responsive design",
      "supporting_points": [
        "Start simple: one component, one container query",
        "Combine with container units for fluid scaling",
        "Resources: MDN docs, Una Kravets demos, Ahmad Shadeed articles"
      ],
      "visual_needs": "Clean takeaway card with 3 key points and resource links",
      "speaker_notes": "Encourage trying this in their next component"
    }
  ],
  "coherence": {
    "transitions": [
      "Card 1→2: Problem established, solution introduced",
      "Card 2→3: Concept introduced, now show how it works",
      "Card 3→4: Syntax explained, now see it in action",
      "Card 4→5: Basic usage shown, now advanced technique",
      "Card 5→6: Individual features shown, now see complete picture",
      "Card 6→7: Success case shown, now address pitfalls",
      "Card 7→8: Theory complete, now practice",
      "Card 8→9: Implementation covered, now deployment considerations",
      "Card 9→10: All technical content complete, now takeaways"
    ],
    "recurring_themes": [
      "Component reusability",
      "Context-aware design",
      "Comparison to media queries"
    ],
    "callbacks": "Card 10 references the problem from Card 1, showing full circle"
  }
}
```

**Why this outline works:**
- Clear learning progression: problem → solution → syntax → example → practice
- Balances concepts with concrete code examples
- Addresses common mistakes proactively
- Includes practice opportunity for engagement
- Provides practical next steps

---

## Example 2: Pitch Presentation (8 cards)

**Topic**: AI-powered code review tool
**Audience**: Technical VCs
**Type**: Pitch

```json
{
  "meta": {
    "title": "CodeGuard: AI That Ships Better Code",
    "type": "pitch",
    "audience": "Technical venture capital investors",
    "goal": "Secure $2M seed round",
    "duration_estimate": "10 minutes + Q&A"
  },
  "narrative_arc": {
    "opening": "Hook with shocking cost of bugs in production",
    "development": "Build case that manual code review doesn't scale",
    "climax": "Demo showing AI catching critical security bug humans missed",
    "closing": "Strong traction + clear ask"
  },
  "cards": [
    {
      "card_number": 1,
      "role": "opening",
      "purpose": "Grab attention with the scale of the problem",
      "content_type": "data",
      "key_message": "Software bugs cost the global economy $2.08 trillion annually",
      "supporting_points": [
        "Average cost per critical bug: $5.2M (IBM)",
        "73% of security breaches from code vulnerabilities",
        "Manual code review catches only 60% of issues"
      ],
      "visual_needs": "Large number ($2.08T) as hero, with supporting stats below",
      "speaker_notes": "Pause after revealing the number. Let it sink in."
    },
    {
      "card_number": 2,
      "role": "body",
      "purpose": "Show why current solutions fail",
      "content_type": "concept",
      "key_message": "Code review is the bottleneck that slows every engineering team",
      "supporting_points": [
        "Developers wait 4-48 hours for review feedback",
        "Context switching kills productivity",
        "Senior devs spend 30% of time reviewing, not building",
        "Fatigue means critical issues slip through"
      ],
      "visual_needs": "Process diagram showing review bottleneck in dev workflow, with time delays highlighted",
      "speaker_notes": "Many in audience have experienced this pain. Make it tangible."
    },
    {
      "card_number": 3,
      "role": "body",
      "purpose": "Introduce the solution",
      "content_type": "title",
      "key_message": "CodeGuard: AI-powered code review that catches what humans miss, in seconds not hours",
      "supporting_points": [
        "Instant feedback on every commit",
        "Detects security, performance, and logic issues",
        "Learns your codebase and standards"
      ],
      "visual_needs": "Hero layout with product name and tagline, minimal supporting text",
      "speaker_notes": "This is the 'aha' slide. Keep it simple and bold."
    },
    {
      "card_number": 4,
      "role": "body",
      "purpose": "Show the product in action",
      "content_type": "image",
      "key_message": "CodeGuard integrates directly into your GitHub/GitLab workflow",
      "supporting_points": [
        "Screenshot: AI comment on PR pointing out SQL injection risk",
        "Explains the issue, severity, and fix",
        "Approves safe changes automatically"
      ],
      "visual_needs": "Annotated screenshot of CodeGuard commenting on a GitHub PR, highlighting key features",
      "speaker_notes": "Walk through the screenshot. Point out how detailed the feedback is."
    },
    {
      "card_number": 5,
      "role": "body",
      "purpose": "Prove it works with real data",
      "content_type": "data",
      "key_message": "Early customers catch 3x more issues and ship 40% faster",
      "supporting_points": [
        "92% bug detection rate (vs 60% manual)",
        "Average review time: 2 minutes (vs 18 hours)",
        "Critical security vulnerabilities blocked: 147 in 90 days across 8 teams"
      ],
      "visual_needs": "Dashboard showing key metrics with before/after comparisons",
      "speaker_notes": "These are real numbers from beta customers. Emphasize 147 blocked vulnerabilities."
    },
    {
      "card_number": 6,
      "role": "body",
      "purpose": "Show market opportunity",
      "content_type": "data",
      "key_message": "$12B developer tools market growing at 21% CAGR",
      "supporting_points": [
        "47 million developers worldwide",
        "Average enterprise: 200 developers, $50K/yr ARR opportunity",
        "TAM: $8.5B, SAM: $2.3B, SOM: $380M (years 1-3)"
      ],
      "visual_needs": "Market sizing chart showing TAM/SAM/SOM funnel with growth trajectory",
      "speaker_notes": "This is not a niche tool - every company writing code is a potential customer."
    },
    {
      "card_number": 7,
      "role": "body",
      "purpose": "Differentiate from competition",
      "content_type": "comparison",
      "key_message": "Unlike SonarQube or GitHub Copilot, we combine deep analysis with natural language explanations",
      "supporting_points": [
        "SonarQube: Rules-based, high false positives, no explanations",
        "GitHub Copilot: Code generation, not review",
        "CodeGuard: AI-powered analysis + educational feedback + context-aware"
      ],
      "visual_needs": "Competitive matrix showing feature comparison across key dimensions",
      "speaker_notes": "We're not replacing human review - we're making it superhuman."
    },
    {
      "card_number": 8,
      "role": "closing",
      "purpose": "Make the ask with strong momentum signal",
      "content_type": "title",
      "key_message": "Seeking $2M seed to scale from 50 to 5,000 teams by EOY 2026",
      "supporting_points": [
        "Current traction: 8 paying customers, $15K MRR, 180% MoM growth",
        "Use of funds: ML team (40%), sales (35%), infrastructure (25%)",
        "18-month runway to Series A milestones"
      ],
      "visual_needs": "Split layout: Ask on left (large text), traction metrics + use of funds on right",
      "speaker_notes": "End with confidence. We have proof this works and a clear path to scale."
    }
  ],
  "coherence": {
    "transitions": [
      "Card 1→2: Problem scale → why it exists (bottleneck)",
      "Card 2→3: Problem clear → solution introduced",
      "Card 3→4: Solution concept → concrete product demonstration",
      "Card 4→5: Product shown → validation with data",
      "Card 5→6: Works for customers → massive market opportunity",
      "Card 6→7: Market is huge → why we'll win (differentiation)",
      "Card 7→8: We can win → here's how you can join (the ask)"
    ],
    "recurring_themes": [
      "Speed and scale",
      "Human limitations vs AI capabilities",
      "Security and quality"
    ],
    "callbacks": "Card 8 references $2.08T from Card 1 ('capturing just 0.1% of that waste')"
  }
}
```

**Why this outline works:**
- Leads with compelling problem (hooks investors)
- Shows clear product demo early (not vaporware)
- Provides strong proof points (data-driven)
- Addresses competition proactively
- Strong traction signal with specific ask
- Tight narrative flow (no wasted cards)

---

## Key Patterns Across Good Outlines

### Narrative Flow
- Each card serves clear purpose in the story
- Transitions are intentional (not just "next topic")
- Callbacks create cohesion
- Climax is identifiable and earned

### Content Variety
- Mix of content types (not all concepts or all data)
- Visual needs are specific (not generic "use image")
- Speaker notes add value (guidance for delivery)

### Audience Focus
- Language matches audience sophistication
- Examples relevant to their context
- Addresses their concerns/objections
- Clear benefit to them (not just feature list)

### Actionable Structure
- Key message is ONE clear sentence
- Supporting points expand without repeating
- Visual needs directly support the message
- Speaker notes provide delivery guidance
