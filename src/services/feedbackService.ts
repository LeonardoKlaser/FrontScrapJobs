import { api } from './api'

export interface FeedbackPayload {
  rating: number
  comment?: string
  token?: string
}

export interface ValidateTokenResponse {
  user_name: string
}

export const feedbackService = {
  submit: async (payload: FeedbackPayload) => {
    const { data } = await api.post('/api/feedback', payload)
    return data
  },

  incrementModalShown: async () => {
    await api.patch('/api/feedback/modal-shown')
  },

  validateToken: async (token: string): Promise<ValidateTokenResponse> => {
    const { data } = await api.get('/api/feedback/validate', { params: { token } })
    return data
  }
}
