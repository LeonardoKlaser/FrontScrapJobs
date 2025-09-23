import { PATHS } from '@/router/paths'
import { authService } from '@/services/authService'
import type { LoginInput } from '@/validators/auth'
import type { RegisterInput } from '@/validators/auth'
import { useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router'

export function useAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const login = useCallback(async (data: LoginInput) => {
    setLoading(true)
    setError(null)
    try {
      await authService.login(data);
      await queryClient.invalidateQueries({ queryKey: ['user'] })
      navigate(PATHS.app.home)

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
  }, [queryClient, navigate])


  const register = useCallback(async (data: RegisterInput) => {
    setLoading(true)
    setError(null)
    try {
      await authService.register(data)

      await queryClient.invalidateQueries({ queryKey: ['user'] })
      navigate(PATHS.app.home)
      return true

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
  }, [queryClient, navigate])

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      await queryClient.invalidateQueries({ queryKey: ['user'] });
      navigate(PATHS.login)
    } catch (e) {
      console.error("Erro ao fazer logout", e)
    }
  }, [queryClient, navigate])

  return {loading, error, login, logout, register }
}
