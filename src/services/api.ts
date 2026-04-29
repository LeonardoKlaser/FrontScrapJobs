import axios from 'axios'
import { toast } from 'sonner'
import i18next from 'i18next'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  withCredentials: true
})

let isRedirecting = false

// Atraso curto entre toast e redirect — 401 imediato fazia mutations em flight
// (filter preview, PIX submit) sumirem sem feedback. Tempo suficiente pro
// usuario ler o toast antes da pagina trocar.
const REDIRECT_DELAY_MS = 700

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isRedirecting) return Promise.reject(error)

    const requestUrl = error.config?.url

    if (error.response?.status === 401) {
      // Skip redirect for /api/me — the authLoader handles that
      if (requestUrl === '/api/me') {
        return Promise.reject(error)
      }
      const path = window.location.pathname
      const publicPaths = [
        '/',
        '/login',
        '/signup',
        '/forgot-password',
        '/reset-password',
        '/terms',
        '/privacy',
        '/feedback'
      ]
      const isPublic =
        publicPaths.some((p) => path === p) ||
        path.startsWith('/checkout/') ||
        path === '/payment-confirmation'
      if (!isPublic) {
        isRedirecting = true
        // i18next eh um singleton — pegamos a instancia global em vez de
        // importar de '@/i18n', que dispararia inicializacao top-level e
        // quebraria mocks parciais de react-i18next nos testes.
        const msg = i18next.isInitialized
          ? i18next.t('auth:sessionExpired')
          : 'Sessão expirada. Redirecionando para o login...'
        toast.error(msg)
        setTimeout(() => {
          window.location.href = `/login?from=${encodeURIComponent(path)}`
        }, REDIRECT_DELAY_MS)
        setTimeout(() => {
          isRedirecting = false
        }, 10000)
      }
    }
    if (
      error.response?.status === 403 &&
      error.response?.data?.error === 'subscription_expired' &&
      window.location.pathname !== '/app/renew'
    ) {
      isRedirecting = true
      window.location.href = '/app/renew'
      setTimeout(() => {
        isRedirecting = false
      }, 3000)
    }
    return Promise.reject(error)
  }
)
