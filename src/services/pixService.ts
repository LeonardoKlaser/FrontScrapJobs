import { api } from './api'

export interface PixPaymentRequest {
  name: string
  email: string
  tax: string
  cellphone: string
  plan_id: number
  months: number
}

export interface PixPaymentResult {
  // PIX EMV string ("copia e cola"). Plain text — no encoding to apply.
  qr_code: string
  // Either an external HTTPS URL (Pagar.me CDN) or a `data:image/png;base64,...`
  // URI. Both are covered by nginx.conf's `img-src 'self' data: https:`. If
  // backend ever switches to a different scheme, update CSP first.
  qr_code_url: string
  expires_at: string
}

export async function createPixPayment(data: PixPaymentRequest): Promise<PixPaymentResult> {
  const response = await api.post<PixPaymentResult>('/api/payments/create-pix', data)
  return response.data
}
