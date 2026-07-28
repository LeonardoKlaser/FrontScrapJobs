import '@testing-library/jest-dom'

// Inicializa i18n pra que componentes que usam useTranslation rendam strings
// reais (pt-BR default) em vez de keys cruas. Antes, StatusBadge / etc usavam
// strings hardcoded e o setup nao precisava de i18n; agora todos passam por t().
import '@/i18n'

// Polyfill ResizeObserver for Radix UI components under jsdom.
class ResizeObserverPolyfill {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = ResizeObserverPolyfill as unknown as typeof ResizeObserver
}

// Polyfill IntersectionObserver for useInViewOnce under jsdom.
class IntersectionObserverPolyfill {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}
if (typeof globalThis.IntersectionObserver === 'undefined') {
  globalThis.IntersectionObserver =
    IntersectionObserverPolyfill as unknown as typeof IntersectionObserver
}

// jsdom nao implementa matchMedia — usado por useForceSystemTheme (paginas
// publicas) e pelo ThemeProvider quando o tema e 'system'. Default matches:
// false (light); testes que precisam simular SO em dark mockam por conta propria.
if (typeof window.matchMedia === 'undefined') {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false
  })) as unknown as typeof window.matchMedia
}

// jsdom nao implementa Pointer Capture nem scrollIntoView — Radix Select usa ambos.
if (typeof Element !== 'undefined') {
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false
  }
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = () => {}
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => {}
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {}
  }
}
