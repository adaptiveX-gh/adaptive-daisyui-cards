# 🎯 Adaptive DaisyUI Cards - Complete Package for Claude Code

## 📦 What You Get

Three comprehensive documents for building adaptive, self-scaling daisyUI cards:

1. **adaptive-cards-prototype-spec.md** - Full 10-prompt specification (most detailed)
2. **quick-start-prompt.md** - Single prompt to get started immediately
3. **visual-layout-reference.md** - Visual diagrams of all layouts and breakpoints

---

## ⚡ Start Here - Copy This to Claude Code

```
Build an adaptive DaisyUI card system where cards scale content based on 
their container size (not viewport) using CSS Container Queries.

TECH STACK:
- Tailwind CSS v3.4+ with @tailwindcss/container-queries
- DaisyUI v4+
- Vanilla JS (or React)

CORE FEATURES:
1. 5 layout types: sidebar, feature, masonry, dashboard, split
2. Container breakpoints: 250px, 400px, 600px, 800px
3. Fluid typography with clamp() and container query units (cqw)
4. Dynamic aspect ratios that change with container size
5. Interactive demo with resizable container

KEY IMPLEMENTATION:
- Use container-type: inline-size for cards
- Scale text: font-size: clamp(1rem, 2.5cqw, 1.125rem)
- Scale spacing: gap: clamp(0.5rem, 2cqw, 2rem)
- Layouts reshape at breakpoints using @container queries
- All spacing/typography proportional to container size

DEMO MUST HAVE:
- Drag-to-resize container (200px - 1200px)
- Real-time dimension display
- Layout type switcher
- DaisyUI theme switcher
- Example cards: product, blog, dashboard, profile, gallery

Start with project setup, then build base adaptive-card class, 
then implement layouts one by one, finally create interactive demo.
```

---

## 🎨 Layout Quick Reference

### 1. Sidebar Layout
- **Large**: Image (30%) | Content (70%) - side by side
- **Small**: Image top, content bottom - stacked

### 2. Feature Layout
- **Large**: Header + 3-column grid
- **Medium**: Header + 2-column grid
- **Small**: Vertical stack

### 3. Masonry Layout
- **Large**: 3 columns
- **Medium**: 2 columns
- **Small**: 1 column

### 4. Dashboard Layout
- **Large**: Header + Sidebar + Main (2x2 grid) + Footer
- **Medium**: Header + Main (2-col) + Footer
- **Small**: Vertical stack

### 5. Split Layout
- **Large**: 50/50 horizontal
- **Medium**: 60/40 horizontal
- **Small**: Vertical stack

---

## 📐 Breakpoint System

```
< 250px     Extra Small   Minimal content
250-399px   Small         Compact layout
400-599px   Medium        Balanced layout
600-799px   Large         Expanded layout
800px+      Extra Large   Full-featured
```

---

## 💡 Key Code Patterns

### Container Query Setup
```css
.card-container {
  container-type: inline-size;
  container-name: card;
}

@container card (min-width: 400px) {
  .adaptive-card {
    grid-template-columns: 1fr 2fr;
  }
}
```

### Scalable Typography
```css
.adaptive-text-base {
  font-size: clamp(1rem, 2.5cqw, 1.125rem);
}
```

### Scalable Spacing
```css
.adaptive-card {
  padding: clamp(0.75rem, 3cqw, 2.5rem);
  gap: clamp(0.5rem, 2cqw, 2rem);
}
```

---

## ✅ Testing Checklist

After building, verify:
- [ ] Card scales smoothly from 200px to 1200px container
- [ ] Layouts change at correct breakpoints
- [ ] Text, images, spacing scale proportionally
- [ ] All 5 layouts work at all sizes
- [ ] Transitions are smooth (300ms)
- [ ] DaisyUI themes apply correctly
- [ ] No layout shift or performance issues

---

## 🚀 Step-by-Step Build Order

### Phase 1: Foundation (Prompts 1-2)
1. Set up project with Tailwind, daisyUI, container queries
2. Create base `.adaptive-card` class with container query context
3. Implement scalable typography system

### Phase 2: Layouts (Prompt 3)
4. Build sidebar layout (simplest)
5. Build feature layout
6. Build masonry layout
7. Build dashboard layout
8. Build split layout

### Phase 3: Demo (Prompts 4-5)
9. Create resizable container with drag handles
10. Add dimension display and layout switcher
11. Build example cards (product, blog, dashboard, profile, gallery)
12. Add theme switcher

### Phase 4: Polish (Prompts 6-10)
13. Add transitions and animations
14. Implement JavaScript API
15. Add accessibility features
16. Optimize performance
17. Write documentation

---

## 🎯 Success Criteria

Your prototype is successful when:
1. ✅ You can drag a container and watch card adapt smoothly
2. ✅ Content scales proportionally (not just width changes)
3. ✅ Layouts reshape at exact breakpoints
4. ✅ All 5 layouts work in all container sizes
5. ✅ Demo is interactive and demonstrates all features
6. ✅ Works with all daisyUI themes
7. ✅ Performance is smooth (60fps)

---

## 📚 Document Navigation

**For Quick Start:**
Use `quick-start-prompt.md` - Single prompt to get building

**For Full Specification:**
Use `adaptive-cards-prototype-spec.md` - 10 detailed prompts covering everything

**For Visual Reference:**
Use `visual-layout-reference.md` - ASCII diagrams of all layouts at all breakpoints

**For Claude Code:**
Start with the "Start Here" prompt above, then work through phases 1-4

---

## 💬 Follow-Up Prompts

After initial setup:
> "Implement the base adaptive-card class with container queries and 
> scalable typography for all 5 breakpoints"

After base card:
> "Create the sidebar layout with responsive breakpoints"

After first layout:
> "Build the interactive demo page with resizable container"

For each additional layout:
> "Add the [feature/masonry/dashboard/split] layout variant"

For polish:
> "Add smooth transitions, accessibility, and theme support"

---

## 🔧 Troubleshooting

**Container queries not working?**
- Ensure @tailwindcss/container-queries plugin installed
- Verify container-type: inline-size on parent
- Check browser support (Chrome 105+, Safari 16+)

**Scaling not smooth?**
- Use clamp() with cqw units, not fixed breakpoints
- Ensure all spacing uses proportional units
- Test at intermediate sizes (e.g., 325px, 525px)

**Layouts not changing?**
- Check @container breakpoints match spec
- Verify container-name is set correctly
- Test with browser dev tools' container query inspector

---

## 🎁 Bonus Features (If Time Permits)

- React/Vue component wrappers
- Visual layout builder tool
- Animation library integration (Framer Motion)
- More layout types (carousel, timeline)
- Storybook integration
- npm package

---

## 📝 Notes for Claude Code

- Prioritize working prototype over perfect code
- Test each layout at multiple container sizes before moving on
- Use browser dev tools to debug container queries
- Keep daisyUI's original card styling intact (extend, don't replace)
- Comment breakpoint logic clearly
- Make demo interactive and fun to use!

---

**Ready to build?** Share the "Start Here" prompt with Claude Code and begin! 🚀
