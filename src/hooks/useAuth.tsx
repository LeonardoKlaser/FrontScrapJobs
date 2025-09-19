import { authService } from '@/services/authService'
import type { LoginInput } from '@/validators/auth'
import type { RegisterInput } from '@/validators/auth'
import axios from 'axios'
import { useState, useCallback } from 'react'

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = useCallback(async (data: LoginInput) => {
    setLoading(true)
    setError(null)
    try {
      console.log(data)

      const response = await authService.login(data);
      const { token: newToken } = response

      localStorage.setItem('token', newToken)
      setToken(newToken)
      return true
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        const msg = e.response?.data?.message ?? 'Erro desconhecido ao fazer login'
        setError(msg)
      } else if (e instanceof Error) {
        setError(e.message)
      } else {
        setError('Erro inesperado')
      }
    } finally {
      setLoading(false)
    }
  }, [])


  const register = useCallback(async (data: RegisterInput) => {
    setLoading(true)
    setError(null)
    try {
      const response = await authService.register(data)
      if(response != null) {
        console.log("deu certo")
      };

      return true
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        const msg = e.response?.data?.message ?? 'Erro desconhecido ao criar cadastro'
        setError(msg)
      } else if (e instanceof Error) {
        setError(e.message)
      } else {
        setError('Erro inesperado')
      }
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setToken(null)
  }, [])

  return { token, loading, error, login, logout, register }
}
