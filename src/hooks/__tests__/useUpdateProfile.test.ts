import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { authService } from '@/services/authService'
import { useUpdateProfile } from '@/hooks/useUpdateProfile'
import type { ReactNode } from 'react'
import { createElement } from 'react'

vi.mock('@/services/authService', () => ({
  authService: {
    updateProfile: vi.fn()
  }
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useUpdateProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls updateProfile on mutate', async () => {
    vi.mocked(authService.updateProfile).mockResolvedValue({ success: true })

    const { result } = renderHook(() => useUpdateProfile(), { wrapper: createWrapper() })

    const data = { user_name: 'New Name', cellphone: '11999999999' }

    await act(async () => {
      result.current.mutate(data)
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(vi.mocked(authService.updateProfile).mock.calls[0][0]).toEqual(data)
  })

  it('returns error on failure', async () => {
    vi.mocked(authService.updateProfile).mockRejectedValue(new Error('Erro'))

    const { result } = renderHook(() => useUpdateProfile(), { wrapper: createWrapper() })

    await act(async () => {
      result.current.mutate({ user_name: 'Test' })
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
