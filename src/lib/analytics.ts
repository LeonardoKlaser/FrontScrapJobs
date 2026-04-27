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

// Trial funnel events: minimo necessario pra medir conversao do trial flow.
// Phase 1 cobre apenas signup, paywall e payment — onboarding steps detalhados
// (onboarding_step_1/2/3, trial_day_X) ficam pra Phase 2.
//
// signup_failed da denominador pra calcular taxa de conversao do form. Sem ele,
// queda no signup_complete fica ambigua entre "API down" e "form com bug".
export type TrialEvent = 'signup_complete' | 'signup_failed' | 'paywall_view' | 'payment_complete'

export function trackTrial(event: TrialEvent, payload: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined') return
  try {
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ ...payload, event })
  } catch (err) {
    console.warn('analytics push failed', err)
  }
}
