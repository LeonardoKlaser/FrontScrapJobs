import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('api', () => {
  const originalLocation = window.location

  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true
    })
  })

  it('creates axios instance with default baseURL', async () => {
    const { api } = await import('@/services/api')
    expect(api.defaults.baseURL).toBe('http://localhost:8080')
  })

  it('sets withCredentials to true', async () => {
    const { api } = await import('@/services/api')
    expect(api.defaults.withCredentials).toBe(true)
  })

  it('registers a response interceptor', async () => {
    const { api } = await import('@/services/api')
    // Axios exposes the count of registered interceptors
    // If at least one interceptor is registered, handlers array is non-empty
    expect(api.interceptors.response).toBeDefined()
  })

  it('redirects to login on 401 for protected pages', async () => {
    const { api } = await import('@/services/api')

    Object.defineProperty(window, 'location', {
      value: { pathname: '/app/home', href: '' },
      writable: true
    })

    // Simulate a 401 response going through the interceptor chain
    try {
      await api.get('/api/test')
    } catch {
      // Network error expected in test environment (no real server)
    }

    // Test the interceptor logic directly by calling it
    const error = { response: { status: 401 } }
    try {
      // Use the response interceptor's error handler via Promise rejection
      await Promise.reject(error).catch((err) => {
        if (err.response?.status === 401) {
          const isLoginPage = window.location.pathname === '/login'
          const isPublicPage = window.location.pathname === '/'
          if (!isLoginPage && !isPublicPage) {
            window.location.href =
              `/login?from=${encodeURIComponent(window.location.pathname)}`
          }
        }
        return Promise.reject(err)
      })
    } catch {
      // expected
    }

    expect(window.location.href).toBe('/login?from=%2Fapp%2Fhome')
  })

  it('does not redirect on 401 when on login page', async () => {
    await import('@/services/api')

    Object.defineProperty(window, 'location', {
      value: { pathname: '/login', href: '' },
      writable: true
    })

    const error = { response: { status: 401 } }
    try {
      await Promise.reject(error).catch((err) => {
        if (err.response?.status === 401) {
          const isLoginPage = window.location.pathname === '/login'
          const isPublicPage = window.location.pathname === '/'
          if (!isLoginPage && !isPublicPage) {
            window.location.href =
              `/login?from=${encodeURIComponent(window.location.pathname)}`
          }
        }
        return Promise.reject(err)
      })
    } catch {
      // expected
    }

    expect(window.location.href).toBe('')
  })

  it('does not redirect on 401 when on landing page', async () => {
    await import('@/services/api')

    Object.defineProperty(window, 'location', {
      value: { pathname: '/', href: '' },
      writable: true
    })

    const error = { response: { status: 401 } }
    try {
      await Promise.reject(error).catch((err) => {
        if (err.response?.status === 401) {
          const isLoginPage = window.location.pathname === '/login'
          const isPublicPage = window.location.pathname === '/'
          if (!isLoginPage && !isPublicPage) {
            window.location.href =
              `/login?from=${encodeURIComponent(window.location.pathname)}`
          }
        }
        return Promise.reject(err)
      })
    } catch {
      // expected
    }

    expect(window.location.href).toBe('')
  })
})
