import axios from 'axios'

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
        '/forgot-password',
        '/reset-password',
        '/terms',
        '/privacy'
      ]
      const isPublic =
        publicPaths.some((p) => path === p) ||
        path.startsWith('/checkout/') ||
        path === '/payment-confirmation'
      if (!isPublic) {
        isRedirecting = true
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
