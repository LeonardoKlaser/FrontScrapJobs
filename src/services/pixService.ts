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
  order_id: string
  charge_id: string
  qr_code: string
  qr_code_url: string
  expires_at: string
  status: string
}

export async function createPixPayment(data: PixPaymentRequest): Promise<PixPaymentResult> {
  const response = await api.post<PixPaymentResult>('/api/payments/create-pix', data)
  return response.data
}
