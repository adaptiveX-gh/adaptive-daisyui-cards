/**
 * Adaptive DaisyUI Card System - Interactive Demo
 * Handles resizing, theme switching, layout switching, and accessibility
 */

// =================================================================
// STATE MANAGEMENT
// =================================================================

const state = {
  currentLayout: 'sidebar',
  currentTheme: 'light',
  containerWidth: 800,
  isResizing: false,
  minWidth: 200,
  maxWidth: 1200
};

// =================================================================
// DOM ELEMENTS
// =================================================================

const elements = {
  resizableWrapper: document.getElementById('resizable-wrapper'),
  resizeHandle: document.getElementById('resize-handle'),
  widthDisplay: document.getElementById('width-display'),
  layoutSelect: document.getElementById('layout-select'),
  themeSelect: document.getElementById('theme-select'),
  resetButton: document.getElementById('reset-width'),
  presetButtons: document.querySelectorAll('.preset-width'),
  layouts: {
    sidebar: document.getElementById('sidebar-layout'),
    feature: document.getElementById('feature-layout'),
    masonry: document.getElementById('masonry-layout'),
    dashboard: document.getElementById('dashboard-layout'),
    split: document.getElementById('split-layout'),
    hero: document.getElementById('hero-layout')
  }
};

// =================================================================
// LAYOUT MANAGEMENT
// =================================================================

/**
 * Switches between different layout types
 * @param {string} layoutType - The layout to switch to (sidebar, feature, masonry, dashboard, split, hero)
 */
function switchLayout(layoutType) {
  state.currentLayout = layoutType;

  // Hide all layouts
  Object.values(elements.layouts).forEach(layout => {
    if (layout) layout.classList.add('hidden');
  });

  // Show selected layout
  if (elements.layouts[layoutType]) {
    elements.layouts[layoutType].classList.remove('hidden');
  }

  // Update select value
  elements.layoutSelect.value = layoutType;

  // Save to localStorage
  localStorage.setItem('adaptive-cards-layout', layoutType);

  // Announce to screen readers
  announceToScreenReader(`Switched to ${layoutType} layout`);
}

// =================================================================
// THEME MANAGEMENT
// =================================================================

/**
 * Switches DaisyUI theme
 * @param {string} themeName - The theme name to apply
 */
function switchTheme(themeName) {
  state.currentTheme = themeName;
  document.documentElement.setAttribute('data-theme', themeName);
  elements.themeSelect.value = themeName;

  // Save to localStorage
  localStorage.setItem('adaptive-cards-theme', themeName);

  // Announce to screen readers
  announceToScreenReader(`Theme changed to ${themeName}`);
}

// =================================================================
// CONTAINER RESIZING
// =================================================================

/**
 * Updates the container width and display
 * @param {number} width - The new width in pixels
 */
function updateContainerWidth(width) {
  // Clamp width between min and max
  width = Math.max(state.minWidth, Math.min(state.maxWidth, width));
  state.containerWidth = width;

  // Update container style
  elements.resizableWrapper.style.width = `${width}px`;

  // Update display badge
  elements.widthDisplay.textContent = `${width}px`;

  // Update ARIA value for resize handle
  elements.resizeHandle.setAttribute('aria-valuenow', width);

  // Update preset button states
  updatePresetButtonStates(width);
}

/**
 * Highlights the preset button that matches current width
 * @param {number} currentWidth - The current container width
 */
function updatePresetButtonStates(currentWidth) {
  elements.presetButtons.forEach(button => {
    const presetWidth = parseInt(button.dataset.width);
    if (Math.abs(currentWidth - presetWidth) < 5) {
      button.classList.add('btn-active');
    } else {
      button.classList.remove('btn-active');
    }
  });
}

/**
 * Handles mouse/touch resize start
 * @param {Event} e - The event object
 */
function handleResizeStart(e) {
  state.isResizing = true;
  elements.resizableWrapper.style.pointerEvents = 'none';
  elements.resizeHandle.classList.add('active');

  // Prevent text selection during resize
  document.body.style.userSelect = 'none';

  // Add event listeners for mouse/touch move and end
  document.addEventListener('mousemove', handleResizeMove);
  document.addEventListener('mouseup', handleResizeEnd);
  document.addEventListener('touchmove', handleResizeMove);
  document.addEventListener('touchend', handleResizeEnd);

  e.preventDefault();
}

/**
 * Handles mouse/touch resize movement
 * @param {Event} e - The event object
 */
function handleResizeMove(e) {
  if (!state.isResizing) return;

  // Get client X position from mouse or touch event
  const clientX = e.clientX || (e.touches && e.touches[0].clientX);
  if (!clientX) return;

  // Calculate new width based on mouse position
  const rect = elements.resizableWrapper.getBoundingClientRect();
  const newWidth = clientX - rect.left;

  // Update width with requestAnimationFrame for smooth performance
  requestAnimationFrame(() => {
    updateContainerWidth(newWidth);
  });
}

/**
 * Handles mouse/touch resize end
 */
function handleResizeEnd() {
  if (!state.isResizing) return;

  state.isResizing = false;
  elements.resizableWrapper.style.pointerEvents = '';
  elements.resizeHandle.classList.remove('active');
  document.body.style.userSelect = '';

  // Remove event listeners
  document.removeEventListener('mousemove', handleResizeMove);
  document.removeEventListener('mouseup', handleResizeEnd);
  document.removeEventListener('touchmove', handleResizeMove);
  document.removeEventListener('touchend', handleResizeEnd);
}

/**
 * Resets container width to default (800px)
 */
function resetContainerWidth() {
  updateContainerWidth(800);
  announceToScreenReader('Container width reset to 800 pixels');
}

/**
 * Sets container to a preset width
 * @param {number} width - The preset width to set
 */
function setPresetWidth(width) {
  updateContainerWidth(width);
  announceToScreenReader(`Container width set to ${width} pixels`);
}

// =================================================================
// KEYBOARD NAVIGATION
// =================================================================

/**
 * Handles keyboard navigation for resize handle
 * @param {KeyboardEvent} e - The keyboard event
 */
function handleResizeKeyboard(e) {
  const step = e.shiftKey ? 50 : 10; // Larger steps with Shift key
  let newWidth = state.containerWidth;

  switch (e.key) {
    case 'ArrowLeft':
    case 'ArrowDown':
      newWidth -= step;
      e.preventDefault();
      break;
    case 'ArrowRight':
    case 'ArrowUp':
      newWidth += step;
      e.preventDefault();
      break;
    case 'Home':
      newWidth = state.minWidth;
      e.preventDefault();
      break;
    case 'End':
      newWidth = state.maxWidth;
      e.preventDefault();
      break;
    default:
      return;
  }

  updateContainerWidth(newWidth);
  announceToScreenReader(`Container width: ${newWidth} pixels`);
}

// =================================================================
// ACCESSIBILITY
// =================================================================

/**
 * Announces messages to screen readers using ARIA live region
 * @param {string} message - The message to announce
 */
function announceToScreenReader(message) {
  // Create or update live region
  let liveRegion = document.getElementById('sr-live-region');

  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'sr-live-region';
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.style.position = 'absolute';
    liveRegion.style.left = '-10000px';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.overflow = 'hidden';
    document.body.appendChild(liveRegion);
  }

  // Clear and set new message
  liveRegion.textContent = '';
  setTimeout(() => {
    liveRegion.textContent = message;
  }, 100);
}

// =================================================================
// EVENT LISTENERS
// =================================================================

/**
 * Initialize all event listeners
 */
function initEventListeners() {
  // Layout selector
  elements.layoutSelect.addEventListener('change', (e) => {
    switchLayout(e.target.value);
  });

  // Theme selector
  elements.themeSelect.addEventListener('change', (e) => {
    switchTheme(e.target.value);
  });

  // Reset button
  elements.resetButton.addEventListener('click', resetContainerWidth);

  // Preset width buttons
  elements.presetButtons.forEach(button => {
    button.addEventListener('click', () => {
      const width = parseInt(button.dataset.width);
      setPresetWidth(width);
    });
  });

  // Resize handle - Mouse events
  elements.resizeHandle.addEventListener('mousedown', handleResizeStart);
  elements.resizeHandle.addEventListener('touchstart', handleResizeStart, { passive: false });

  // Resize handle - Keyboard navigation
  elements.resizeHandle.addEventListener('keydown', handleResizeKeyboard);

  // Prevent default drag behavior
  elements.resizeHandle.addEventListener('dragstart', (e) => {
    e.preventDefault();
  });

  // Handle window resize (update max width if needed)
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // Ensure container doesn't exceed viewport
      const maxViewportWidth = window.innerWidth - 100;
      if (state.containerWidth > maxViewportWidth) {
        updateContainerWidth(maxViewportWidth);
      }
    }, 250);
  });
}

// =================================================================
// INITIALIZATION
// =================================================================

/**
 * Initialize the application
 */
function init() {
  // Load saved preferences
  const savedLayout = localStorage.getItem('adaptive-cards-layout') || 'sidebar';
  const savedTheme = localStorage.getItem('adaptive-cards-theme') || 'light';

  // Apply saved preferences
  switchTheme(savedTheme);
  switchLayout(savedLayout);

  // Set initial container width
  updateContainerWidth(state.containerWidth);

  // Initialize event listeners
  initEventListeners();

  // Add smooth transition class to all adaptive elements after initial render
  setTimeout(() => {
    document.querySelectorAll('.adaptive-card').forEach(card => {
      card.classList.add('adaptive-transition');
    });
  }, 100);

  // Log initialization for debugging
  console.log('Adaptive DaisyUI Card System initialized');
  console.log('Current layout:', state.currentLayout);
  console.log('Current custom theme:', state.currentCustomTheme);
  console.log('Current DaisyUI theme:', state.currentDaisyUITheme);
  console.log('Container width:', state.containerWidth);
}

// =================================================================
// START APPLICATION
// =================================================================

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// =================================================================
// PERFORMANCE MONITORING (Optional)
// =================================================================

// Monitor performance during resize for 60fps target
let lastFrameTime = performance.now();
let frameCount = 0;
let fpsDisplay = null;

/**
 * Creates FPS counter for development (optional)
 */
function createFPSCounter() {
  fpsDisplay = document.createElement('div');
  fpsDisplay.style.position = 'fixed';
  fpsDisplay.style.top = '10px';
  fpsDisplay.style.right = '10px';
  fpsDisplay.style.background = 'rgba(0,0,0,0.7)';
  fpsDisplay.style.color = '#0f0';
  fpsDisplay.style.padding = '8px 12px';
  fpsDisplay.style.borderRadius = '4px';
  fpsDisplay.style.fontFamily = 'monospace';
  fpsDisplay.style.fontSize = '14px';
  fpsDisplay.style.zIndex = '9999';
  fpsDisplay.style.display = 'none';
  document.body.appendChild(fpsDisplay);
}

/**
 * Updates FPS counter
 */
function updateFPS() {
  const now = performance.now();
  const delta = now - lastFrameTime;
  lastFrameTime = now;

  frameCount++;

  if (frameCount % 10 === 0) {
    const fps = Math.round(1000 / delta);
    if (fpsDisplay) {
      fpsDisplay.textContent = `FPS: ${fps}`;
      fpsDisplay.style.color = fps >= 55 ? '#0f0' : fps >= 30 ? '#ff0' : '#f00';
    }
  }

  if (state.isResizing) {
    requestAnimationFrame(updateFPS);
  } else if (fpsDisplay) {
    fpsDisplay.style.display = 'none';
  }
}

// Enable FPS counter during resize (for development)
document.addEventListener('mousedown', (e) => {
  if (e.target === elements.resizeHandle || e.target.closest('#resize-handle')) {
    if (!fpsDisplay) createFPSCounter();
    fpsDisplay.style.display = 'block';
    requestAnimationFrame(updateFPS);
  }
});

// =================================================================
// EXPORT FOR TESTING (if needed)
// =================================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    switchLayout,
    switchCustomTheme,
    switchDaisyUITheme,
    updateContainerWidth,
    state
  };
}
