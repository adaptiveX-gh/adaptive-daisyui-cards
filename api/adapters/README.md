# Image Generation Adapters

This directory contains adapters for different image generation providers. The adapter pattern allows the system to support multiple providers with a consistent interface.

## Architecture

```
ImageGenerationService
    ↓
BaseImageAdapter (abstract)
    ├── GeminiImageAdapter
    ├── PlaceholderAdapter
    ├── DalleAdapter (future)
    └── StableDiffusionAdapter (future)
```

## BaseImageAdapter

All adapters must extend `BaseImageAdapter` and implement the `generate()` method.

### Required Methods

```javascript
async generate(options) {
  // options: { prompt, aspectRatio, style, theme }
  // returns: { url, type, metadata }
}
```

### Inherited Methods

- `validate(options)` - Validate generation options
- `handleError(error)` - Standardize error format
- `generateWithTimeout(options)` - Generate with timeout wrapper
- `generateWithRetry(options)` - Generate with retry logic
- `getStatus()` - Get provider status

### Configuration

```javascript
const adapter = new MyAdapter({
  apiKey: 'your-api-key',
  timeout: 30000,  // 30 seconds
  retries: 2       // retry attempts
});
```

## Available Adapters

### 1. GeminiImageAdapter

**Provider**: Google Gemini AI
**Status**: Implemented (with mock mode)
**API Key Required**: Yes

#### Features

- Prompt enhancement for presentation images
- Aspect ratio support: 1:1, 16:9, 9:16, 4:3, 3:4
- Style presets: professional-presentation, abstract, minimalist, illustrative
- Theme-aware prompt enhancement
- Automatic retry with exponential backoff
- Mock mode for development without API key

#### Configuration

```javascript
import GeminiImageAdapter from './GeminiImageAdapter.js';

const adapter = new GeminiImageAdapter({
  apiKey: process.env.GEMINI_API_KEY,
  model: 'gemini-2.0-flash-exp',
  timeout: 30000
});
```

#### Environment Variables

```bash
GEMINI_API_KEY=your_api_key_here
GEMINI_MOCK_MODE=true  # Enable mock mode
```

#### Usage

```javascript
const result = await adapter.generate({
  prompt: 'Abstract visualization of AI technology',
  aspectRatio: '16:9',
  style: 'professional-presentation',
  theme: { name: 'professional' }
});

// Returns:
// {
//   url: 'https://...' or 'data:image/...',
//   type: 'generated',
//   metadata: {
//     provider: 'gemini',
//     model: 'gemini-2.0-flash-exp',
//     prompt: 'Enhanced prompt...',
//     generatedAt: '2025-10-23T...'
//   }
// }
```

### 2. PlaceholderAdapter

**Provider**: Internal SVG generation
**Status**: Fully implemented
**API Key Required**: No

#### Features

- Instant generation (no API calls)
- Three placeholder types: geometric, pattern, solid
- Deterministic (same input = same output)
- Theme-aware colors
- All aspect ratios supported
- Returns data URLs (base64 encoded SVG)

#### Configuration

No configuration required - always available.

```javascript
import PlaceholderAdapter from './PlaceholderAdapter.js';

const adapter = new PlaceholderAdapter();
```

#### Usage

```javascript
const result = await adapter.generate({
  prompt: 'AI technology background',
  aspectRatio: '16:9',
  style: 'professional-presentation',
  theme: {
    colors: {
      primary: '#3b82f6',
      secondary: '#1e40af',
      accent: '#60a5fa'
    }
  }
});

// Returns:
// {
//   url: 'data:image/svg+xml;base64,...',
//   type: 'placeholder',
//   placeholderType: 'geometric',
//   metadata: {
//     provider: 'placeholder',
//     instant: true,
//     generatedAt: '2025-10-23T...'
//   }
// }
```

### 3. DalleAdapter (Future)

**Provider**: OpenAI DALL-E
**Status**: Not implemented (placeholder for future)
**API Key Required**: Yes

Planned features:
- DALL-E 3 integration
- High-quality photorealistic images
- Style transfer capabilities

### 4. StableDiffusionAdapter (Future)

**Provider**: Stability AI
**Status**: Not implemented (placeholder for future)
**API Key Required**: Yes

Planned features:
- Stable Diffusion XL integration
- Fine-grained style control
- Multiple model support

## Creating a New Adapter

To add a new image generation provider:

### 1. Create the Adapter File

```javascript
// api/adapters/MyProviderAdapter.js
import BaseImageAdapter from './BaseImageAdapter.js';

export class MyProviderAdapter extends BaseImageAdapter {
  constructor(config = {}) {
    super(config);
    this.apiKey = config.apiKey || process.env.MY_PROVIDER_API_KEY;
    // Initialize provider client
  }

  async generate(options) {
    // Validate
    const validation = await this.validate(options);
    if (!validation.valid) {
      throw new Error(`Invalid options: ${validation.errors.join(', ')}`);
    }

    // Extract options
    const { prompt, aspectRatio, style, theme } = options;

    // Call provider API
    const result = await this.callProviderAPI(prompt, aspectRatio);

    // Return standardized format
    return {
      url: result.imageUrl,
      type: 'generated',
      metadata: {
        provider: 'my-provider',
        prompt,
        generatedAt: new Date().toISOString()
      }
    };
  }

  async callProviderAPI(prompt, aspectRatio) {
    // Implement provider-specific API call
  }

  getStatus() {
    return {
      name: 'MyProviderAdapter',
      available: !!this.apiKey,
      configured: !!this.apiKey
    };
  }
}

export default MyProviderAdapter;
```

### 2. Register in ImageGenerationService

```javascript
// api/services/ImageGenerationService.js
import MyProviderAdapter from '../adapters/MyProviderAdapter.js';

this.providers = {
  gemini: new GeminiImageAdapter(),
  placeholder: new PlaceholderAdapter(),
  'my-provider': new MyProviderAdapter()  // Add here
};
```

### 3. Update Fallback Chain (Optional)

```javascript
this.fallbackChain = ['gemini', 'my-provider', 'placeholder'];
```

## Adapter Interface Specification

### Input Options

```typescript
interface GenerateOptions {
  prompt: string;           // Required: Image generation prompt
  aspectRatio?: string;     // Optional: '16:9', '1:1', '4:3', '9:16', '3:4'
  style?: string;          // Optional: 'professional-presentation', 'abstract', 'minimalist', 'illustrative'
  theme?: Theme;           // Optional: Theme object with colors
}
```

### Output Format

```typescript
interface GenerateResult {
  url: string;              // Image URL or data URL
  type: string;            // 'generated' or 'placeholder'
  placeholderType?: string; // Only for placeholders: 'geometric', 'pattern', 'solid'
  metadata: {
    provider: string;      // Provider name
    model?: string;        // Model name (if applicable)
    prompt?: string;       // Enhanced prompt used
    originalPrompt?: string;
    generatedAt: string;   // ISO timestamp
    [key: string]: any;   // Provider-specific metadata
  }
}
```

### Error Handling

Adapters should throw standardized errors:

```javascript
{
  provider: 'adapter-name',
  error: 'Error message',
  code: 'ERROR_CODE',
  timestamp: '2025-10-23T...',
  retryable: true|false
}
```

## Best Practices

1. **Always validate options** - Use `this.validate(options)` before generation
2. **Handle errors gracefully** - Use `this.handleError(error)` for consistent formatting
3. **Respect timeouts** - Use `this.generateWithTimeout()` wrapper
4. **Implement retries** - Use `this.generateWithRetry()` for retryable errors
5. **Log appropriately** - Log errors but not sensitive data (API keys)
6. **Test thoroughly** - Unit tests for validation, integration tests for API calls
7. **Support mock mode** - Allow testing without API keys
8. **Return metadata** - Include useful debugging information

## Testing Adapters

### Unit Tests

```javascript
import { describe, it, expect } from 'vitest';
import MyProviderAdapter from './MyProviderAdapter.js';

describe('MyProviderAdapter', () => {
  it('should validate options correctly', async () => {
    const adapter = new MyProviderAdapter();
    const validation = await adapter.validate({
      prompt: 'test prompt',
      aspectRatio: '16:9'
    });
    expect(validation.valid).toBe(true);
  });

  it('should generate image with valid options', async () => {
    const adapter = new MyProviderAdapter({ apiKey: 'test' });
    const result = await adapter.generate({
      prompt: 'test',
      aspectRatio: '16:9'
    });
    expect(result.url).toBeDefined();
  });
});
```

### Integration Tests

```javascript
import { imageGenerationService } from './ImageGenerationService.js';

// Test with real API (requires API key)
const result = await imageGenerationService.generateImage('test prompt', {
  provider: 'my-provider',
  aspectRatio: '16:9'
});
```

## Troubleshooting

### Provider not working

1. Check API key is set in `.env`
2. Verify provider is available: `GET /api/images/providers`
3. Test connection: `POST /api/images/test/provider-name`
4. Check logs for error details

### Slow generation

1. Check timeout settings (`IMAGE_GENERATION_TIMEOUT`)
2. Verify network connectivity
3. Consider enabling fallback chain
4. Use placeholder for instant results

### Mock mode

For development without API keys:

```bash
GEMINI_MOCK_MODE=true
```

This returns placeholder URLs instead of calling the real API.

## API Keys

Get API keys from:

- **Gemini**: https://makersuite.google.com/app/apikey
- **OpenAI (DALL-E)**: https://platform.openai.com/api-keys
- **Stability AI**: https://platform.stability.ai/account/keys

**Security**: Never commit API keys to git. Always use `.env` and add `.env` to `.gitignore`.
