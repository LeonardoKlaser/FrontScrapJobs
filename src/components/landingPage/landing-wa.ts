// CTA "Começar grátis" → conversa com o Norte no WhatsApp (spec funil F1).
// Sufixos de origem dão atribuição por caminho no backend (wa_leads.source).
const WA_SOURCE_SUFFIX = { mobile: '#lp', qr: '#lpq', web: '#lpw' } as const

export type WaCtaSource = keyof typeof WA_SOURCE_SUFFIX

export function buildWaLink(source: WaCtaSource): string {
  const number = import.meta.env.VITE_NORTE_WA_NUMBER || ''
  const text = encodeURIComponent(`Oi Norte! Quero ver vagas pra mim ${WA_SOURCE_SUFFIX[source]}`)
  return `https://wa.me/${number}?text=${text}`
}

export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}
