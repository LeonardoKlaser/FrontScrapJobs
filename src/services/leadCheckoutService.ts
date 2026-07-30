import { api } from '@/services/api'

// Checkout mágico do funil de lead WhatsApp (F1): o lead recebe um link com
// token HMAC (Task 6, backend) que abre o checkout já pré-preenchido, sem
// reverificar o telefone — quem mandou a mensagem no WhatsApp já provou que
// o número é dele. Shapes espelham controller/lead_checkout_controller.go.
export interface LeadCheckoutInfo {
  name: string
  phone_masked: string
  plan: { id: number; name: string; price: number }
}

export interface LeadCheckoutCompleteRequest {
  name: string
  email: string
  password: string
  tax: string
}

export interface LeadCheckoutCompleteResult {
  action: string
  pending_id: string
}

export async function getLeadCheckout(token: string): Promise<LeadCheckoutInfo> {
  const response = await api.get<LeadCheckoutInfo>(`/api/lead-checkout/${token}`)
  return response.data
}

export async function completeLeadCheckout(
  token: string,
  data: LeadCheckoutCompleteRequest
): Promise<LeadCheckoutCompleteResult> {
  const response = await api.post<LeadCheckoutCompleteResult>(
    `/api/lead-checkout/${token}/complete`,
    data
  )
  return response.data
}
