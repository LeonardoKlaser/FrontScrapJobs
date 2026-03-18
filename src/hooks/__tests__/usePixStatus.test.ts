import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { checkPixStatus } from '@/services/paymentService'
import { usePixStatus } from '@/hooks/usePixStatus'
import type { ReactNode } from 'react'
import { createElement } from 'react'

vi.mock('@/services/paymentService', () => ({
  checkPixStatus: vi.fn()
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('usePixStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not fetch when pixId is null', () => {
    const { result } = renderHook(() => usePixStatus(null), { wrapper: createWrapper() })

    expect(result.current.isFetching).toBe(false)
    expect(checkPixStatus).not.toHaveBeenCalled()
  })

  it('fetches status when pixId is provided', async () => {
    vi.mocked(checkPixStatus).mockResolvedValue('PENDING')

    const { result } = renderHook(() => usePixStatus('pix-123'), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(checkPixStatus).toHaveBeenCalledWith('pix-123')
    expect(result.current.data).toBe('PENDING')
  })

  it('returns PAID status correctly', async () => {
    vi.mocked(checkPixStatus).mockResolvedValue('PAID')

    const { result } = renderHook(() => usePixStatus('pix-456'), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toBe('PAID')
  })
})
