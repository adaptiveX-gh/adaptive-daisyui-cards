## User Story: Presentation Outline Editor with Layout Selection

### User Story
**As a** presentation builder using the Adaptive DaisyUI Card System  
**I want to** review and edit an AI-generated outline with the ability to modify content and select layouts before generation
**So that** I can ensure my presentation content and visual layouts are correct before committing to the final generation, eliminating layout mismatches and content errors

### Business Value
- Reduces regeneration cycles by 90% (users fix issues before generation)
- Eliminates layout mismatch bugs completely
- Increases user satisfaction through predictable output
- Decreases support tickets related to wrong layouts

---

## Acceptance Criteria

### AC1: Outline Generation Interface
**Given** I am on the presentation creation page  
**When** I enter a topic and click "Generate outline"  
**Then** I should see:
- A numbered list of cards (1 to N)
- Each card showing relavent content information in an editable text field
- A dropdown menu for each card showing available layouts
- The system should generate appropriate initial layout suggestions based on content

### AC2: Content Editing
**Given** an outline has been generated  
**When** I click into any card's text area  
**Then** I should be able to:
- Edit the title (first line of text)
- Add, edit, or remove bullet points (subsequent lines)
- Use line breaks to separate content sections
- See changes reflected immediately without saving

**Format specification:**
```
Title of Card
• First bullet point
• Second bullet point
• Third bullet point
```

### AC3: Layout Selection
**Given** I am viewing a card in the outline  
**When** I click the layout dropdown  
**Then** I should see these options at minimum:
- Title Slide
- Bullet Points
- Two Columns
- Three Columns
- Image + Text
- Quote
- Comparison

**And** the selected layout should persist when generating the final presentation

### AC4: Card Management
**Given** I am viewing the outline  
**When** interacting with cards  
**Then** I should be able to:
- See card numbers (1, 2, 3, etc.) clearly displayed
- Adjust total number of cards (± buttons, range: 1-20)
- See visual indication when hovering over a card
- Regenerate the entire outline with one button

### AC5: Final Generation
**Given** I have reviewed and edited the outline  
**When** I click "Generate Presentation"  
**Then** the system should:
- Create cards using the exact layouts selected in the dropdowns
- Use the exact text content as edited
- Display layout type as a badge on each generated card
- Never show a different layout than what was selected

### AC6: Data Persistence
**Given** I have edited an outline  
**When** the outline is sent to the generation API  
**Then** the request should include:
```json
{
  "cards": [
    {
      "id": "card-1",
      "content": "Title of Card\n• Point 1\n• Point 2",
      "layout": "bullets"
    }
  ]
}
```

---

## Technical Requirements

### Frontend
- Content editable div or textarea for inline text editing
- Standard HTML select dropdown for layout selection
- No complex routing logic needed
- No container mapping required
- No need to detect content type (user explicitly selects)

### Backend
- API endpoint: `POST /api/presentation/generate-outline`
  - Input: topic string, card count
  - Output: Array of { content: string, layout: string }
- API endpoint: `POST /api/presentation/generate-from-outline`
  - Input: Array of { id, content, layout }
  - Output: HTML for each card with specified layout

### Layout Rendering
Each layout type maps to exactly one rendering template:
- `title` → Center-aligned title template
- `bullets` → Title + bullet list template
- `two-column` → Split bullets into two columns
- `image-text` → Image placeholder + text template
- etc.

---

## Definition of Done
- [ ] User can generate an outline from a topic
- [ ] User can edit all text content inline
- [ ] User can select layout for each card via dropdown
- [ ] Selected layouts are used exactly as specified in final generation
- [ ] No layout mismatches between selection and output
- [ ] Works on Chrome, Firefox, Safari, Edge
- [ ] Mobile responsive (tablets and above)
- [ ] Accessibility: keyboard navigation, screen reader compatible

## Out of Scope
- Drag-and-drop card reordering (future story)
- Rich text editing (bold, italic, etc.)
- Image upload/selection
- Saving drafts
- Collaborative editing

## Test Cases

### Test 1: Layout Persistence
1. Generate outline for "AI Benefits"
2. Change card 2 from "bullets" to "two-column"
3. Generate presentation
4. **Verify:** Card 2 renders as two-column layout

### Test 2: Content Editing
1. Generate outline
2. Edit card 1 text to "New Title\n• New Point"
3. Generate presentation
4. **Verify:** Card 1 shows "New Title" and "New Point"

### Test 3: No Auto-Detection
1. Create card with bullet points
2. Select "title" layout
3. Generate presentation
4. **Verify:** Card renders as title slide (not bullets), even though content has bullet points