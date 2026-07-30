// CTA "Começar grátis" → conversa com o Norte no WhatsApp (spec funil F1).
// Sufixos de origem dão atribuição por caminho no backend (wa_leads.source).
const WA_SOURCE_SUFFIX = { mobile: '#lp', qr: '#lpq', web: '#lpw' } as const

export type WaCtaSource = keyof typeof WA_SOURCE_SUFFIX

export function buildWaLink(source: WaCtaSource): string {
  const number = import.meta.env.VITE_NORTE_WA_NUMBER || ''
  if (!number) {
    // Sem VITE_NORTE_WA_NUMBER (env ausente no build), o link sobe sem
    // destinatário — os 3 CTAs e o QR do modal ficam mudos. Não quebra a
    // página, mas precisa aparecer alto no console pra não passar batido.
    console.warn('VITE_NORTE_WA_NUMBER não configurada — o link do WhatsApp ficou sem número')
  }
  const text = encodeURIComponent(`Oi Norte! Quero ver vagas pra mim ${WA_SOURCE_SUFFIX[source]}`)
  return `https://wa.me/${number}?text=${text}`
}

export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}
