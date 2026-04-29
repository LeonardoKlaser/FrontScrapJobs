export const LANDING_CTA_CLASS =
  'h-auto px-8 py-4 text-base font-semibold rounded-lg animate-pulse-glow'

// Rola suavemente ate a secao de planos da landing. Usado pelos CTAs
// genericos (navbar, hero, cta final, how-it-works) — ao inves de mandar
// pro /signup direto, leva o visitante pra escolha de plano.
export function scrollToPricing() {
  const el = document.getElementById('pricing')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
