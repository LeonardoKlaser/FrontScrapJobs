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
    logout: vi.fn(),
    signup: vi.fn()
  }
}))

vi.mock('@/lib/analytics', () => ({
  trackTrial: vi.fn()
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
      const mockLoginResponse = {
        id: 1,
        user_name: 'Test',
        email: 'test@email.com',
        is_admin: false
      }
      vi.mocked(authService.login).mockResolvedValue(mockLoginResponse)

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
      vi.mocked(authService.login).mockResolvedValue({
        id: 1,
        user_name: 'Test',
        email: 'test@email.com',
        is_admin: false
      })

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

      await act(async () => {
        await result.current.login({ email: 'test@email.com', password: '12345678' })
      })

      expect(mockNavigate).toHaveBeenCalledWith('/app/curriculum')
    })

    it('ignores "from" param that does not start with /app', async () => {
      mockSearchParamsValue = new URLSearchParams('from=/login')
      vi.mocked(authService.login).mockResolvedValue({
        id: 1,
        user_name: 'Test',
        email: 'test@email.com',
        is_admin: false
      })

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
      type LoginResponse = {
        id: number
        user_name: string
        email: string
        cellphone?: string
        is_admin: boolean
      }
      let resolveLogin: (value: LoginResponse) => void
      const loginPromise = new Promise<LoginResponse>((resolve) => {
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
        resolveLogin!({ id: 1, user_name: 'Test', email: 'test@email.com', is_admin: false })
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

  describe('signup', () => {
    it('calls authService.signup with email/password and navigates to /app', async () => {
      const mockSignupResponse = {
        id: 42,
        user_name: 'NewUser',
        email: 'new@trial.com'
      }
      vi.mocked(authService.signup).mockResolvedValue(mockSignupResponse)

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

      let signupResult: boolean | undefined
      await act(async () => {
        signupResult = await result.current.signup({
          email: 'new@trial.com',
          password: '12345678',
          confirmPassword: '12345678'
        })
      })

      // confirmPassword nao deve ser enviado pra API
      expect(authService.signup).toHaveBeenCalledWith({
        email: 'new@trial.com',
        password: '12345678'
      })
      expect(signupResult).toBe(true)
      expect(mockNavigate).toHaveBeenCalledWith('/app')
    })

    it('fires trackTrial("signup_complete") on success', async () => {
      const { trackTrial } = await import('@/lib/analytics')
      vi.mocked(authService.signup).mockResolvedValue({
        id: 1,
        user_name: 'X',
        email: 'x@y.com'
      })

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

      await act(async () => {
        await result.current.signup({
          email: 'x@y.com',
          password: '12345678',
          confirmPassword: '12345678'
        })
      })

      expect(vi.mocked(trackTrial)).toHaveBeenCalledWith('signup_complete')
    })

    it('sets specific error on 409 conflict (duplicate email)', async () => {
      const axiosError = Object.assign(new Error(), {
        isAxiosError: true,
        response: { status: 409, data: { error: 'Este email ja esta cadastrado' } }
      })
      const axios = await import('axios')
      vi.spyOn(axios.default, 'isAxiosError').mockReturnValue(true)

      vi.mocked(authService.signup).mockRejectedValue(axiosError)

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

      let signupResult: boolean | undefined
      await act(async () => {
        signupResult = await result.current.signup({
          email: 'exists@test.com',
          password: '12345678',
          confirmPassword: '12345678'
        })
      })

      expect(signupResult).toBe(false)
      expect(result.current.error).toBe(
        'Este e-mail já está cadastrado. Faça login ou use outro e-mail.'
      )
    })

    it('sets generic error on non-409 axios error', async () => {
      const axiosError = Object.assign(new Error(), {
        isAxiosError: true,
        response: { status: 500, data: { error: 'Erro ao processar cadastro' } }
      })
      const axios = await import('axios')
      vi.spyOn(axios.default, 'isAxiosError').mockReturnValue(true)

      vi.mocked(authService.signup).mockRejectedValue(axiosError)

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

      await act(async () => {
        await result.current.signup({
          email: 'x@y.com',
          password: '12345678',
          confirmPassword: '12345678'
        })
      })

      expect(result.current.error).toBe('Erro ao processar cadastro')
    })

    it('does not fire signup_complete on signup failure', async () => {
      const { trackTrial } = await import('@/lib/analytics')
      vi.mocked(trackTrial).mockClear()

      vi.mocked(authService.signup).mockRejectedValue(new Error('boom'))

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

      await act(async () => {
        await result.current.signup({
          email: 'x@y.com',
          password: '12345678',
          confirmPassword: '12345678'
        })
      })

      // signup_complete NUNCA dispara em falha; signup_failed dispara pra dar
      // denominador de conversao do form.
      expect(vi.mocked(trackTrial)).not.toHaveBeenCalledWith('signup_complete')
      expect(vi.mocked(trackTrial)).toHaveBeenCalledWith('signup_failed', expect.any(Object))
    })

    it('sets loading state during signup', async () => {
      type SignupResponse = { id: number; user_name: string; email: string }
      let resolveSignup: (value: SignupResponse) => void
      const signupPromise = new Promise<SignupResponse>((resolve) => {
        resolveSignup = resolve
      })
      vi.mocked(authService.signup).mockReturnValue(signupPromise)

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

      let signupPromiseResult: Promise<boolean>
      act(() => {
        signupPromiseResult = result.current.signup({
          email: 'x@y.com',
          password: '12345678',
          confirmPassword: '12345678'
        })
      })

      expect(result.current.loading).toBe(true)

      await act(async () => {
        resolveSignup!({ id: 1, user_name: 'X', email: 'x@y.com' })
        await signupPromiseResult!
      })

      expect(result.current.loading).toBe(false)
    })
  })
})
