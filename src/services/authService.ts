import type { LoginInput } from '@/validators/auth'
import { api } from './api'
import type { User } from '@/models/user'

export const authService = {
  login: async (credentials: LoginInput): Promise<{ token: string }> => {
    const { data } = await api.post('/login', credentials)
    return data
  },

  getMe: async (): Promise<User> => {
    const { data } = await api.get('/api/me')
    return data
  },

  logout: async () => {
    await api.post('/api/logout')
  }
}
