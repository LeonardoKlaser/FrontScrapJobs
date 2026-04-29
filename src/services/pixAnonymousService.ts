import { api } from './api'
import type { PixPaymentResult } from './pixService'

export interface PixAnonymousRequest {
  name: string
  email: string
  password: string
  tax: string
  cellphone: string
  plan_id: number
  months: 1 | 3
}

export async function createPixAnonymous(data: PixAnonymousRequest): Promise<PixPaymentResult> {
  const response = await api.post<PixPaymentResult>('/api/payments/create-pix-anonymous', data)
  return response.data
}
