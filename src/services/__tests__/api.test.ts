import { describe, it, expect, vi, beforeEach } from 'vitest'

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

  it('redirects to login on 401 for protected pages', async () => {
    const { api } = await import('@/services/api')

    Object.defineProperty(window, 'location', {
      value: { pathname: '/app/home', href: '' },
      writable: true
    })

    const interceptor = api.interceptors.response['handlers'][0]
    const error = {
      response: { status: 401 }
    }

    try {
      await interceptor.rejected(error)
    } catch {
      // expected rejection
    }

    expect(window.location.href).toBe('/login?from=%2Fapp%2Fhome')
  })

  it('does not redirect on 401 when on login page', async () => {
    const { api } = await import('@/services/api')

    Object.defineProperty(window, 'location', {
      value: { pathname: '/login', href: '' },
      writable: true
    })

    const interceptor = api.interceptors.response['handlers'][0]
    const error = {
      response: { status: 401 }
    }

    try {
      await interceptor.rejected(error)
    } catch {
      // expected rejection
    }

    expect(window.location.href).toBe('')
  })

  it('does not redirect on 401 when on landing page', async () => {
    const { api } = await import('@/services/api')

    Object.defineProperty(window, 'location', {
      value: { pathname: '/', href: '' },
      writable: true
    })

    const interceptor = api.interceptors.response['handlers'][0]
    const error = {
      response: { status: 401 }
    }

    try {
      await interceptor.rejected(error)
    } catch {
      // expected rejection
    }

    expect(window.location.href).toBe('')
  })
})
