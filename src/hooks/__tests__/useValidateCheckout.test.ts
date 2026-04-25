import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as service from '@/services/checkoutValidationService'
import { useValidateCheckout } from '@/hooks/useValidateCheckout'
import type { ReactNode } from 'react'
import { createElement } from 'react'

vi.mock('@/services/checkoutValidationService', () => ({
  validateCheckout: vi.fn()
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useValidateCheckout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls validateCheckout with email only on mutate', async () => {
    vi.mocked(service.validateCheckout).mockResolvedValue({
      email_exists: false,
      tax_exists: false
    })

    const { result } = renderHook(() => useValidateCheckout(), { wrapper: createWrapper() })

    await act(async () => {
      result.current.mutate({ email: 'novo@test.com' })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(vi.mocked(service.validateCheckout)).toHaveBeenCalledWith('novo@test.com', undefined)
  })

  it('passes tax when provided', async () => {
    vi.mocked(service.validateCheckout).mockResolvedValue({
      email_exists: false,
      tax_exists: true
    })

    const { result } = renderHook(() => useValidateCheckout(), { wrapper: createWrapper() })

    await act(async () => {
      result.current.mutate({ email: 'a@b.com', tax: '12345678901' })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(vi.mocked(service.validateCheckout)).toHaveBeenCalledWith('a@b.com', '12345678901')
    expect(result.current.data?.tax_exists).toBe(true)
  })

  it('surfaces error on service failure', async () => {
    vi.mocked(service.validateCheckout).mockRejectedValue(new Error('500'))

    const { result } = renderHook(() => useValidateCheckout(), { wrapper: createWrapper() })

    await act(async () => {
      result.current.mutate({ email: 'a@b.com' })
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
