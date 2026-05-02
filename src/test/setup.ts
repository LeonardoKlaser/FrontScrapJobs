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
