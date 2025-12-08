import '@testing-library/jest-dom/vitest';

// Minimal mocks for browser APIs used by MUI and internal helpers
if (!window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  });
}

if (!globalThis.ResizeObserver) {
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  // @ts-expect-error: jsdom does not implement ResizeObserver yet
  globalThis.ResizeObserver = ResizeObserverMock;
}

if (!navigator.clipboard) {
  // @ts-expect-error: jsdom does not implement clipboard yet
  navigator.clipboard = {
    writeText: async () => Promise.resolve(),
  };
}

