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
        // clear() wipa TUDO: ['dashboardData'], ['latestJobs'], ['applications']
        // etc. Sem isso, dashboard mostra dados do user anterior em cache até o
        // refetch responder — abre janela pra vazamento entre sessões no mesmo
        // browser. authLoader faz fetchQuery(['user']) na navegação seguinte.
        queryClient.clear()
        const redirectTo = searchParams.get('from')
        // Decode primeiro pra validar; navega usando a forma decoded (a validacao
        // tem que casar com o que e navegado, senao paths duplo-encoded passam
        // a validacao mas levam pra rota quebrada).
        let decoded: string | null = null
        if (redirectTo) {
          try {
            decoded = decodeURIComponent(redirectTo)
          } catch {
            decoded = null
          }
        }
        const isAllowed = (path: string | null): path is string => {
          if (!path) return false
          // Anti-bypass: //evil.com (protocol-relative), \evil.com (algumas
          // browsers normalizam pra /), foo@evil.com (URL com userinfo).
          if (path.includes('//') || path.includes('\\') || path.includes('@')) {
            return false
          }
          return (
            path.startsWith('/app') ||
            path.startsWith('/checkout/') ||
            path === '/payment-confirmation'
          )
        }
        navigate(isAllowed(decoded) ? decoded : PATHS.app.home)
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
        // clear() wipa cache do user anterior (caso alguém crie conta nova com
        // outro user logado no mesmo browser — cenário comum: dev/QA testando).
        // authLoader vai fetchQuery(['user']) na navegação pra /app, então o
        // /api/me da conta nova ja entra sem race com o cache antigo.
        queryClient.clear()
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
      // clear() (não removeQueries(['user'])) — ['user'] sozinho deixava
      // ['dashboardData'], ['latestJobs'], ['applications'] etc. em cache,
      // que vazavam pro próximo login no mesmo browser. Frontend não deve
      // ficar em estado inconsistente (tela authed com cookie já invalidado).
      queryClient.clear()
      navigate(PATHS.login)
    }
  }, [queryClient, navigate])

  return { loading, error, login, signup, logout }
}
