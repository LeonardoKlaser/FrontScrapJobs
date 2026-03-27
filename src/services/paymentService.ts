import { api } from '@/services/api'

export interface CreatePaymentRequest {
  name: string
  email: string
  password: string
  tax: string
  cellphone: string
  card_token: string
}

export interface PaymentResult {
  status: 'processing'
}

export interface PaymentStatusResult {
  status: 'confirmed' | 'processing' | 'not_found'
}

export interface CancelSubscriptionResult {
  message: string
}

export async function createPayment(
  planId: number,
  data: CreatePaymentRequest
): Promise<PaymentResult> {
  const response = await api.post<PaymentResult>(`/api/payments/create/${planId}`, data)
  return response.data
}

export async function checkPaymentStatus(email: string): Promise<PaymentStatusResult> {
  const response = await api.get<PaymentStatusResult>('/api/payments/status', {
    params: { email }
  })
  return response.data
}

export async function cancelSubscription(): Promise<CancelSubscriptionResult> {
  const response = await api.delete<CancelSubscriptionResult>('/api/subscription/cancel')
  return response.data
}
