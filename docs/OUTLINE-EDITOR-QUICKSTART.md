# Outline Editor - Quick Start Guide

## What is the Outline Editor?

The Outline Editor lets you review and edit an AI-generated presentation outline BEFORE creating the final presentation. This ensures your content and layouts are perfect before committing to the full generation.

## How to Use It

### Step 1: Open the Test Page

Navigate to: `http://localhost:3000/tests/api/streaming-progressive.html`

### Step 2: Configure Your Presentation

Fill in the form fields:

- **Topic**: What your presentation is about (e.g., "AI in Product Discovery")
- **Number of Cards**: How many slides (1-20)
- **Generation Mode**: Choose "Smart Mode" for AI-powered content
- **Presentation Type**: education, pitch, report, workshop, or story
- **Target Audience**: Who will see this (e.g., "executives", "developers")
- **Content Tone**: professional, creative, minimal, or inspirational

### Step 3: Generate the Outline

Click the **"Generate Outline"** button (not "Start Streaming")

Wait 2-5 seconds while the AI generates your outline.

### Step 4: Review and Edit

A modal opens showing your presentation outline. For each card, you can:

- **Edit the content**: Click into the textarea and modify the text
  - First line = Card title
  - Lines starting with • = Bullet points
  - Plain text format (no markdown)

- **Change the layout**: Use the dropdown to select from 16 layouts:
  - Hero/Presentation - Title slides
  - Hero Overlay - Background image with text
  - Image and Text - Image on left
  - Text and Image - Image on right
  - Two Columns - Side-by-side comparison
  - Title with Bullets - Simple list
  - And 10 more...

- **Add/Remove cards**: Use the + and - buttons (range: 1-20)

### Step 5: Generate the Presentation

When you're happy with the outline, click **"Generate Presentation"**

The modal closes and your presentation streams in progressively:
1. Card skeletons appear
2. Content fills in with typewriter effect
3. Styles and colors apply
4. Images generate (if enabled)

## Tips

### Content Format

Follow this structure for best results:

```
Card Title Here
• First bullet point
• Second bullet point
• Third bullet point
```

### Layout Selection

The AI suggests layouts, but you can change them:

- **Opening card**: Use "Hero/Presentation" for impact
- **Lists**: Use "Title with Bullets" or "Title with Bullets and Image"
- **Comparisons**: Use "Two Columns with Headings" for pros/cons
- **Data**: Use "Dashboard" for metrics
- **Images**: Use "Hero Overlay" for emotional content

### Regenerating

If you don't like the outline:
- Click "Regenerate Outline" to get a fresh AI-generated outline
- OR manually edit the content and keep going

### Card Count

- Start with 4-6 cards for testing
- Production presentations typically use 6-12 cards
- Maximum is 20 cards

## Keyboard Shortcuts

- **Tab**: Navigate between fields
- **Enter**: Select layout from dropdown
- **Esc**: Close the modal (cancels changes)

## Common Issues

### "No outline available" error
**Solution**: Click "Generate Outline" first before trying to generate the presentation

### Modal won't open
**Solution**: Check browser console for errors. Ensure the API server is running on port 3000

### AI generates generic content
**Solution**: Be more specific in your topic. Instead of "Marketing", use "Social Media Marketing Strategies for B2B SaaS"

### Layouts don't match
**Problem**: This shouldn't happen! The outline system uses EXACT layouts selected.
**If it does**: Report as a bug with screenshots

## Advanced Usage

### Smart Mode vs Fast Mode

- **Fast Mode**: Template-based, instant generation, no AI
- **Smart Mode**: AI-powered, 2-5 second delay, better content

Use Fast Mode for testing layouts quickly.
Use Smart Mode for actual presentations.

### Image Generation

Enable "Generate Images" to add AI-generated images to cards.

**Warning**: This adds 10-30 seconds per card. Disable for faster testing.

### Stream Delay

Adjust "Stream Delay (ms)" to control the speed of card assembly:
- 0ms = Instant (no animation)
- 300ms = Default (Gamma-like)
- 1000ms = Slow (presentation mode)

## Example Workflow

1. Topic: "Remote Work Benefits"
2. Cards: 5
3. Mode: Smart
4. Type: Education
5. Audience: "HR managers"
6. Tone: Professional

Click "Generate Outline"

**AI generates:**
- Card 1: Title slide (Hero layout)
- Card 2: Key statistics (Title with Bullets)
- Card 3: Cost savings (Two Columns with Headings)
- Card 4: Tools comparison (Three Columns)
- Card 5: Action items (Title with Bullets)

**You edit:**
- Card 3: Change layout to "Dashboard" for better data visualization
- Card 4: Add specific tool names in bullets
- Card 5: Rewrite call-to-action

Click "Generate Presentation"

**Result:** 5 cards stream in with your exact edits and layouts!

## Next Steps

After generating your presentation:
- Export as HTML bundle (coming soon)
- Adjust individual card styling
- Enable/disable shared headers/footers
- Test responsive behavior with container width controls

## Support

For help:
- Check `OUTLINE-EDITOR-IMPLEMENTATION.md` for technical details
- View server logs for API errors
- Open browser DevTools console for frontend errors
- Review the original spec: `outline-generator.md`

## Enjoy!

The Outline Editor eliminates the frustration of layout mismatches and gives you complete control over your presentation structure. Happy presenting!
