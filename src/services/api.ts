import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  withCredentials: true
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
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
        window.location.href = `/login?from=${encodeURIComponent(path)}`
      }
    }
    if (
      error.response?.status === 403 &&
      error.response?.data?.error === 'subscription_expired' &&
      window.location.pathname !== '/app/renew'
    ) {
      window.location.href = '/app/renew'
    }
    return Promise.reject(error)
  }
)
