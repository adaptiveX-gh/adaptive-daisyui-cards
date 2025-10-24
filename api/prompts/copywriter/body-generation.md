# Body Copy Generation Guide

Body copy expands on the title's promise. It must be scannable, clear, and concise.

## Body Copy Principles

1. **One idea per paragraph/bullet**: Don't combine concepts
2. **Front-load importance**: Most critical info first
3. **Show, don't tell**: Concrete examples > abstract statements
4. **Rhythm matters**: Vary sentence length for engagement
5. **Respect layout constraints**: Don't fight available space

## Copy Formats by Layout

### Hero Layout
**Format**: Title only OR title + short subtitle
**Body**: None or minimal (1 short sentence max)

**Example**:
```
Title: "Container Queries Are Here"
Subtitle: "Build responsive components, not just responsive pages"
Body: [none]
```

**Key**: Hero is about impact, not explanation. Save details for next card.

### Sidebar Layout
**Format**: Title + structured content + image

**Option 1: Bullet Points** (most common)
```
Title: "Why Manual Code Review Fails"

• Senior devs spend 30% of time reviewing, not building
• Critical bugs slip through due to reviewer fatigue
• Average wait time: 18 hours per review
• Context switching kills productivity
```

**Option 2: Short Paragraphs**
```
Title: "Our Customer Research Breakthrough"

We interviewed 50 churned customers in one week. The pattern was brutal: they didn't need our product.

They needed one feature buried in our dashboard. Everything else was noise.

We stripped away 80% of our product. Rebuilt in 30 days. Churn dropped from 12% to 3%.
```

**Key**: 3-5 bullets OR 2-3 paragraphs. Not both.

### Split Layout
**Format**: Title + two balanced content blocks

**Option 1: Comparison**
```
Title: "Before Container Queries | After Container Queries"

Left:
• Viewport-based media queries
• Components break in sidebars
• One size fits all
• Constant layout fixes

Right:
• Container-based queries
• Components adapt to context
• Smart, responsive elements
• Write once, works everywhere
```

**Option 2: Concept + Example**
```
Title: "Theory Meets Practice"

Left:
Container queries let components respond to their parent's size, not the viewport.

This means a card in a sidebar can have a different layout than the same card in the main content area.

Right:
[Code example or screenshot showing the concept in action]
```

**Key**: Equal weight to both sides. Mirror structure when possible.

### Feature Layout
**Format**: Title + 3-6 items with consistent structure

**Pattern**: [Icon] **Feature Name** - Brief description

```
Title: "What Makes CodeGuard Different"

⚡ **Instant Analysis**
AI review in 2 minutes vs 18-hour human wait

🛡️ **Smarter Detection**
92% bug catch rate vs 60% manual review

🧠 **Learning System**
Adapts to your codebase and standards

📊 **Clear Reports**
Explains issues, severity, and fixes
```

**Key**: Parallel structure. Same format for each feature. 2-4 word name, 8-15 word description.

### Dashboard Layout
**Format**: Title + multiple metrics/data points

**Pattern**: Minimize text, let numbers speak

```
Title: "Q3 Performance"

Revenue: $847K (+23% QoQ)
Churn: 3.2% (-65% QoQ)
CAC: $180 (-15% QoQ)
LTV: $8,400 (+45% QoQ)
MRR: $240K (+31% QoQ)
```

**Key**: Label, value, context. Keep it tight. Use symbols (%, $, →) to reduce word count.

## Bullet Point Best Practices

### Structure
Start strong (verb or power noun), then clarify

**Good Examples**:
```
• Reduced deployment time from 4 hours to 8 minutes
• Eliminated 90% of configuration errors
• Scaled automatically from 10 to 10,000 requests
• Saved $240K annually in infrastructure costs
```

**Poor Examples**:
```
❌ We have better deployment times now
❌ Helps reduce errors
❌ Good scalability
❌ Cost savings
```

### Parallel Structure
All bullets follow same grammatical pattern

**Example 1: Past Tense Verbs**
```
• Interviewed 50 churned customers
• Identified pattern in 80% of responses
• Rebuilt product based on insights
• Reduced churn from 12% to 3%
```

**Example 2: Present Tense Benefits**
```
• Catches bugs humans miss
• Explains issues in plain language
• Learns your codebase patterns
• Integrates with existing workflow
```

**Example 3: Noun Phrases**
```
• Real-time AI analysis
• Detailed fix recommendations
• Custom rule configuration
• Zero false positives
```

### Length
Aim for one line per bullet when displayed

- **Ideal**: 8-12 words
- **Maximum**: 15 words
- **Minimum**: 3 words (complete thought)

If bullet needs more than 15 words, split it or use paragraph format instead.

### Emphasis
Bold first 2-3 words for scannability

```
• **Reduced deployment** time from 4 hours to 8 minutes
• **Eliminated 90%** of configuration errors
• **Scaled automatically** from 10 to 10,000 requests
```

Audience can scan bold words and get the message even if they don't read full bullets.

## Paragraph Best Practices

### Length
Short paragraphs (2-3 lines max on slide)

**Good Example**:
```
We interviewed 50 churned customers in one week. The pattern was brutal.

They didn't want our product. They wanted one feature buried in our dashboard.

We stripped everything else. Rebuilt in 30 days. Churn dropped 75%.
```

**Poor Example**:
```
After conducting extensive customer research by interviewing approximately 50 customers who had recently churned from our platform over the course of one intensive week, we discovered a surprising pattern that emerged from the data...
[Too long - audience will skip]
```

### Sentence Variety
Mix short and long for rhythm

**Pattern 1: Short → Short → Long**
```
We failed. Hard. But that failure taught us everything we needed to know about building products people actually want.
```

**Pattern 2: Long → Short**
```
We spent six months building features our customers said they wanted. They lied.
```

**Pattern 3: Question → Answer**
```
Why did we succeed where others failed? We talked to customers.
```

### Active Voice
Subject does the action

**Active** (strong): "We rebuilt the entire stack"
**Passive** (weak): "The entire stack was rebuilt"

**Active** (strong): "Container queries solve this problem"
**Passive** (weak): "This problem is solved by container queries"

Only use passive when actor is unknown or irrelevant:
- "The bug was introduced in version 2.3" (we don't care who)
- "92% of users prefer the new design" (focus on result, not researcher)

## Copy by Content Type

### Concept Explanation
**Goal**: Understanding
**Structure**: What it is → Why it matters → How it works

```
Title: "What Are Container Queries?"

Container queries let components respond to their parent's size instead of the viewport.

This solves the fundamental problem with media queries: components don't know their own context.

Now you can build truly reusable responsive components that adapt intelligently wherever they're placed.
```

### Data/Results
**Goal**: Credibility
**Structure**: Number → Context → Impact

```
Title: "The Results"

• 92% bug detection rate (vs 60% manual)
• 2-minute average review time (vs 18 hours)
• 147 critical vulnerabilities blocked in 90 days
• $240K saved annually in prevented incidents
```

### Problem Statement
**Goal**: Urgency
**Structure**: Pain → Scale → Consequence

```
Title: "The Code Review Bottleneck"

Developers wait 4-48 hours for review feedback. Context switching kills productivity.

Senior devs spend 30% of time reviewing instead of building. Fatigue means critical issues slip through.

Result: Slower shipping, more bugs, burned-out teams.
```

### Solution Description
**Goal**: Clarity
**Structure**: What it does → How it helps → Why it's different

```
Title: "Introducing CodeGuard"

AI-powered code review that analyzes every commit in seconds, catching security vulnerabilities, performance issues, and logic errors.

Get instant feedback without waiting for humans. Senior devs focus on building, not reviewing.

Unlike rule-based tools, CodeGuard understands context and explains issues in plain language.
```

### Process/How-To
**Goal**: Action
**Structure**: Step by step, numbered or sequenced

```
Title: "Getting Started"

1. Install CodeGuard GitHub app
2. Configure rules for your repo
3. Open a pull request
4. Get AI feedback in <2 minutes
5. Address issues and merge
```

### Quote/Testimonial
**Goal**: Credibility through voice
**Structure**: Quote → Attribution → Context

```
Title: "What Customers Say"

"CodeGuard caught a critical SQL injection vulnerability our entire team missed. It paid for itself on day one."

— Sarah Chen, VP Engineering at TechCorp
(Series B startup, 50-person eng team)
```

### Comparison
**Goal**: Differentiation
**Structure**: Them vs Us, Before vs After

```
Title: "Container Queries vs Media Queries"

**Media Queries**
• Respond to viewport size
• Component breaks in different contexts
• Requires context-specific code

**Container Queries**
• Respond to container size
• Component adapts intelligently
• Write once, works everywhere
```

## Tone Variations

Same content, different tones:

### Professional Tone
```
Title: "Customer Acquisition Cost Reduction"

We implemented a comprehensive customer research initiative, interviewing 50 churned users to identify friction points in our onboarding experience.

Based on these insights, we streamlined our product focus, reducing CAC by 45% while improving conversion rates by 32%.
```

### Creative Tone
```
Title: "How We Cut CAC in Half"

We did something crazy: we asked customers why they left.

Turns out they didn't want our product. They wanted one feature. So we killed everything else.

CAC dropped 45%. Conversions jumped 32%. Simplicity wins.
```

### Minimal Tone
```
Title: "45% Lower CAC"

Interviewed 50 churned users.
Found pattern: wanted 1 feature.
Stripped product to essentials.
Result: 45% lower CAC, 32% higher conversion.
```

## Copy Length Guidelines

### By Layout
- **Hero**: 0-20 words total
- **Hero overlay**: 0-15 words total
- **Sidebar**: 40-80 words
- **Split**: 30-80 words (balanced between sides)
- **Feature**: 50-120 words (distributed across features)
- **Dashboard**: 30-60 words
- **Masonry**: 10-40 words (mostly captions)

### By Role
- **Opening**: Shorter, punchier (hook fast)
- **Body**: Full length (deliver content)
- **Transition**: Shorter (bridge sections)
- **Climax**: Shorter (maximum impact)
- **Closing**: Medium (clear next steps)

## Common Body Copy Mistakes

### ❌ Mistake 1: Repeating the Title
```
Title: "Container Queries Explained"
Body: "Container queries are a new CSS feature that allows..."
```
**Fix**: Title announces topic. Body explores or expands.
```
Title: "Container Queries Explained"
Body: "Components respond to their container size, not the viewport. This solves..."
```

### ❌ Mistake 2: Walls of Text
```
[8-line paragraph with no breaks]
```
**Fix**: Break into bullets or short paragraphs with white space.

### ❌ Mistake 3: Vague Claims
```
• Better performance
• Improved user experience
• More efficient workflows
```
**Fix**: Specific, measurable, concrete
```
• 92% faster page loads
• 45% higher user satisfaction scores
• 4-hour tasks now take 8 minutes
```

### ❌ Mistake 4: Inconsistent Structure
```
• Reduced deployment time from 4 hours to 8 minutes
• Configuration errors are almost eliminated
• We can now scale automatically
• Saves money on infrastructure
```
**Fix**: Parallel structure
```
• Reduced deployment from 4 hours to 8 minutes
• Eliminated 90% of configuration errors
• Enabled automatic scaling to 10,000 requests
• Saved $240K annually in infrastructure costs
```

### ❌ Mistake 5: Feature Dumping
```
• Feature A
• Feature B
• Feature C
• Feature D
• Feature E
```
**Fix**: Benefits, not features. Connect to audience needs.
```
• Ship code 3x faster with instant AI review
• Catch security bugs before they reach production
• Focus senior devs on building, not reviewing
```

## Body Copy Checklist

Before finalizing body copy:
- [ ] Every word necessary? (Try to cut 20%)
- [ ] Front-loaded? (Most important info first)
- [ ] Scannable? (Can you skim bold words and get it?)
- [ ] Active voice? (Passive only if intentional)
- [ ] Parallel structure? (If using bullets/list)
- [ ] Specific? (Numbers, examples, not abstractions)
- [ ] Fits layout? (Within word count constraints)
- [ ] Consistent tone? (Matches style guide)
- [ ] Readable aloud? (Natural rhythm, no awkward phrases)

## Speaker Notes vs Slide Copy

**Slide copy**: What audience sees
**Speaker notes**: What presenter says

### Bad Practice: Repeating
```
Slide: "Container queries let components respond to container size"
Notes: "Container queries let components respond to container size"
```

### Good Practice: Expanding
```
Slide: "Container queries let components respond to container size"
Notes: "This is the key difference from media queries. Media queries only know about viewport. But if you put a component in a narrow sidebar, media queries can't help—they don't know the component is in a tight space. Container queries solve this. [Show example]"
```

Speaker notes should:
- Provide context not on slide
- Suggest emphasizing certain points
- Include examples or stories
- Note timing or transitions
- Flag potential questions to address

## Testing Your Body Copy

### The Squint Test
Blur your eyes or zoom out. Can you still identify the key points? If not, add emphasis (bold, size, spacing).

### The 3-Second Rule
Show someone the card for 3 seconds. What do they remember? That's your real message.

### The Read-Aloud Test
Read your copy out loud. Stumble anywhere? Awkward phrasing? Fix it.

### The Cut Test
Try to remove 20% of words. Usually possible. Tighter is better.

### The "So What?" Test
After each sentence, ask "So what?" Does the next sentence answer? If not, you're listing facts without connecting to value.
