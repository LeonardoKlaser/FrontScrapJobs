import { PATHS } from '@/router/paths'
import { authService } from '@/services/authService'
import type { LoginInput } from '@/validators/auth'
import { useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useState, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router'

export function useAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const login = useCallback(
    async (data: LoginInput): Promise<boolean> => {
      setLoading(true)
      setError(null)
      try {
        await authService.login(data)
        await queryClient.invalidateQueries({ queryKey: ['user'] })
        const redirectTo = searchParams.get('from')
        navigate(redirectTo && redirectTo.startsWith('/app') ? redirectTo : PATHS.app.home)
        return true
      } catch (e: unknown) {
        if (axios.isAxiosError(e)) {
          setError(e.response?.data?.error ?? 'E-mail ou senha inválidos')
        } else if (e instanceof Error) {
          setError(e.message)
        } else {
          setError('Erro inesperado')
        }
        return false
      } finally {
        setLoading(false)
      }
    },
    [queryClient, navigate, searchParams]
  )

  const logout = useCallback(async () => {
    try {
      await authService.logout()
      await queryClient.invalidateQueries({ queryKey: ['user'] })
      navigate(PATHS.login)
    } catch (e) {
      console.error('Erro ao fazer logout', e)
    }
  }, [queryClient, navigate])

  return { loading, error, login, logout }
}
