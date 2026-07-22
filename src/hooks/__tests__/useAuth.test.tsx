import { act, renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useSearchParams } from 'react-router'
import { authService } from '@/services/authService'
import { useAuth } from '@/hooks/useAuth'

const navigate = vi.fn()

vi.mock('@/services/authService', () => ({
  authService: { login: vi.fn(), logout: vi.fn() }
}))
vi.mock('react-router', () => ({
  useNavigate: () => navigate,
  useSearchParams: vi.fn()
}))

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return { queryClient, wrapper }
}

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useSearchParams).mockReturnValue([new URLSearchParams(), vi.fn()])
  })

  it('faz login, limpa caches da sessão anterior e navega para o app', async () => {
    const { queryClient, wrapper } = setup()
    queryClient.setQueryData(['dashboardData'], { jobs: 3 })
    vi.mocked(authService.login).mockResolvedValue({
      id: 1,
      user_name: 'Billing Fixture',
      email: 'billing-fixture@example.test',
      is_admin: false
    })
    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      expect(
        await result.current.login({
          email: 'billing-fixture@example.test',
          password: 'fixture-password'
        })
      ).toBe(true)
    })

    expect(queryClient.getQueryData(['dashboardData'])).toBeUndefined()
    expect(navigate).toHaveBeenCalledWith('/app')
  })

  it('faz logout mesmo quando a chamada remota falha', async () => {
    const { queryClient, wrapper } = setup()
    queryClient.setQueryData(['user'], {
      email: 'billing-fixture@example.test'
    })
    vi.mocked(authService.logout).mockRejectedValue(new Error('network'))
    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => result.current.logout())

    expect(queryClient.getQueryData(['user'])).toBeUndefined()
    expect(navigate).toHaveBeenCalledWith('/login')
  })

  it('navega para o digest decodificado depois do login', async () => {
    vi.mocked(useSearchParams).mockReturnValue([
      new URLSearchParams('from=%2Fd%2Fdigest-token'),
      vi.fn()
    ])
    const { wrapper } = setup()
    vi.mocked(authService.login).mockResolvedValue({
      id: 1,
      user_name: 'Billing Fixture',
      email: 'billing-fixture@example.test',
      is_admin: false
    })
    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.login({
        email: 'billing-fixture@example.test',
        password: 'fixture-password'
      })
    })

    expect(navigate).toHaveBeenCalledWith('/d/digest-token')
  })
})
