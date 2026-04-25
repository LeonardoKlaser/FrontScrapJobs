type DataLayerEvent = {
  event: string
  [key: string]: unknown
}

declare global {
  interface Window {
    dataLayer?: DataLayerEvent[]
  }
}

export type CheckoutEvent =
  | 'checkout_view'
  | 'checkout_step1_submit'
  | 'checkout_step2_view'
  | 'checkout_step2_submit'
  | 'checkout_step3_view'
  | 'checkout_step3_submit'
  | 'checkout_payment_confirmed'
  | 'checkout_lead_save_failed'
  | 'checkout_validate_failed'

export function trackCheckout(event: CheckoutEvent, payload: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined') return
  try {
    window.dataLayer = window.dataLayer || []
    // Spread payload primeiro pra garantir que `event` da tipagem nunca seja sobrescrito
    window.dataLayer.push({ ...payload, event })
  } catch (err) {
    console.warn('analytics push failed', err)
  }
}
