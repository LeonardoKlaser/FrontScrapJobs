import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { siteCareerService } from '@/services/siteCareerService'
import { useRequestSite } from '@/hooks/useRequestSite'
import type { ReactNode } from 'react'
import { createElement } from 'react'

vi.mock('@/services/siteCareerService', () => ({
  siteCareerService: {
    requestSite: vi.fn()
  }
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useRequestSite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls requestSite on mutate', async () => {
    vi.mocked(siteCareerService.requestSite).mockResolvedValue({ success: true })

    const { result } = renderHook(() => useRequestSite(), { wrapper: createWrapper() })

    await act(async () => {
      result.current.mutate('https://careers.example.com')
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(siteCareerService.requestSite).toHaveBeenCalledWith('https://careers.example.com')
  })
})
