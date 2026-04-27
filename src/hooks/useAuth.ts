import { PATHS } from '@/router/paths'
import { authService } from '@/services/authService'
import type { LoginInput, SignupInput } from '@/validators/auth'
import { trackTrial } from '@/lib/analytics'
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

  const signup = useCallback(
    async (data: SignupInput): Promise<boolean> => {
      setLoading(true)
      setError(null)
      try {
        await authService.signup({ email: data.email, password: data.password })
        // invalidate ANTES do trackTrial pra garantir que /api/me ja foi refetched
        // quando o evento dispara — sem isso, signup_complete pode disparar enquanto
        // /api/me ainda esta loading e o interceptor de 401 pode redirect pra /login.
        await queryClient.invalidateQueries({ queryKey: ['user'] })
        trackTrial('signup_complete')
        navigate(PATHS.app.home)
        return true
      } catch (e: unknown) {
        let reason = 'unknown'
        if (axios.isAxiosError(e)) {
          if (e.response?.status === 409) {
            setError('Este e-mail já está cadastrado. Faça login ou use outro e-mail.')
            reason = 'duplicate_email'
          } else {
            setError(e.response?.data?.error ?? 'Erro ao criar conta')
            reason = `http_${e.response?.status ?? 'network'}`
          }
        } else if (e instanceof Error) {
          setError(e.message)
          reason = 'js_error'
        } else {
          setError('Erro inesperado')
        }
        // signup_failed permite medir taxa de conversao do form (denominador
        // pra signup_complete). Sem isso, queda em signup_complete fica
        // ambígua: API quebrada ou form com problema?
        trackTrial('signup_failed', { reason })
        return false
      } finally {
        setLoading(false)
      }
    },
    [queryClient, navigate]
  )

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch (e) {
      // Logout best-effort: mesmo se backend falhar, limpamos cache + redirect
      // pra nao deixar user preso na UI authed se a chamada falhou.
      console.error('Erro ao fazer logout', e)
    } finally {
      // Sempre limpa cache + redireciona — frontend nao deve ficar em estado
      // inconsistente (tela autenticada com cookie talvez ja invalidado).
      queryClient.removeQueries({ queryKey: ['user'] })
      navigate(PATHS.login)
    }
  }, [queryClient, navigate])

  return { loading, error, login, signup, logout }
}
