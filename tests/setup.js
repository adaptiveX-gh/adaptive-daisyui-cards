// Vitest setup file for unit tests
import { beforeEach, afterEach } from 'vitest';

// Setup before each test
beforeEach(() => {
  // Reset DOM
  document.body.innerHTML = '';
  document.head.innerHTML = '';
});

// Cleanup after each test
afterEach(() => {
  document.body.innerHTML = '';
  document.head.innerHTML = '';
});

// Mock CSS Container Queries support
global.CSS = {
  supports: (property, value) => {
    if (property === 'container-type') return true;
    if (property.includes('container')) return true;
    return false;
  }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};
