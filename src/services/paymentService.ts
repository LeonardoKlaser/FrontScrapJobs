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

export interface CardData {
  holderName: string
  cardNumber: string
  expMonth: number
  expYear: number
  cvv: string
}

export interface PagarmeTokenResponse {
  id: string
  type: string
  created_at: string
  expires_at: string
  card: {
    first_six_digits: string
    last_four_digits: string
    holder_name: string
    exp_month: number
    exp_year: number
    brand: string
  }
}

export class TokenizationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TokenizationError'
  }
}

export async function tokenizeCard(cardData: CardData): Promise<PagarmeTokenResponse> {
  const publicKey = import.meta.env.VITE_PAGARME_PUBLIC_KEY
  const url = `https://api.pagar.me/core/v5/tokens?appId=${publicKey}`

  let response: Response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'card',
        card: {
          number: cardData.cardNumber,
          holder_name: cardData.holderName,
          exp_month: cardData.expMonth,
          exp_year: cardData.expYear,
          cvv: cardData.cvv,
        },
      }),
    })
  } catch {
    throw new TokenizationError('Erro de conexão. Tente novamente.')
  }

  const body = await response.json()

  if (!response.ok) {
    const message = body?.message || body?.errors?.[0]?.message || 'Dados do cartão inválidos.'
    throw new TokenizationError(message)
  }

  return body as PagarmeTokenResponse
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
