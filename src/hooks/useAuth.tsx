import type { LoginInput } from '@/validators/auth'
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

      await new Promise((r) => setTimeout(r, 800))
      const fakeToken = 'dummy.jwt.token'

      localStorage.setItem('token', fakeToken)
      setToken(fakeToken)
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

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setToken(null)
  }, [])

  return { token, loading, error, login, logout }
}
