import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { siteCareerService } from '@/services/siteCareerService'
import { useSiteCareer } from '@/hooks/useSiteCareer'
import type { SiteCareer } from '@/models/siteCareer'
import type { ReactNode } from 'react'
import { createElement } from 'react'

vi.mock('@/services/siteCareerService', () => ({
  siteCareerService: {
    getAllSiteCareer: vi.fn()
  }
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useSiteCareer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches site career list', async () => {
    const mockSites = [{ id: 1, site_name: 'Example Corp' }]
    vi.mocked(siteCareerService.getAllSiteCareer).mockResolvedValue(mockSites as SiteCareer[])

    const { result } = renderHook(() => useSiteCareer(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockSites)
  })

  it('returns error on failure', async () => {
    vi.mocked(siteCareerService.getAllSiteCareer).mockRejectedValue(new Error('Erro'))

    const { result } = renderHook(() => useSiteCareer(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
