import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import { api } from '@/services/api'

describe('api', () => {
  let mock: MockAdapter
  const originalLocation = window.location

  beforeEach(() => {
    vi.useFakeTimers()
    mock = new MockAdapter(api)
    Object.defineProperty(window, 'location', {
      value: { pathname: '/app/home', href: '' },
      writable: true,
      configurable: true
    })
  })

  afterEach(() => {
    mock.restore()
    // Flush pending isRedirecting timeouts before switching to real timers
    vi.advanceTimersByTime(15_000)
    vi.useRealTimers()
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true
    })
    vi.restoreAllMocks()
  })

  it('creates axios instance with default baseURL', () => {
    expect(api.defaults.baseURL).toBe('http://localhost:8080')
  })

  it('sets withCredentials to true', () => {
    expect(api.defaults.withCredentials).toBe(true)
  })

  it('redirects to login on 401 for protected pages', async () => {
    mock.onGet('/api/test').reply(401)

    await expect(api.get('/api/test')).rejects.toThrow()

    expect(window.location.href).toBe('/login?from=%2Fapp%2Fhome')
  })

  it('does not redirect on 401 when on login page', async () => {
    window.location.pathname = '/login'
    mock.onGet('/api/test').reply(401)

    await expect(api.get('/api/test')).rejects.toThrow()

    expect(window.location.href).toBe('')
  })

  it('does not redirect on 401 when on landing page', async () => {
    window.location.pathname = '/'
    mock.onGet('/api/test').reply(401)

    await expect(api.get('/api/test')).rejects.toThrow()

    expect(window.location.href).toBe('')
  })

  it('does not redirect on 401 for /api/me endpoint', async () => {
    mock.onGet('/api/me').reply(401)

    await expect(api.get('/api/me')).rejects.toThrow()

    expect(window.location.href).toBe('')
  })

  it('does not redirect on 401 for public paths', async () => {
    const publicPaths = ['/forgot-password', '/reset-password', '/terms', '/privacy']
    for (const path of publicPaths) {
      window.location.pathname = path
      window.location.href = ''
      mock.onGet('/api/test').reply(401)

      await expect(api.get('/api/test')).rejects.toThrow()

      expect(window.location.href).toBe('')
      mock.reset()
    }
  })

  it('redirects to /app/renew on 403 subscription_expired', async () => {
    mock.onGet('/api/test').reply(403, { error: 'subscription_expired' })

    await expect(api.get('/api/test')).rejects.toThrow()

    expect(window.location.href).toBe('/app/renew')
  })

  it('does not redirect to /app/renew if already on that page', async () => {
    window.location.pathname = '/app/renew'
    mock.onGet('/api/test').reply(403, { error: 'subscription_expired' })

    await expect(api.get('/api/test')).rejects.toThrow()

    expect(window.location.href).toBe('')
  })

  it('resets isRedirecting after timeout (C10 fix)', async () => {
    mock.onGet('/api/first').reply(401)
    mock.onGet('/api/second').reply(401)

    // First 401 triggers redirect
    await expect(api.get('/api/first')).rejects.toThrow()
    expect(window.location.href).toBe('/login?from=%2Fapp%2Fhome')

    // Reset href to detect if second request triggers a new redirect
    window.location.href = ''

    // Second 401 while isRedirecting=true should NOT redirect
    await expect(api.get('/api/second')).rejects.toThrow()
    expect(window.location.href).toBe('')

    // After timeout, isRedirecting resets -- next 401 should redirect again
    vi.advanceTimersByTime(10_000)
    window.location.href = ''

    await expect(api.get('/api/first')).rejects.toThrow()
    expect(window.location.href).toBe('/login?from=%2Fapp%2Fhome')
  })
})
