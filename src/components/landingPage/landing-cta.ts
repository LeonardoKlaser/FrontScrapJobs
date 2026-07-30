export const LANDING_CTA_CLASS =
  'h-auto px-8 py-4 text-base font-semibold rounded-lg animate-pulse-glow'

// Rola suavemente ate qualquer secao da landing pelo id. Usado pelas ancoras
// da navbar (howItWorks, pricing, faq).
export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
