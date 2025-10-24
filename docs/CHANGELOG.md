# Changelog

All notable changes to the Adaptive DaisyUI Card System.

## [2.0.0] - 2025-10-23 - Architecture Refactor

### Major Changes

#### Complete Separation of Layout and Theme
- **BREAKING**: Restructured entire CSS architecture
- Layout (structure) and theme (appearance) are now completely independent
- 36 unique combinations: 6 layouts × 6 theme options

#### New File Structure
```
src/styles/
├── adaptive-cards.css   # Layout ONLY (structure, sizing, positioning)
└── card-themes.css      # Theme ONLY (colors, backgrounds, effects)
```

### Added

#### New Layout (6th)
- **Hero Split Layout** (`.layout-hero-split`)
  - Content 40% | Image 60% side-by-side
  - Perfect for landing pages and CTAs
  - Responsive container query breakpoints

#### New Themes (5 Custom Themes)
1. **Dark Gradient** (`.theme-dark-gradient`)
   - Dark gradient using DaisyUI variables
   - Bold typography, high contrast

2. **Light Elegant** (`.theme-light-elegant`)
   - Clean light design with subtle borders
   - Professional appearance

3. **Neon Accent** (`.theme-neon-accent`)
   - Cyan-purple neon overlays
   - Gradient text and glow effects

4. **Minimal** (`.theme-minimal`)
   - Ultra-clean with borders only
   - Transparent backgrounds

5. **Brand** (`.theme-brand`)
   - Custom brand colors (pink/purple)
   - Glassmorphism effects

#### New Controls
- Three independent switchers:
  1. Layout switcher (6 layouts)
  2. Custom theme switcher (5 themes + none)
  3. DaisyUI base theme switcher (29 themes)

#### New JavaScript Functions
- `switchCustomTheme(themeName)` - Switch custom theme
- `switchDaisyUITheme(themeName)` - Switch DaisyUI base theme
- `switchLayout(layoutType)` - Updated to use new class names

### Changed

#### Class Name Updates
- **BREAKING**: All layout classes renamed
  - `sidebar-layout` → `layout-sidebar`
  - `feature-layout` → `layout-feature`
  - `masonry-layout` → `layout-masonry`
  - `dashboard-layout` → `layout-dashboard`
  - `split-layout` → `layout-split`

- **BREAKING**: Must add `adaptive-card` base class
  ```html
  <!-- Old -->
  <div class="sidebar-layout">

  <!-- New -->
  <div class="adaptive-card layout-sidebar">
  ```

#### HTML Structure
- Control panel now has three separate sections
- Header updated to reflect 6 layouts and 5 themes
- All layout cards updated with new class structure

#### JavaScript
- State management split: `currentCustomTheme` and `currentDaisyUITheme`
- DOM elements updated with new selector IDs
- Event listeners for three independent controls
- localStorage keys separated for each preference

#### CSS Architecture
- **adaptive-cards.css**: Only structure, sizing, positioning
  - No colors, backgrounds, or visual effects
  - Pure layout properties

- **card-themes.css**: Only appearance
  - No sizing, positioning, or structure
  - Pure visual styling

### Improved

#### Documentation
- Complete README rewrite with architecture guide
- Custom theme creation guide with templates
- Custom layout creation guide with templates
- Migration guide from v1 to v2
- Comprehensive examples and best practices

#### Accessibility
- Better ARIA labels for all three controls
- Screen reader announcements for theme changes
- Clear visual separation of control sections

#### Developer Experience
- Clear separation of concerns
- Easy to create custom themes without touching layouts
- Easy to create custom layouts without touching themes
- Mix and match any layout with any theme

### Fixed
- Theme persistence across page reloads
- Container query context applied correctly
- Smooth transitions between layout and theme changes

### Performance
- No impact on performance
- Themes use CSS custom properties efficiently
- Layouts optimized with container queries

## [1.0.0] - Initial Release

### Added
- 5 responsive layout patterns
- CSS Container Queries
- DaisyUI theme integration
- Interactive demo with resizable container
- Scalable typography and spacing
- Accessibility features
- 29 DaisyUI themes support

### Features
- Sidebar, Feature, Masonry, Dashboard, Split layouts
- Container query breakpoints: 250px, 400px, 600px, 800px
- Real-time width display
- Preset width buttons
- Keyboard navigation
- 60fps performance target

---

## Migration from v1 to v2

### Required Changes

1. **Update class names on all layout containers:**
   ```html
   <!-- v1 -->
   <div class="sidebar-layout">

   <!-- v2 -->
   <div class="adaptive-card layout-sidebar">
   ```

2. **Add optional custom theme:**
   ```html
   <!-- v2 with custom theme -->
   <div class="adaptive-card layout-sidebar theme-dark-gradient">
   ```

3. **Update HTML controls** (if using custom demo):
   - Rename selector IDs
   - Add custom theme selector
   - Update DaisyUI theme selector ID

4. **Update JavaScript** (if custom implementation):
   - Replace `changeTheme()` with `switchDaisyUITheme()`
   - Add `switchCustomTheme()` for custom themes
   - Update state management

5. **Rebuild CSS:**
   ```bash
   npm run build
   ```

### Optional Enhancements

- Explore the new Hero Split layout
- Try custom theme combinations
- Create your own custom theme
- Leverage the three-layer theming system

### Breaking Changes Summary

| Change | v1 | v2 |
|--------|----|----|
| Base class | Not required | `adaptive-card` required |
| Layout classes | `sidebar-layout` | `layout-sidebar` |
| Theme function | `changeTheme()` | `switchDaisyUITheme()` |
| Custom themes | Not available | 5 themes + custom |
| Controls | 2 controls | 3 independent controls |

---

For detailed upgrade instructions, see the [Migration Guide](README.md#migration-guide) in the README.
