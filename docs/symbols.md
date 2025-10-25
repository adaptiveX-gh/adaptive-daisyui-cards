# User Story: Shared Headers and Footers for Cards

## User Story
**As a** presentation creator  
**I want to** add consistent headers and footers across all cards that update globally when edited  
**So that** I can maintain brand consistency and easily update common elements like copyright text or navigation across my entire presentation

## Business Value
- Ensures brand consistency across all presentation cards
- Saves time by updating all cards at once (1 edit vs N edits)
- Reduces errors from inconsistent manual updates
- Provides professional appearance with uniform headers/footers
- Enables quick theme/branding changes across entire presentations

---

## Acceptance Criteria

### AC1: Toggle Headers and Footers
**Given** I am viewing my presentation cards  
**When** I toggle the "Show Headers" or "Show Footers" switch  
**Then** headers/footers should immediately appear or disappear on ALL cards simultaneously

### AC2: Shared Symbol Behavior
**Given** headers and footers are enabled  
**When** I edit the header or footer content  
**Then** the changes should be reflected across ALL cards immediately  
**And** there should be no need to update each card individually

### AC3: Default Header Component
**Given** I enable headers on my cards  
**Then** each card should display a navbar containing:
- Title/Text (left aligned)
- Small Image (right aligned)
- Customizable colored background

**Component structure:**
```html
<div class="navbar bg-base-100">
  <div class="navbar-start">
    <a class="btn btn-ghost text-xl">{Text Name}</a>
  </div>
  <div class="navbar-center">
    <ul class="menu menu-horizontal">
      <li><a>{Menu Item}</a></li>
    </ul>
  </div>
  <div class="navbar-end">
    <button class="btn btn-primary btn-sm">{CTA Text}</button>
  </div>
</div>
```

### AC4: Default Footer Component
**Given** I enable footers on my cards  
**Then** each card should display a footer containing:
- Small image (left)
- Copyright text (centered)
- Card count (right)

**Component structure:**
```html
<footer class="footer footer-center p-4 bg-base-100 text-base-content">
  <div>
    <p>{Copyright Text}</p>
  </div>
</footer>
```

### AC5: Edit Mode
**Given** I am in edit mode  
**When** I click on any header or footer  
**Then** an edit dialog should open with fields to modify:

**For Header:**
- Title
- Small image

**For Footer:**
- Small image
- Copyright text

### AC6: Theme Integration
**Given** headers and footers are displayed  
**When** I change the presentation theme  
**Then** headers and footers should automatically adapt to the new theme colors using DaisyUI classes including any background colors

### AC7: Card Layout Preservation
**Given** cards have headers and/or footers enabled  
**When** displaying content  
**Then** the card structure should be:
```
┌─────────────────┐
│     Header      │ ← Fixed height, optional
├─────────────────┤
│                 │
│  Card Content   │ ← Scrollable if needed
│                 │
├─────────────────┤
│     Footer      │ ← Fixed height, optional
└─────────────────┘
```

### AC8: Data Structure
**Given** I save a presentation with headers/footers  
**When** the data is stored  
**Then** it should follow this structure:
```json
{
  "presentation": {
    "showHeaders": true,
    "showFooters": true,
    "sharedComponents": {
      "header": {
        "titleName": "AI Presentation",
        "image": "URL"
      },
      "footer": {
        "image": "URL",
        "copyrightText": "© 2025 ACME Industries Ltd",
        "cardCount": ...
      }
    },
    "cards": [...]
  }
}
```

---

## Technical Requirements

### Frontend Implementation
1. **Symbol System**: Create a centralized component management system
2. **State Management**: Single source of truth for header/footer content
3. **Event System**: Changes trigger updates to all card instances
4. **Persistence**: Save header/footer state with presentation data

### Component Architecture
```javascript
class SharedComponentManager {
  constructor() {
    this.symbols = {
      header: { /* header config */ },
      footer: { /* footer config */ }
    };
  }
  
  updateSymbol(type, newContent) {
    this.symbols[type] = newContent;
    this.renderAllInstances(type);
  }
  
  renderAllInstances(type) {
    document.querySelectorAll(`.shared-${type}-container`)
      .forEach(container => {
        container.innerHTML = this.renderSymbol(type);
      });
  }
}
```

### CSS Requirements
- Headers/footers must not affect card content layout
- Content area should be scrollable independently
- Components must be responsive
- Theme variables must be used for colors

---

## Definition of Done
- [ ] Headers can be toggled on/off for all cards
- [ ] Footers can be toggled on/off for all cards
- [ ] Editing header updates all cards immediately
- [ ] Editing footer updates all cards immediately
- [ ] Changes persist when saving presentation
- [ ] Components adapt to theme changes
- [ ] Card content scrolls independently of header/footer
- [ ] Works on all major browsers
- [ ] Mobile responsive (tablet and above)
- [ ] Keyboard accessible
- [ ] Unit tests for symbol update logic
- [ ] Integration tests for edit/save flow

## Test Cases

### Test 1: Global Update
1. Enable headers on 5 cards
2. Edit header brand name to "New Brand"
3. **Verify**: All 5 cards show "New Brand" immediately

### Test 2: Toggle Persistence
1. Enable headers and footers
2. Refresh page
3. **Verify**: Headers and footers remain enabled

### Test 3: Theme Adaptation
1. Enable headers with theme "light"
2. Switch to theme "dark"
3. **Verify**: Header colors update to dark theme

### Test 4: Content Independence
1. Add header and footer to a card
2. Add content that exceeds card height
3. **Verify**: Content scrolls, header/footer remain fixed

## Out of Scope
- Individual card header/footer overrides (all are shared)
- Multiple header/footer templates
- Rich text editing in headers/footers
- Custom HTML in headers/footers
- Header/footer animations

## Dependencies
- DaisyUI components library
- Theme system implementation
- Card rendering system

## Notes
- This feature implements a "symbol" pattern similar to design tools
- Consider future enhancement: header/footer templates library
- Consider future enhancement: per-slide header/footer overrides