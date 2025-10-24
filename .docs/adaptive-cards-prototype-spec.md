# Adaptive DaisyUI Cards Prototype - Development Spec

## Project Overview
Build a prototype demonstrating self-scaling, adaptive daisyUI cards with dynamic grid layouts that respond to their container size (not viewport). Cards should scale content proportionally and reshape when containers become too small.

---

## Prompt 1: Project Setup

Create a new web project with the following structure:

**Tech Stack:**
- HTML/CSS/JavaScript (vanilla or your choice of framework)
- Tailwind CSS v3.4+
- DaisyUI v4+
- Modern CSS Container Queries

**Project Structure:**
```
/adaptive-cards-prototype
  /src
    index.html
    styles.css
    adaptive-cards.css
    demo.js
  /examples
    dashboard.html
    gallery.html
  tailwind.config.js
  package.json
```

**Initial Setup Requirements:**
1. Configure Tailwind with daisyUI plugin
2. Enable container queries in Tailwind config
3. Include multiple daisyUI themes for testing
4. Set up a live development server

---

## Prompt 2: Core Card System Specifications

### 2.1 Base Adaptive Card Component

Create a base `.adaptive-card` class that extends daisyUI's `.card`:

**Features:**
- Self-contained container query context
- Fluid typography using `clamp()` and container query units (`cqw`, `cqh`)
- Dynamic padding that scales with container size
- Aspect ratio that changes based on container width

**Container Query Breakpoints:**
- `extra-small`: < 250px (vertical stack, minimal content)
- `small`: 250px - 399px (compact layout)
- `medium`: 400px - 599px (balanced layout)
- `large`: 600px - 799px (expanded layout)
- `extra-large`: 800px+ (full-featured layout)

**Scaling Requirements:**
- Text sizes scale proportionally using `clamp()`
- Images scale while maintaining aspect ratios
- Spacing (padding, gaps) scales with container
- Icons/buttons adjust size appropriately

---

## Prompt 3: Dynamic Grid Layouts

### 3.1 Grid Layout System

Create multiple layout variants that can be applied to adaptive cards:

**Layout Types to Implement:**

1. **`layout-sidebar`**
   - Large: Image left (30%), content right (70%)
   - Medium: Image left (40%), content right (60%)
   - Small: Image top, content bottom (stacked)

2. **`layout-feature`**
   - Large: Header spanning full width, 3-column grid below
   - Medium: Header full width, 2-column grid below
   - Small: Single column stack

3. **`layout-masonry`**
   - Large: 3-column masonry grid
   - Medium: 2-column masonry grid
   - Small: Single column

4. **`layout-dashboard`**
   - Large: Complex grid with header, sidebar, main area, footer
   - Medium: Header, main area (2-col), footer
   - Small: Vertical stack

5. **`layout-split`**
   - Large: 50/50 split horizontal
   - Medium: 60/40 split
   - Small: Vertical stack

### 3.2 Grid Implementation Details

- Use CSS Grid with `grid-template-areas` for named regions
- Each layout should have clear breakpoint definitions
- Grid gaps should scale with container size: `gap: clamp(0.5rem, 2cqw, 2rem)`
- Support nested grids within grid areas

---

## Prompt 4: Content Scaling System

### 4.1 Typography Scaling

Create CSS custom properties and classes for scalable typography:

**Font Size Classes:**
```css
.adaptive-text-xs   { font-size: clamp(0.75rem, 1.5cqw, 0.875rem); }
.adaptive-text-sm   { font-size: clamp(0.875rem, 2cqw, 1rem); }
.adaptive-text-base { font-size: clamp(1rem, 2.5cqw, 1.125rem); }
.adaptive-text-lg   { font-size: clamp(1.125rem, 3cqw, 1.5rem); }
.adaptive-text-xl   { font-size: clamp(1.25rem, 4cqw, 2rem); }
.adaptive-text-2xl  { font-size: clamp(1.5rem, 5cqw, 2.5rem); }
```

### 4.2 Element Scaling

- **Images**: Should use `object-fit: cover` and scale to container
- **Icons**: Scale from 16px → 32px based on container size
- **Buttons**: Scale padding and font-size proportionally
- **Spacing**: Use `clamp()` for margins and padding

### 4.3 Aspect Ratio Changes

Define aspect ratio shifts:
- Extra-large containers: `16/9` or `21/9`
- Medium containers: `4/3` or `16/9`
- Small containers: `3/4` or `1/1` (portrait or square)

---

## Prompt 5: Demo Page Requirements

### 5.1 Main Demo Page (index.html)

Create a comprehensive demo showing:

1. **Resizable Container Playground**
   - Drag handles to resize container
   - Real-time display of container dimensions
   - Toggle between different layouts
   - Switch between daisyUI themes

2. **Layout Showcase Grid**
   - Display all 5 layout types side by side
   - Each in a different sized container
   - Show how each adapts

3. **Interactive Examples:**
   - Product card (e-commerce)
   - Blog post card
   - Dashboard widget card
   - Profile card
   - Media gallery card

### 5.2 Dashboard Example (dashboard.html)

Create a dashboard with:
- Grid of cards in various sizes
- Cards adapt to their grid cell size
- Responsive dashboard layout
- Mix of different card types

### 5.3 Gallery Example (gallery.html)

Create a gallery with:
- Masonry layout of adaptive cards
- Cards with varying content (images, text, mixed)
- Filter/sort functionality
- Lazy loading demonstration

---

## Prompt 6: Advanced Features

### 6.1 JavaScript API

Create a simple JS API for dynamic card manipulation:

```javascript
// Example API
const card = new AdaptiveCard({
  container: '#card-1',
  layout: 'sidebar',
  theme: 'light',
  minWidth: 250,
  transitions: true
});

card.setLayout('feature');
card.toggleTheme();
card.resize(600);
```

### 6.2 Transitions and Animations

- Smooth transitions when layout changes (300ms ease)
- Fade in/out for content that appears/disappears
- Scale animations for hovering
- Respect `prefers-reduced-motion`

### 6.3 Accessibility

- Proper ARIA labels for dynamic content
- Keyboard navigation support
- Focus management when layouts change
- High contrast mode compatibility

---

## Prompt 7: Configuration System

### 7.1 Tailwind Config Extensions

Create custom Tailwind plugins for:

```javascript
// tailwind.config.js additions
module.exports = {
  theme: {
    extend: {
      containers: {
        'card-xs': '250px',
        'card-sm': '400px',
        'card-md': '600px',
        'card-lg': '800px',
      }
    }
  },
  plugins: [
    require('daisyui'),
    require('@tailwindcss/container-queries'),
    // Custom adaptive card plugin
  ]
}
```

### 7.2 CSS Custom Properties

Define CSS variables for easy customization:

```css
:root {
  --card-scale-factor: 1;
  --card-min-width: 250px;
  --card-max-width: 1200px;
  --card-transition-speed: 300ms;
  --card-gap-min: 0.5rem;
  --card-gap-max: 2rem;
}
```

---

## Prompt 8: Testing & Documentation

### 8.1 Testing Scenarios

Create test cases for:
1. Card in container from 200px → 1000px width
2. Rapid layout switching
3. Theme changes
4. Nested cards
5. Mobile device simulation
6. Print layouts

### 8.2 Documentation

Create README.md with:
- Quick start guide
- Layout type documentation
- Customization guide
- Browser compatibility notes
- Performance considerations
- Common patterns and recipes

### 8.3 Code Comments

- Document all container query breakpoints
- Explain scaling calculations
- Note browser compatibility considerations
- Provide usage examples in comments

---

## Prompt 9: Performance Optimization

### 9.1 Requirements

- Use CSS containment where appropriate
- Lazy load images in cards
- Debounce resize events
- Minimize layout thrashing
- Use `will-change` sparingly

### 9.2 Metrics to Track

- Layout shift (CLS)
- First contentful paint
- Time to interactive
- Memory usage with many cards

---

## Prompt 10: Polish and Deploy

### 10.1 Final Requirements

- Cross-browser testing (Chrome, Firefox, Safari, Edge)
- Mobile responsiveness
- Touch gesture support
- Dark mode support
- Print stylesheet
- Production build optimization

### 10.2 Deliverables

1. Working prototype with all features
2. Documentation
3. Example implementations
4. Code comments and inline documentation
5. Package for npm/cdn distribution (optional)

---

## Success Criteria

The prototype is successful if:
- ✅ Cards scale content proportionally within their container
- ✅ Layouts reshape appropriately at defined breakpoints
- ✅ All 5 layout types work correctly
- ✅ Typography scales smoothly using container queries
- ✅ Demo page is interactive and demonstrates all features
- ✅ Code is well-documented and reusable
- ✅ Performance is smooth (60fps) with multiple cards
- ✅ Accessible and follows web standards

---

## Optional Enhancements

If time permits, add:
- Animation library integration (Framer Motion, GSAP)
- More layout types (carousel, timeline, comparison)
- Export/save card configurations
- Visual layout builder tool
- React/Vue/Svelte component wrappers
- Storybook integration

---

## Getting Started Command

Once you receive this spec, start with:

"Please create the project structure and initial setup for the Adaptive DaisyUI Cards prototype according to Prompt 1. Set up Tailwind CSS, daisyUI, and container queries support."

Then proceed through each prompt sequentially, testing after each major feature implementation.
