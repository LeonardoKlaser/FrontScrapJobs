import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { authService } from '@/services/authService'
import { useAuth } from '@/hooks/useAuth'
import type { ReactNode } from 'react'

const mockNavigate = vi.fn()
const mockSearchParams = new URLSearchParams()
let mockSearchParamsValue = mockSearchParams

vi.mock('@/services/authService', () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn()
  }
}))

vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
  useSearchParams: () => [mockSearchParamsValue]
}))

vi.mock('@/router/paths', () => ({
  PATHS: {
    login: '/login',
    app: { home: '/app' }
  }
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchParamsValue = new URLSearchParams()
  })

  describe('login', () => {
    it('calls authService.login and navigates to /app on success', async () => {
      vi.mocked(authService.login).mockResolvedValue({ token: 'abc' })

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

      let loginResult: boolean | undefined

      await act(async () => {
        loginResult = await result.current.login({ email: 'test@email.com', password: '12345678' })
      })

      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@email.com',
        password: '12345678'
      })
      expect(loginResult).toBe(true)
      expect(mockNavigate).toHaveBeenCalledWith('/app')
    })

    it('redirects to "from" param when present and starts with /app', async () => {
      mockSearchParamsValue = new URLSearchParams('from=/app/curriculum')
      vi.mocked(authService.login).mockResolvedValue({ token: 'abc' })

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

      await act(async () => {
        await result.current.login({ email: 'test@email.com', password: '12345678' })
      })

      expect(mockNavigate).toHaveBeenCalledWith('/app/curriculum')
    })

    it('ignores "from" param that does not start with /app', async () => {
      mockSearchParamsValue = new URLSearchParams('from=/login')
      vi.mocked(authService.login).mockResolvedValue({ token: 'abc' })

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

      await act(async () => {
        await result.current.login({ email: 'test@email.com', password: '12345678' })
      })

      expect(mockNavigate).toHaveBeenCalledWith('/app')
    })

    it('sets error on login failure', async () => {
      const axiosError = Object.assign(new Error(), {
        isAxiosError: true,
        response: { data: { error: 'Credenciais inválidas' } }
      })
      const axios = await import('axios')
      vi.spyOn(axios.default, 'isAxiosError').mockReturnValue(true)

      vi.mocked(authService.login).mockRejectedValue(axiosError)

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

      let loginResult: boolean | undefined

      await act(async () => {
        loginResult = await result.current.login({
          email: 'test@email.com',
          password: 'wrongpass'
        })
      })

      expect(loginResult).toBe(false)
      expect(result.current.error).toBe('Credenciais inválidas')
    })

    it('sets loading state during login', async () => {
      let resolveLogin: (value: { token: string }) => void
      const loginPromise = new Promise<{ token: string }>((resolve) => {
        resolveLogin = resolve
      })
      vi.mocked(authService.login).mockReturnValue(loginPromise)

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

      let loginPromiseResult: Promise<boolean>

      act(() => {
        loginPromiseResult = result.current.login({
          email: 'test@email.com',
          password: '12345678'
        })
      })

      expect(result.current.loading).toBe(true)

      await act(async () => {
        resolveLogin!({ token: 'abc' })
        await loginPromiseResult!
      })

      expect(result.current.loading).toBe(false)
    })
  })

  describe('logout', () => {
    it('calls authService.logout and navigates to /login', async () => {
      vi.mocked(authService.logout).mockResolvedValue(undefined)

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

      await act(async () => {
        await result.current.logout()
      })

      expect(authService.logout).toHaveBeenCalled()
      expect(mockNavigate).toHaveBeenCalledWith('/login')
    })
  })
})
