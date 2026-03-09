import { api } from '@/services/api'

export interface PixQRCodeData {
  pix_id: string
  br_code: string
  br_code_base64: string
  expires_at: string
}

export interface CreatePaymentRequest {
  name: string
  email: string
  password: string
  tax: string
  cellphone: string
  methods: string[]
  billing_period: 'monthly' | 'quarterly'
}

export async function createPayment(
  planId: number,
  data: CreatePaymentRequest
): Promise<PixQRCodeData> {
  const response = await api.post<PixQRCodeData>(`/api/payments/create/${planId}`, data)
  return response.data
}

export async function checkPixStatus(pixId: string): Promise<string> {
  const response = await api.get<{ status: string }>(`/api/payments/pix/status/${pixId}`)
  return response.data.status
}
