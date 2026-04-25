import { api } from '@/services/api'

export interface ValidateCheckoutResponse {
  email_exists: boolean
  tax_exists: boolean
}

export async function validateCheckout(
  email: string,
  tax?: string
): Promise<ValidateCheckoutResponse> {
  const payload: { email: string; tax?: string } = { email }
  if (tax) payload.tax = tax
  const res = await api.post<ValidateCheckoutResponse>('/api/users/validate-checkout', payload)
  return res.data
}
