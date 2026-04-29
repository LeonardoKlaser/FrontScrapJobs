import axios from 'axios'
import i18next from 'i18next'
import { setRedirectToast } from '@/lib/redirect-toast'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  withCredentials: true
})

let isRedirecting = false

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
        // Toast persistido em sessionStorage — Login.tsx consome ao montar.
        // Pattern anterior (toast.error + setTimeout 700ms + redirect) deixava
        // o Toaster ser destruido antes do usuario ler em redes lentas.
        setRedirectToast({ type: 'error', msg })
        window.location.href = `/login?from=${encodeURIComponent(path)}`
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
