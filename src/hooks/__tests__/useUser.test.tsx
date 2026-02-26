import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { authService } from '@/services/authService'
import { useUser } from '@/hooks/useUser'
import type { User } from '@/models/user'
import type { ReactNode } from 'react'

vi.mock('@/services/authService', () => ({
  authService: {
    getMe: vi.fn()
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

describe('useUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns user data on success', async () => {
    const mockUser = { id: 1, user_name: 'Test', email: 'test@email.com' }
    vi.mocked(authService.getMe).mockResolvedValue(mockUser as User)

    const { result } = renderHook(() => useUser(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockUser)
    expect(authService.getMe).toHaveBeenCalledOnce()
  })

  it('returns error state on failure', async () => {
    vi.mocked(authService.getMe).mockRejectedValue(new Error('Unauthorized'))

    const { result } = renderHook(() => useUser(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toBeDefined()
  })

  it('starts in loading state', () => {
    vi.mocked(authService.getMe).mockReturnValue(new Promise(() => {}))

    const { result } = renderHook(() => useUser(), { wrapper: createWrapper() })

    expect(result.current.isLoading).toBe(true)
  })
})
