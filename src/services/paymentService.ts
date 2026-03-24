import { api } from '@/services/api'

export interface CheckoutResult {
  checkout_url: string
}

export interface CreatePaymentRequest {
  name: string
  email: string
  password: string
  tax: string
  cellphone: string
}

export async function createPayment(
  planId: number,
  data: CreatePaymentRequest
): Promise<CheckoutResult> {
  const response = await api.post<CheckoutResult>(`/api/payments/create/${planId}`, data)
  return response.data
}
