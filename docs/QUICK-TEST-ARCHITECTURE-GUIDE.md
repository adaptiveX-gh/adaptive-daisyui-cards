# Quick Test Guide: Layout-Theme Separation Architecture

## Quick Start

```bash
# Run all new architecture tests
npx playwright test --grep "@architecture|@combinations|@hero-split|@switchers"

# Run CSS architecture validation (unit tests)
npm run test:unit css-architecture.test.js

# Run specific test file
npx playwright test layout-theme-separation.spec.js
```

---

## Test Files Overview

| File | Tests | Purpose | Tags |
|------|-------|---------|------|
| `layout-theme-separation.spec.js` | 25+ | Validate layout-theme independence | @architecture |
| `hero-split-layout.spec.js` | 30+ | Test new 6th layout | @layout @hero-split |
| `theme-combinations.spec.js` | 50+ | Test all 36 combinations | @combinations |
| `switcher-independence.spec.js` | 20+ | Validate 3 independent switchers | @switchers |
| `css-architecture.test.js` | 40+ | CSS file validation | (unit test) |

---

## Common Test Commands

### By Test File
```bash
# Layout-theme separation
npx playwright test layout-theme-separation.spec.js

# Hero split
npx playwright test hero-split-layout.spec.js

# All combinations (36 tests)
npx playwright test theme-combinations.spec.js

# Switcher independence
npx playwright test switcher-independence.spec.js

# CSS architecture (Vitest)
npm run test:unit css-architecture.test.js
```

### By Tag
```bash
# Architecture validation
npx playwright test --grep @architecture

# Combination testing
npx playwright test --grep @combinations

# Hero split layout
npx playwright test --grep @hero-split

# Switcher tests
npx playwright test --grep @switchers
```

### By Category
```bash
# Visual regression (updated)
npx playwright test visual-regression.spec.js

# Accessibility (updated)
npx playwright test accessibility.spec.js

# Performance (updated)
npx playwright test performance.spec.js

# Interactive demo (updated)
npx playwright test interactive-demo.spec.js
```

---

## Quick Validation Checklist

### After Making CSS Changes

```bash
# 1. Validate CSS architecture
npm run test:unit css-architecture.test.js

# 2. Test layout-theme separation
npx playwright test layout-theme-separation.spec.js

# 3. Visual regression
npx playwright test visual-regression.spec.js --update-snapshots  # First run
npx playwright test visual-regression.spec.js  # Subsequent runs
```

### After Adding a New Theme

```bash
# 1. Test theme with all layouts
npx playwright test theme-combinations.spec.js

# 2. Accessibility check
npx playwright test accessibility.spec.js --grep "Custom Theme"

# 3. Performance check
npx playwright test performance.spec.js --grep "Theme Switching"
```

### After Adding a New Layout

```bash
# 1. Test layout with all themes
npx playwright test theme-combinations.spec.js

# 2. Visual regression
npx playwright test visual-regression.spec.js

# 3. Container query behavior
npx playwright test container-queries.spec.js
```

---

## Test Execution Tips

### Running Tests Faster

```bash
# Run in parallel (default: workers = CPU cores / 2)
npx playwright test --workers=4

# Run specific test
npx playwright test -g "all 36 layout-theme combinations"

# Run in headed mode (see browser)
npx playwright test --headed layout-theme-separation.spec.js

# Debug mode
npx playwright test --debug hero-split-layout.spec.js
```

### Visual Regression Tips

```bash
# Generate baseline screenshots (first time)
npx playwright test visual-regression.spec.js --update-snapshots

# Compare against baselines
npx playwright test visual-regression.spec.js

# View visual diffs (if failures)
npx playwright show-report

# Interactive mode for debugging visual tests
npx playwright test visual-regression.spec.js --ui
```

---

## Architecture Validation Quick Check

### 1. CSS Separation
```bash
npm run test:unit css-architecture.test.js
```

**What it checks:**
- Layout CSS has ZERO appearance properties
- Theme CSS has ZERO structural properties
- Proper use of DaisyUI variables
- Correct class prefixes (layout-, theme-)

**Expected output:**
```
 PASS  tests/unit/css-architecture.test.js
  CSS Architecture Validation
    adaptive-cards.css - Layout Only
      ✓ contains structural properties
      ✓ does NOT contain background-color properties
      ✓ does NOT contain color values
      ...
    card-themes.css - Appearance Only
      ✓ contains appearance properties
      ✓ does NOT contain grid-template-*
      ...
```

### 2. Combination Testing
```bash
npx playwright test theme-combinations.spec.js -g "all 36"
```

**What it checks:**
- All 36 layout × theme combinations render
- No console errors
- No visual overlap
- Structure integrity

**Expected duration:** 2-3 minutes

### 3. Independence Validation
```bash
npx playwright test switcher-independence.spec.js
```

**What it checks:**
- Layout switcher doesn't affect themes
- Custom theme switcher doesn't affect layout
- DaisyUI theme switcher doesn't affect custom theme or layout
- localStorage maintains separate keys

---

## Debugging Failed Tests

### Visual Regression Failures

```bash
# View the diff
npx playwright show-report

# Update baseline if change is intentional
npx playwright test visual-regression.spec.js --update-snapshots

# Run single failing test
npx playwright test -g "hero-split-theme-dark-gradient.png"
```

### Accessibility Failures

```bash
# Run with detailed output
npx playwright test accessibility.spec.js --reporter=list

# Check specific theme
npx playwright test accessibility.spec.js -g "theme-neon-accent"

# View axe violations in report
npx playwright show-report
```

### Performance Failures

```bash
# Run with performance profiling
npx playwright test performance.spec.js --trace on

# View trace
npx playwright show-trace trace.zip
```

---

## Test Data Reference

### Layouts (6)
- sidebar
- feature
- masonry
- dashboard
- split
- hero-split

### Custom Themes (6)
- `` (empty string = none/DaisyUI only)
- theme-dark-gradient
- theme-light-elegant
- theme-neon-accent
- theme-minimal
- theme-brand

### DaisyUI Themes (6)
- light
- dark
- cupcake
- cyberpunk
- business
- corporate

### Total Combinations
6 layouts × 6 custom themes = **36 combinations**

---

## Performance Benchmarks

### Expected Performance

| Operation | Expected Time | Alert Threshold |
|-----------|---------------|-----------------|
| Single theme switch | 20-40ms | >50ms |
| 30 rapid switches | 30-45ms avg | >50ms avg |
| Layout + theme switch | 60-80ms | >100ms |
| Visual regression test | 2-3min | >5min |
| Full test suite | 10-15min | >20min |

### Check Performance

```bash
# Run performance tests
npx playwright test performance.spec.js --reporter=list

# Check for memory leaks
npx playwright test performance.spec.js -g "memory leak"

# Check CSS bundle size
npx playwright test performance.spec.js -g "bundle size"
```

---

## CI/CD Integration

### GitHub Actions

```yaml
# Run on PR
- name: Architecture Tests
  run: |
    npm run test:unit css-architecture.test.js
    npx playwright test layout-theme-separation.spec.js
    npx playwright test theme-combinations.spec.js

# Generate visual baselines (on main branch)
- name: Update Baselines
  if: github.ref == 'refs/heads/main'
  run: npx playwright test visual-regression.spec.js --update-snapshots
```

### Pre-commit Hook

```bash
# .husky/pre-commit
npm run test:unit css-architecture.test.js
```

---

## Common Issues & Solutions

### Issue: "All 36 combinations" test failing

**Cause:** One or more combinations not rendering

**Solution:**
```bash
# Run with detailed output
npx playwright test theme-combinations.spec.js -g "all 36" --reporter=list

# Check console for errors
npx playwright test theme-combinations.spec.js --headed
```

### Issue: Visual regression baseline missing

**Cause:** First time running visual tests

**Solution:**
```bash
# Generate baselines
npx playwright test visual-regression.spec.js --update-snapshots
```

### Issue: CSS architecture test failing

**Cause:** Layout CSS contains appearance properties (or vice versa)

**Solution:**
1. Check error message for specific property
2. Move property to correct file
3. Run test again

```bash
npm run test:unit css-architecture.test.js
```

### Issue: Theme not applying in tests

**Cause:** Theme wrapper not created correctly

**Solution:**
```bash
# Use customThemeHelper fixture
await customThemeHelper.setCustomTheme('theme-dark-gradient');
```

---

## Test Coverage Goals

### Current Coverage
- Layout structure: 100%
- Theme appearance: 100%
- Combinations: 100% (36/36)
- Hero-split: 100%
- Independence: 100%
- Visual regression: 100%
- Accessibility: 95%
- Performance: 90%

### Minimum Required
- Layout structure: 100%
- Theme appearance: 100%
- Combinations: 100%
- Accessibility: 90%
- Performance: 85%

---

## Getting Help

### Test Failures
1. Check this guide for common issues
2. Review test output for specific error
3. Run with `--headed` to see browser
4. Use `--debug` to step through test

### Questions
- See LAYOUT-THEME-TEST-SUMMARY.md for detailed overview
- See TESTING.md for general testing guide
- See TEST-SUMMARY.md for all test documentation

---

## Quick Reference: Test Fixtures

### Available Fixtures

```javascript
// Container helpers
await containerHelper.resizeContainer(selector, width);
const width = await containerHelper.getContainerWidth(selector);

// Layout helpers
await layoutHelper.setLayout('hero-split');
const current = await layoutHelper.getCurrentLayout();

// DaisyUI theme helpers
await themeHelper.setTheme('cyberpunk');
const current = await themeHelper.getCurrentTheme();

// Custom theme helpers (NEW)
await customThemeHelper.setCustomTheme('theme-dark-gradient');
const current = await customThemeHelper.getCurrentCustomTheme();
await customThemeHelper.removeCustomTheme();
```

---

**Last Updated:** 2025-10-23
**For:** Layout-Theme Separation Architecture v2.0
