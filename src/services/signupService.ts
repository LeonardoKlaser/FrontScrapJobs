import { api } from './api'
import type { Plan } from '@/models/plan'

export interface SignupInitRequest {
  name: string
  phone: string
  plan_id: number
}

export interface SignupInitResponse {
  signup_session_id: string
  phone_masked: string
}

export interface SignupVerifyRequest {
  signup_session_id: string
  code: string
}

export interface SignupVerifyResponse {
  // Sucesso (200) só retorna verified:true. Erros (código inválido, sessão
  // expirada, tentativas esgotadas) vêm como HTTP não-2xx e o axios rejeita —
  // o caller lê o corpo via err.response.data, não daqui.
  verified: boolean
}

export interface SignupCompleteRequest {
  signup_session_id: string
  email: string
  password: string
  tax: string
}

export interface SignupCompleteResponse {
  action: 'payment_required'
  pending_id: string
  plan: Plan
}

export const signupService = {
  init: async (data: SignupInitRequest): Promise<SignupInitResponse> => {
    const response = await api.post<SignupInitResponse>('/signup/init', data)
    return response.data
  },

  verifyPhone: async (data: SignupVerifyRequest): Promise<SignupVerifyResponse> => {
    const response = await api.post<SignupVerifyResponse>('/signup/verify-phone', data)
    return response.data
  },

  complete: async (data: SignupCompleteRequest): Promise<SignupCompleteResponse> => {
    const response = await api.post<SignupCompleteResponse>('/signup/complete', data)
    return response.data
  }
}
