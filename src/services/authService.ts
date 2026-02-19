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
  },

  updateProfile: async (data: { user_name: string; cellphone?: string; tax?: string }) => {
    const { data: res } = await api.patch('/api/user/profile', data)
    return res
  },

  changePassword: async (data: { old_password: string; new_password: string }) => {
    const { data: res } = await api.post('/api/user/change-password', data)
    return res
  }
}
