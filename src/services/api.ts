import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  withCredentials: true
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isLoginPage = window.location.pathname === '/login'
      const isPublicPage = window.location.pathname === '/'
      if (!isLoginPage && !isPublicPage) {
        window.location.href = `/login?from=${encodeURIComponent(window.location.pathname)}`
      }
    }
    return Promise.reject(error)
  }
)
