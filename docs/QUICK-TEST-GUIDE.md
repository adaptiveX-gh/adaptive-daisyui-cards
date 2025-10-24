# Quick Test Guide

## Installation (One-Time Setup)

```bash
npm install
npx playwright install
```

## Running Tests

### Most Common Commands

```bash
# Run ALL tests (unit + e2e)
npm run test:ci

# Run unit tests with live reload
npm test

# Run e2e tests with browser UI
npm run test:e2e:ui

# Run specific test category
npm run test:visual        # Visual regression
npm run test:a11y          # Accessibility
npm run test:performance   # Performance
npm run test:container     # Container queries
```

### Development Workflow

```bash
# 1. Start dev server
npm run dev

# 2. In another terminal, run tests in UI mode
npm run test:e2e:ui

# 3. Watch unit tests
npm test
```

## Test Categories

| Command | What It Tests | Duration |
|---------|--------------|----------|
| `npm test` | Unit tests (utils, calculations) | 3s |
| `npm run test:e2e` | All E2E tests | 45s |
| `npm run test:visual` | Screenshots at all sizes | 30s |
| `npm run test:a11y` | Accessibility (WCAG AA) | 25s |
| `npm run test:performance` | FPS, CLS, FCP, TTI | 40s |
| `npm run test:container` | Container queries work | 20s |

## Quick Validation Checklist

Before committing:
```bash
# 1. Run all tests
npm run test:ci

# 2. Check coverage
npm run test:coverage

# 3. View report
npm run test:report
```

## Debugging Failed Tests

```bash
# Run specific test file
npx playwright test tests/e2e/container-queries.spec.js

# Run with headed browser (see what's happening)
npm run test:e2e:headed

# Debug mode (pause on each step)
npm run test:debug

# Update snapshots (if visual changed intentionally)
npx playwright test --update-snapshots
```

## CI/CD Status

Tests run automatically on:
- Push to `main` or `develop`
- Pull requests

Check status: GitHub Actions tab

## Coverage Goals

| Category | Target | Current |
|----------|--------|---------|
| Overall | 80% | 85.7% ✓ |
| Container Queries | 95% | 100% ✓ |
| Layouts | 90% | 95% ✓ |
| Accessibility | 85% | 92% ✓ |

## Quick Troubleshooting

### "Cannot find module"
```bash
npm install
```

### "Browser not found"
```bash
npx playwright install
```

### "Port 5173 already in use"
```bash
# Kill existing process or change port in vite.config.js
```

### Tests failing after code change
```bash
# Check if it's a visual change
npx playwright test --update-snapshots

# Or revert and investigate
```

## Test Files Location

```
tests/
├── e2e/
│   ├── visual-regression.spec.js    # 42 tests
│   ├── container-queries.spec.js    # 10 tests
│   ├── typography-scaling.spec.js   # 11 tests
│   ├── layout-transformation.spec.js # 24 tests
│   ├── interactive-demo.spec.js     # 28 tests
│   ├── performance.spec.js          # 14 tests
│   ├── accessibility.spec.js        # 22 tests
│   └── fixtures.js                  # Test helpers
├── unit/
│   └── card-utils.test.js           # 35 tests
└── setup.js                         # Test configuration
```

## Need More Help?

- Full docs: `TESTING.md`
- Test summary: `TEST-SUMMARY.md`
- Issues: Check GitHub Actions logs
