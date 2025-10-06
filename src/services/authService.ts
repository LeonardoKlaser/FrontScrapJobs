import type { LoginInput } from '@/validators/auth'
import { api } from './api'
import type { RegisterInput } from '@/validators/auth'
import axios from 'axios'
import type { User } from '@/models/user'

export const authService = {
  login: async (credentials: LoginInput): Promise<{ token: string }> => {
    try{
      const { data } = await api.post('http://localhost:8080/login', credentials)
    return data
    }catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.error || 'E-mail ou senha inválidos.')
      }
      throw new Error('Não foi possível conectar ao servidor.')
    }
    
  },

  register: async (userData: RegisterInput) => {
    try{
      const { data } = await api.post('http://localhost:8080/register', userData)
    return data
    }catch (error) {
      if (axios.isAxiosError(error) && error.response) {
       throw new Error(error.response.data.error || 'Não foi possível criar a conta.')
     }
     throw new Error('Não foi possível conectar ao servidor.')
   }
    
  },

  getMe: async(): Promise<User> => {
    try{
      const {data} = await api.get('/api/me')
    return data
    }catch (error) {
      if (axios.isAxiosError(error) && error.response) {
       throw new Error(error.response.data.error || 'Não foi possível criar a conta.')
     }
     throw new Error('Não foi possível conectar ao servidor.')
   }
    
  },

  logout: async() => {
    try{
      await api.post('/api/logout')
    }catch (error) {
      if (axios.isAxiosError(error) && error.response) {
       throw new Error(error.response.data.error || 'Não foi possível criar a conta.')
     }
     throw new Error('Não foi possível conectar ao servidor.')
   } 
  }
}