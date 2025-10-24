# Placeholder System Documentation

**Phase 2 Implementation | Version 0.2.0**

The placeholder system provides instant, beautiful placeholder images while real images are being generated.

## Features

- **Instant Generation**: <50ms response time
- **Deterministic**: Same input always produces same output
- **Theme-Aware**: Uses theme colors automatically
- **Three Pattern Types**: Geometric, pattern, and solid
- **SVG-Based**: Scalable, lightweight (2-10KB)
- **Data URLs**: Inline base64 for instant display

## Pattern Types

### 1. Geometric

Abstract shapes that create visually interesting backgrounds.

**Patterns:**
- **Triangles**: Scattered geometric triangles
- **Circles**: Overlapping circles with varying opacity
- **Polygons**: Random polygon mesh
- **Diagonal Stripes**: Angled stripe patterns

**Best For:**
- Modern, contemporary themes
- Professional presentations
- Technical content

**Example:**
```javascript
{
  "type": "geometric",
  "pattern": "triangles",
  "colors": ["#3b82f6", "#1e40af", "#60a5fa"],
  "aspectRatio": "16:9"
}
```

### 2. Pattern

Repeating geometric patterns for clean, structured backgrounds.

**Patterns:**
- **Dots**: Grid of circles
- **Lines**: Horizontal striping
- **Waves**: Sine wave patterns
- **Grid**: Intersection lines

**Best For:**
- Minimalist designs
- Data-focused content
- Clean aesthetics

**Example:**
```javascript
{
  "type": "pattern",
  "pattern": "dots",
  "spacing": 30,
  "aspectRatio": "16:9"
}
```

### 3. Solid

Gradient backgrounds with theme colors.

**Features:**
- Linear gradients
- Theme primary → secondary
- Subtle, non-distracting

**Best For:**
- Text-heavy slides
- Subtle backgrounds
- Maximum readability

**Example:**
```javascript
{
  "type": "solid",
  "gradient": "linear",
  "colors": ["#3b82f6", "#8b5cf6"],
  "aspectRatio": "16:9"
}
```

## How It Works

### 1. Selection Algorithm

Placeholders are selected deterministically based on content hash:

```javascript
const hash = simpleHash(contentPrompt);
const patternIndex = hash % 3;  // 0=geometric, 1=pattern, 2=solid
const patternType = patterns[patternIndex];
```

This ensures:
- Same content = same placeholder
- Variety across different content
- Predictable results

### 2. Color Extraction

Colors come from the theme:

```javascript
{
  primary: '#3b82f6',
  secondary: '#1e40af',
  accent: '#60a5fa',
  background: '#f3f4f6',
  text: '#1f2937'
}
```

### 3. SVG Generation

Generates inline SVG with theme colors:

```svg
<svg width="1600" height="900" viewBox="0 0 1600 900" xmlns="http://www.w3.org/2000/svg">
  <rect width="1600" height="900" fill="#f3f4f6" />
  <!-- Pattern elements with theme colors -->
</svg>
```

### 4. Data URL Encoding

Encodes SVG as base64 data URL:

```javascript
const encoded = Buffer.from(svg).toString('base64');
const dataUrl = `data:image/svg+xml;base64,${encoded}`;
```

## API Usage

### Automatic Selection

```javascript
import PlaceholderService from './services/PlaceholderService.js';

const service = new PlaceholderService();

const placeholder = service.selectPlaceholder(
  theme,              // Theme object with colors
  '16:9',            // Aspect ratio
  'AI technology'    // Content hint for selection
);

// Returns:
// {
//   type: 'geometric',
//   color: 'based-on-theme',
//   loadingState: true,
//   aspectRatio: '16:9',
//   svg: '<svg>...</svg>'
// }
```

### Manual Generation

```javascript
// Generate specific type
const geometric = service.generateGeometric({
  theme: myTheme,
  aspectRatio: '16:9',
  contentPrompt: 'AI technology'
});

const pattern = service.generatePattern({
  theme: myTheme,
  aspectRatio: '1:1'
});

const solid = service.generateSolid({
  theme: myTheme,
  aspectRatio: '4:3'
});
```

## Aspect Ratio Support

All standard presentation ratios:

| Ratio | Dimensions | Use Case |
|-------|-----------|----------|
| 16:9  | 1600x900  | Widescreen (default) |
| 1:1   | 1000x1000 | Square |
| 4:3   | 1200x900  | Standard |
| 9:16  | 900x1600  | Portrait |
| 3:4   | 900x1200  | Portrait standard |

## Theme Integration

### Default Themes

```javascript
const themes = {
  professional: {
    primary: '#3b82f6',
    secondary: '#1e40af',
    accent: '#60a5fa'
  },
  abstract: {
    primary: '#8b5cf6',
    secondary: '#ec4899',
    accent: '#f59e0b'
  },
  minimalist: {
    primary: '#64748b',
    secondary: '#334155',
    accent: '#94a3b8'
  }
};
```

### Custom Colors

```javascript
const placeholder = service.selectPlaceholder(
  {
    colors: {
      primary: '#ff0000',
      secondary: '#00ff00',
      accent: '#0000ff'
    }
  },
  '16:9',
  'custom content'
);
```

## Examples

### Example 1: Hero Card Placeholder

```javascript
const card = {
  type: 'hero',
  content: {
    title: 'AI in Product Discovery',
    subtitle: 'Transforming Ideas into Innovation'
  },
  theme: {
    name: 'professional',
    colors: {
      primary: '#3b82f6',
      secondary: '#1e40af'
    }
  }
};

const placeholder = service.selectPlaceholder(
  card.theme,
  '16:9',
  card.content.title
);

// Returns geometric pattern with blue tones
// Hash of "AI in Product Discovery" → Pattern type
// Theme colors used for shapes
```

### Example 2: Grid Layout Placeholder

```javascript
const placeholder = service.selectPlaceholder(
  {
    colors: {
      primary: '#10b981',
      secondary: '#059669'
    }
  },
  '4:3',
  'Process Overview'
);

// Returns pattern type (dots or grid)
// Green color scheme
// 4:3 aspect ratio
```

### Example 3: Instant Placeholder Response

```javascript
// Client request
POST /api/cards/generate-content
{
  "topic": "Marketing Trends",
  "layoutType": "hero",
  "generateImage": true,
  "imageProvider": "placeholder"
}

// Immediate response (<50ms)
{
  "card": {
    "image": {
      "status": "ready",
      "url": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwMCIg...",
      "provider": "placeholder",
      "placeholder": {
        "type": "geometric",
        "loadingState": false
      }
    }
  }
}
```

## Performance

- **Generation Time**: 10-50ms
- **Size**: 2-10KB (compressed SVG)
- **Encoding Time**: <10ms
- **Total**: <100ms end-to-end

## Deterministic Behavior

### Hash Algorithm

```javascript
simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}
```

### Consistency Examples

```javascript
// Same input → same output
hash('AI Technology') % 3 = 1  → pattern type
hash('AI Technology') % 3 = 1  → pattern type (always)

// Different input → different output
hash('Marketing Trends') % 3 = 0  → geometric type
hash('Data Analytics') % 3 = 2    → solid type
```

## Best Practices

### 1. Always Provide Placeholders

Even when generating real images, always include placeholders:

```javascript
const imageResult = imageService.generateImageAsync(card, {
  provider: 'gemini',
  // ...
});

// imageResult.image.placeholder will be populated
```

### 2. Match Theme

Ensure placeholder colors match your theme:

```javascript
const placeholder = service.selectPlaceholder(
  card.theme,  // Use card's theme
  aspectRatio,
  prompt
);
```

### 3. Use Appropriate Aspect Ratios

Match placeholder ratio to final image:

```javascript
// Hero layout → 16:9
// Profile image → 1:1
// Portrait → 9:16
```

### 4. Leverage Determinism

Use same prompt for consistent placeholders:

```javascript
// Will always generate same pattern
const p1 = service.selectPlaceholder(theme, '16:9', 'AI Tech');
const p2 = service.selectPlaceholder(theme, '16:9', 'AI Tech');
// p1.svg === p2.svg (true)
```

## Customization

### Adding New Patterns

```javascript
// In PlaceholderService.js

generateCustomPattern(width, height, colors, hash) {
  // Your custom SVG generation logic
  return `
    <svg width="${width}" height="${height}" ...>
      <!-- Custom pattern -->
    </svg>
  `.trim();
}

// Register in generateGeometric or generatePattern
const patterns = [
  this.generateTriangles,
  this.generateCircles,
  this.generateCustomPattern  // Add here
];
```

### Custom Color Schemes

```javascript
const customTheme = {
  colors: {
    primary: '#your-color',
    secondary: '#your-color',
    accent: '#your-color',
    background: '#your-color'
  }
};

const placeholder = service.selectPlaceholder(
  customTheme,
  '16:9',
  'content'
);
```

## Troubleshooting

### Placeholder not showing

**Check:**
1. SVG is valid XML
2. Data URL is properly encoded
3. Browser supports data URLs
4. Content Security Policy allows data URLs

### Colors not matching theme

**Check:**
1. Theme object has `colors` property
2. Colors are valid hex codes
3. Theme is passed to `selectPlaceholder()`

### Same pattern for all cards

**Expected behavior if:**
- Using same content prompt
- Using same theme
- Deterministic algorithm working correctly

**To vary:**
- Use different content prompts
- Add unique identifiers to prompts

## Testing

```javascript
import { describe, it, expect } from 'vitest';
import PlaceholderService from './PlaceholderService.js';

describe('PlaceholderService', () => {
  it('should be deterministic', () => {
    const service = new PlaceholderService();
    const theme = { colors: { primary: '#000' } };

    const p1 = service.selectPlaceholder(theme, '16:9', 'test');
    const p2 = service.selectPlaceholder(theme, '16:9', 'test');

    expect(p1.svg).toBe(p2.svg);
  });

  it('should generate valid SVG', () => {
    const service = new PlaceholderService();
    const svg = service.generateGeometric({
      theme: { colors: { primary: '#000' } },
      aspectRatio: '16:9'
    });

    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
  });
});
```

## Future Enhancements

- More pattern types (hexagons, voronoi, fractals)
- Animated SVG placeholders
- Blur-up technique
- Progressive loading
- Custom pattern uploads
- Pattern marketplace
