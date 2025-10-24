# SSE Client Implementation Guide

**Building Robust Streaming Clients for Adaptive Cards**

Last updated: 2025-10-23
Version: 0.3.0

## Quick Start

### Basic JavaScript Client

```javascript
// 1. Make POST request to start stream
fetch('http://localhost:3000/api/presentations/stream', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'text/event-stream'
  },
  body: JSON.stringify({
    topic: 'AI in Product Discovery',
    cardCount: 6,
    includeImages: true
  })
}).then(response => {
  // 2. Read response body as stream
  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  function readStream() {
    reader.read().then(({ done, value }) => {
      if (done) return;

      // 3. Decode and parse SSE messages
      const chunk = decoder.decode(value);
      parseSSE(chunk);

      readStream();
    });
  }

  readStream();
});

function parseSSE(chunk) {
  const lines = chunk.split('\n');

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.substring(6));
      handleMessage(data);
    }
  }
}

function handleMessage(data) {
  switch(data.stage) {
    case 'skeleton':
      renderSkeleton(data.cards);
      break;
    case 'content':
      updateContent(data.cardId, data.section, data.content);
      break;
    case 'style':
      applyStyles(data.cardId, data.styles);
      break;
    case 'placeholder':
      showPlaceholder(data.cardId, data.placeholder);
      break;
    case 'image':
      swapImage(data.cardId, data.image);
      break;
  }
}
```

## Complete Client Implementation

### 1. Client Class

```javascript
class AdaptiveCardsStreamingClient {
  constructor(apiUrl = 'http://localhost:3000') {
    this.apiUrl = apiUrl;
    this.reader = null;
    this.cards = new Map();
    this.eventHandlers = new Map();
    this.buffer = '';
  }

  /**
   * Start streaming presentation
   */
  async streamPresentation(config) {
    const response = await fetch(`${this.apiUrl}/api/presentations/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify(config)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    this.reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await this.reader.read();

      if (done) {
        this.emit('complete', {});
        break;
      }

      this.buffer += decoder.decode(value, { stream: true });
      this.processBuffer();
    }
  }

  /**
   * Process buffered SSE data
   */
  processBuffer() {
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() || ''; // Keep incomplete line in buffer

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.substring(6));
          this.handleMessage(data);
        } catch (e) {
          console.error('Failed to parse SSE data:', e);
        }
      }
    }
  }

  /**
   * Handle incoming message
   */
  handleMessage(data) {
    // Emit stage-specific event
    if (data.stage) {
      this.emit(data.stage, data);
    }

    // Update card state
    if (data.cardId) {
      this.updateCard(data.cardId, data);
    }

    // Handle completion
    if (data.completedAt) {
      this.emit('complete', data);
    }

    // Handle errors
    if (data.error) {
      this.emit('error', data);
    }
  }

  /**
   * Update card state
   */
  updateCard(cardId, data) {
    if (!this.cards.has(cardId)) {
      this.cards.set(cardId, {
        id: cardId,
        sections: {},
        styles: null,
        placeholder: null,
        image: null
      });
    }

    const card = this.cards.get(cardId);

    if (data.stage === 'content') {
      card.sections[data.section] = data.content;
    } else if (data.stage === 'style') {
      card.styles = data.styles;
    } else if (data.stage === 'placeholder') {
      card.placeholder = data.placeholder;
    } else if (data.stage === 'image') {
      card.image = data.image;
    }

    this.emit('cardUpdated', { cardId, card });
  }

  /**
   * Register event handler
   */
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(handler);
  }

  /**
   * Emit event
   */
  emit(event, data) {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.forEach(handler => handler(data));
  }

  /**
   * Stop streaming
   */
  stop() {
    if (this.reader) {
      this.reader.cancel();
      this.reader = null;
    }
  }

  /**
   * Get all cards
   */
  getCards() {
    return Array.from(this.cards.values());
  }
}
```

### 2. Usage Example

```javascript
const client = new AdaptiveCardsStreamingClient();

// Handle skeleton stage
client.on('skeleton', (data) => {
  console.log(`Received skeleton for ${data.cardCount} cards`);
  data.cards.forEach(card => {
    renderCardSkeleton(card.id, card.layout);
  });
});

// Handle content updates
client.on('content', (data) => {
  console.log(`Content update: ${data.cardId} - ${data.section}`);
  updateCardSection(data.cardId, data.section, data.content);
});

// Handle style updates
client.on('style', (data) => {
  console.log(`Applying styles to ${data.cardId}`);
  applyCardStyles(data.cardId, data.styles);
});

// Handle placeholder
client.on('placeholder', (data) => {
  console.log(`Showing placeholder for ${data.cardId}`);
  showImagePlaceholder(data.cardId, data.placeholder);
});

// Handle final image
client.on('image', (data) => {
  console.log(`Image ready for ${data.cardId}: ${data.image.url}`);
  swapToFinalImage(data.cardId, data.image.url);
});

// Handle errors
client.on('error', (data) => {
  console.error(`Error in ${data.stage}:`, data.error);
  showErrorMessage(data.error.message);
});

// Handle completion
client.on('complete', (data) => {
  console.log('Stream complete!');
  hideLoadingIndicator();
});

// Start streaming
client.streamPresentation({
  topic: 'AI in Product Discovery',
  cardCount: 6,
  style: 'professional',
  includeImages: true,
  provider: 'gemini'
}).catch(error => {
  console.error('Stream failed:', error);
});

// Stop streaming (e.g., on page unload)
window.addEventListener('beforeunload', () => {
  client.stop();
});
```

## Progressive Rendering

### Stage-by-Stage Rendering

```javascript
// Stage 1: Render skeleton (instant visual feedback)
function renderCardSkeleton(cardId, layout) {
  const container = document.getElementById('cards-container');

  const skeleton = `
    <div id="${cardId}" class="card-skeleton ${layout}" data-loading="true">
      <div class="skeleton-header"></div>
      <div class="skeleton-body"></div>
      <div class="skeleton-image"></div>
    </div>
  `;

  container.insertAdjacentHTML('beforeend', skeleton);
}

// Stage 2: Update with content
function updateCardSection(cardId, section, content) {
  const card = document.getElementById(cardId);

  switch(section) {
    case 'title':
      card.querySelector('.skeleton-header').innerHTML = `<h2>${content}</h2>`;
      break;
    case 'body':
      card.querySelector('.skeleton-body').innerHTML = `<p>${content}</p>`;
      break;
    case 'bullets':
      const list = content.map(item => `<li>${item}</li>`).join('');
      card.querySelector('.skeleton-body').innerHTML = `<ul>${list}</ul>`;
      break;
  }
}

// Stage 3: Apply styles
function applyCardStyles(cardId, styles) {
  const card = document.getElementById(cardId);

  // Remove skeleton state
  card.classList.remove('card-skeleton');
  card.classList.add('card-styled');

  // Apply theme
  if (styles.theme) {
    card.style.setProperty('--primary-color', styles.theme.primary);
    card.style.setProperty('--bg-color', styles.theme.bg);
  }
}

// Stage 4: Show placeholder
function showImagePlaceholder(cardId, placeholder) {
  const card = document.getElementById(cardId);
  const imageContainer = card.querySelector('.skeleton-image');

  if (placeholder.url) {
    imageContainer.innerHTML = `
      <img
        src="${placeholder.url}"
        alt="Loading..."
        class="placeholder-image"
        data-loading="true"
      />
    `;
  }
}

// Stage 5: Swap to final image
function swapToFinalImage(cardId, imageUrl) {
  const card = document.getElementById(cardId);
  const img = card.querySelector('img[data-loading="true"]');

  if (img) {
    // Preload image
    const finalImage = new Image();
    finalImage.onload = () => {
      // Smooth transition
      img.style.opacity = '0';
      setTimeout(() => {
        img.src = imageUrl;
        img.removeAttribute('data-loading');
        img.classList.remove('placeholder-image');
        img.classList.add('final-image');
        img.style.opacity = '1';
      }, 300);
    };
    finalImage.src = imageUrl;
  }
}
```

## Resilience Patterns

### 1. Out-of-Order Message Handling

```javascript
class ResilientStreamingClient extends AdaptiveCardsStreamingClient {
  constructor(apiUrl) {
    super(apiUrl);
    this.messageQueue = [];
    this.lastProcessedSequence = 0;
  }

  handleMessage(data) {
    if (data.sequence) {
      // Add to queue
      this.messageQueue.push(data);

      // Sort by sequence
      this.messageQueue.sort((a, b) => a.sequence - b.sequence);

      // Process in order
      while (this.messageQueue.length > 0) {
        const next = this.messageQueue[0];

        if (next.sequence === this.lastProcessedSequence + 1) {
          this.messageQueue.shift();
          super.handleMessage(next);
          this.lastProcessedSequence = next.sequence;
        } else {
          break; // Wait for missing sequence
        }
      }
    } else {
      super.handleMessage(data);
    }
  }
}
```

### 2. Reconnection Logic

```javascript
class ReconnectingClient extends AdaptiveCardsStreamingClient {
  constructor(apiUrl) {
    super(apiUrl);
    this.config = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  async streamPresentation(config) {
    this.config = config;
    this.reconnectAttempts = 0;

    return this.attemptConnection();
  }

  async attemptConnection() {
    try {
      await super.streamPresentation(this.config);
    } catch (error) {
      console.error('Connection failed:', error);

      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

        console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})...`);

        await new Promise(resolve => setTimeout(resolve, delay));
        return this.attemptConnection();
      } else {
        this.emit('reconnectFailed', { error });
      }
    }
  }
}
```

### 3. Idempotent Updates

```javascript
class IdempotentClient extends AdaptiveCardsStreamingClient {
  constructor(apiUrl) {
    super(apiUrl);
    this.processedUpdates = new Set();
  }

  updateCard(cardId, data) {
    // Create unique key for this update
    const updateKey = `${cardId}-${data.stage}-${data.section || 'root'}`;

    // Skip if already processed
    if (this.processedUpdates.has(updateKey)) {
      console.log(`Skipping duplicate update: ${updateKey}`);
      return;
    }

    // Mark as processed
    this.processedUpdates.add(updateKey);

    // Process update
    super.updateCard(cardId, data);
  }
}
```

## React Integration

### React Hook

```javascript
import { useState, useEffect, useRef } from 'react';

function useStreamingCards(config) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const clientRef = useRef(null);

  useEffect(() => {
    if (!config) return;

    const client = new AdaptiveCardsStreamingClient();
    clientRef.current = client;

    setLoading(true);
    setError(null);

    // Handle card updates
    client.on('cardUpdated', ({ card }) => {
      setCards(prevCards => {
        const index = prevCards.findIndex(c => c.id === card.id);
        if (index >= 0) {
          const newCards = [...prevCards];
          newCards[index] = card;
          return newCards;
        } else {
          return [...prevCards, card];
        }
      });
    });

    // Handle skeleton
    client.on('skeleton', (data) => {
      const initialCards = data.cards.map(c => ({
        id: c.id,
        layout: c.layout,
        type: c.type,
        sections: {},
        loading: true
      }));
      setCards(initialCards);
    });

    // Handle completion
    client.on('complete', () => {
      setLoading(false);
    });

    // Handle errors
    client.on('error', (data) => {
      setError(data.error);
    });

    // Start streaming
    client.streamPresentation(config).catch(err => {
      setError(err);
      setLoading(false);
    });

    // Cleanup
    return () => {
      client.stop();
    };
  }, [config]);

  return { cards, loading, error };
}

// Usage in component
function PresentationViewer({ topic }) {
  const { cards, loading, error } = useStreamingCards({
    topic,
    cardCount: 6,
    includeImages: true
  });

  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {loading && <div>Loading...</div>}
      {cards.map(card => (
        <Card key={card.id} data={card} />
      ))}
    </div>
  );
}
```

## Vue Integration

### Vue Composable

```javascript
import { ref, onMounted, onUnmounted } from 'vue';

export function useStreamingCards(config) {
  const cards = ref([]);
  const loading = ref(false);
  const error = ref(null);
  let client = null;

  onMounted(() => {
    client = new AdaptiveCardsStreamingClient();

    loading.value = true;

    client.on('cardUpdated', ({ card }) => {
      const index = cards.value.findIndex(c => c.id === card.id);
      if (index >= 0) {
        cards.value[index] = card;
      } else {
        cards.value.push(card);
      }
    });

    client.on('skeleton', (data) => {
      cards.value = data.cards.map(c => ({
        id: c.id,
        layout: c.layout,
        type: c.type,
        sections: {},
        loading: true
      }));
    });

    client.on('complete', () => {
      loading.value = false;
    });

    client.on('error', (data) => {
      error.value = data.error;
    });

    client.streamPresentation(config).catch(err => {
      error.value = err;
      loading.value = false;
    });
  });

  onUnmounted(() => {
    if (client) {
      client.stop();
    }
  });

  return { cards, loading, error };
}
```

## Testing

### Mock SSE Server

```javascript
class MockSSEServer {
  constructor() {
    this.listeners = [];
  }

  async simulateStream() {
    // Skeleton
    await this.delay(50);
    this.emit('message', {
      stage: 'skeleton',
      cards: [{ id: 'card-1', layout: 'split', type: 'title' }]
    });

    // Content
    await this.delay(100);
    this.emit('message', {
      stage: 'content',
      cardId: 'card-1',
      section: 'title',
      content: 'Test Title'
    });

    // Complete
    await this.delay(50);
    this.emit('complete', { completedAt: new Date().toISOString() });
  }

  on(event, handler) {
    this.listeners.push({ event, handler });
  }

  emit(event, data) {
    this.listeners
      .filter(l => l.event === event)
      .forEach(l => l.handler(data));
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Usage in tests
test('renders cards progressively', async () => {
  const server = new MockSSEServer();
  const client = new AdaptiveCardsStreamingClient();

  // Intercept fetch to use mock server
  global.fetch = () => Promise.resolve({
    ok: true,
    body: {
      getReader: () => ({
        read: () => server.simulateStream()
      })
    }
  });

  const cards = [];
  client.on('cardUpdated', ({ card }) => {
    cards.push(card);
  });

  await client.streamPresentation({ topic: 'Test' });

  expect(cards.length).toBeGreaterThan(0);
});
```

## Best Practices

1. **Buffer messages by sequence** - Handle out-of-order delivery
2. **Implement reconnection** - Handle network interruptions
3. **Show placeholders immediately** - Don't wait for images
4. **Use transitions** - Smooth visual updates between stages
5. **Handle errors gracefully** - Show meaningful error messages
6. **Clean up resources** - Stop streams on unmount/navigation
7. **Test with slow connections** - Verify resilience
8. **Log events** - Aid debugging in production
9. **Validate messages** - Check for required fields
10. **Optimize rendering** - Batch DOM updates

## Troubleshooting

### Events Not Received

- Check Accept header is set to `text/event-stream`
- Verify network tab shows streaming response
- Check for proxy/CDN buffering

### Duplicate Messages

- Implement idempotent update logic
- Use cardId + section as unique key

### Memory Leaks

- Always call `client.stop()` on cleanup
- Remove event listeners on unmount

### Image Swap Flicker

- Preload images before swapping
- Use CSS transitions for smooth updates

## References

- [SSE-STREAMING.md](./SSE-STREAMING.md) - Server architecture
- [Test Client](../tests/api/streaming-client.html) - Reference implementation
- [MDN EventSource](https://developer.mozilla.org/en-US/docs/Web/API/EventSource)
