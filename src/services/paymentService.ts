import { api } from '@/services/api'

export interface PaymentStatusResult {
  // Backend só emite confirmed/processing/not_found pra esse endpoint hoje
  // (CheckPaymentStatus em payment_usecase.go). Estados terminais como
  // 'expired'/'failed' nao sao retornados — o frontend deriva expirado do
  // timer local + grace window em pix-payment-step.tsx.
  status: 'confirmed' | 'processing' | 'not_found'
}

export interface PaymentStatusLookup {
  email?: string
  checkoutId?: string
}

export interface CancelSubscriptionResult {
  message: string
}

export async function checkPaymentStatus(
  lookup: PaymentStatusLookup
): Promise<PaymentStatusResult> {
  const checkoutId = lookup.checkoutId?.trim()
  const email = lookup.email?.trim()
  if (!checkoutId && !email) {
    throw new Error('checkout_id ou email é obrigatório')
  }

  const response = await api.get<PaymentStatusResult>('/api/payments/status', {
    params: checkoutId ? { checkout_id: checkoutId } : { email }
  })
  return response.data
}

export async function cancelSubscription(): Promise<CancelSubscriptionResult> {
  const response = await api.delete<CancelSubscriptionResult>('/api/subscription/cancel')
  return response.data
}

// --- AbacatePay ---

export interface CreateSubscriptionRequest {
  name: string
  email: string
  password: string
  tax: string
  cellphone: string
}

export interface CreateSubscriptionWithPendingRequest {
  pending_id: string
}

export interface SubscriptionResult {
  checkout_id?: string
  checkout_url?: string
  plan_change_scheduled?: boolean
}

export async function createSubscribeCard(
  planId: number,
  data: CreateSubscriptionRequest | CreateSubscriptionWithPendingRequest
): Promise<SubscriptionResult> {
  const response = await api.post<SubscriptionResult>(
    `/api/payments/subscribe-card/${planId}`,
    data
  )
  return response.data
}

export interface CreatePixMonthlyRequest {
  name: string
  email: string
  password: string
  tax: string
  cellphone: string
  plan_id: number
}

export interface CreatePixMonthlyAuthenticatedRequest {
  name: string
  email: string
  tax: string
  cellphone: string
  plan_id: number
}

export interface CreatePixMonthlyWithPendingRequest {
  pending_id: string
  plan_id: number
}

export interface PixMonthlyResult {
  checkout_id?: string
  qr_code: string
  qr_code_url: string
  expires_at: string
}

export async function createPixMonthly(
  data:
    | CreatePixMonthlyRequest
    | CreatePixMonthlyAuthenticatedRequest
    | CreatePixMonthlyWithPendingRequest
): Promise<PixMonthlyResult> {
  const response = await api.post<PixMonthlyResult>('/api/payments/pix-monthly', data)
  return response.data
}
