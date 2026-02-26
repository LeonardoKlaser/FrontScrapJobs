import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { authService } from '@/services/authService'
import { useChangePassword } from '@/hooks/useChangePassword'
import type { ReactNode } from 'react'
import { createElement } from 'react'

vi.mock('@/services/authService', () => ({
  authService: {
    changePassword: vi.fn()
  }
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useChangePassword', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls changePassword on mutate', async () => {
    vi.mocked(authService.changePassword).mockResolvedValue({ success: true })

    const { result } = renderHook(() => useChangePassword(), { wrapper: createWrapper() })

    await act(async () => {
      result.current.mutate({ old_password: 'oldpass88', new_password: 'newpass88' })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(vi.mocked(authService.changePassword).mock.calls[0][0]).toEqual({
      old_password: 'oldpass88',
      new_password: 'newpass88'
    })
  })

  it('returns error on failure', async () => {
    vi.mocked(authService.changePassword).mockRejectedValue(new Error('Senha incorreta'))

    const { result } = renderHook(() => useChangePassword(), { wrapper: createWrapper() })

    await act(async () => {
      result.current.mutate({ old_password: 'wrong', new_password: 'newpass88' })
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
