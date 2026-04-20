import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { siteCareerService } from '@/services/siteCareerService'
import { useSiteCareer, useAdminSites, useSite, useUpdateSiteConfig } from '@/hooks/useSiteCareer'
import type { SiteCareer, SiteConfig } from '@/models/siteCareer'
import type { ReactNode } from 'react'
import { createElement } from 'react'

vi.mock('@/services/siteCareerService', () => ({
  siteCareerService: {
    getAllSiteCareer: vi.fn(),
    getAllSitesAdmin: vi.fn(),
    getSiteById: vi.fn(),
    updateSiteConfig: vi.fn()
  }
}))

function createWrapperAndClient() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
  return { queryClient, wrapper }
}

describe('useSiteCareer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches site career list', async () => {
    const mockSites = [
      {
        site_id: 1,
        site_name: 'Example Corp',
        base_url: 'https://example.com',
        logo_url: '',
        is_subscribed: false
      }
    ]
    vi.mocked(siteCareerService.getAllSiteCareer).mockResolvedValue(mockSites as SiteCareer[])

    const { wrapper } = createWrapperAndClient()
    const { result } = renderHook(() => useSiteCareer(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockSites)
  })

  it('returns error on failure', async () => {
    vi.mocked(siteCareerService.getAllSiteCareer).mockRejectedValue(new Error('Erro'))

    const { wrapper } = createWrapperAndClient()
    const { result } = renderHook(() => useSiteCareer(), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useAdminSites', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls getAllSitesAdmin and caches under ["adminSites"]', async () => {
    const mock = [{ id: 1, site_name: 'A' }]
    vi.mocked(siteCareerService.getAllSitesAdmin).mockResolvedValue(mock as SiteConfig[])

    const { queryClient, wrapper } = createWrapperAndClient()
    const { result } = renderHook(() => useAdminSites(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(siteCareerService.getAllSitesAdmin).toHaveBeenCalledTimes(1)
    expect(queryClient.getQueryData(['adminSites'])).toEqual(mock)
  })
})

describe('useSite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('is disabled when id is NaN', () => {
    const { wrapper } = createWrapperAndClient()
    const { result } = renderHook(() => useSite(Number.NaN), { wrapper })
    // Query is disabled -> fetchStatus idle, no call.
    expect(siteCareerService.getSiteById).not.toHaveBeenCalled()
    expect(result.current.fetchStatus).toBe('idle')
  })

  it('is disabled when id <= 0', () => {
    const { wrapper } = createWrapperAndClient()
    renderHook(() => useSite(0), { wrapper })
    expect(siteCareerService.getSiteById).not.toHaveBeenCalled()
  })

  it('fetches and caches under ["site", id] for positive id', async () => {
    const mock = { id: 57, site_name: 'Netflix' }
    vi.mocked(siteCareerService.getSiteById).mockResolvedValue(mock as SiteConfig)

    const { queryClient, wrapper } = createWrapperAndClient()
    const { result } = renderHook(() => useSite(57), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(siteCareerService.getSiteById).toHaveBeenCalledWith(57)
    expect(queryClient.getQueryData(['site', 57])).toEqual(mock)
  })
})

describe('useUpdateSiteConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('invalidates adminSites, siteCareerList, site[id], public-site-logos on success', async () => {
    vi.mocked(siteCareerService.updateSiteConfig).mockResolvedValue({ id: 57 } as SiteConfig)

    const { queryClient, wrapper } = createWrapperAndClient()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useUpdateSiteConfig(), { wrapper })

    await result.current.mutateAsync({
      id: 57,
      formData: {
        site_name: 'Netflix',
        base_url: 'https://netflix.com',
        is_active: true,
        scraping_type: 'API',
        job_list_item_selector: '',
        title_selector: '',
        link_selector: '',
        link_attribute: '',
        location_selector: '',
        next_page_selector: '',
        job_description_selector: '',
        job_requisition_id_selector: '',
        job_requisition_id_attribute: '',
        api_endpoint_template: '',
        api_method: 'GET',
        api_headers_json: '',
        api_payload_template: '',
        json_data_mappings: ''
      },
      logoFile: null
    })

    const keys = invalidateSpy.mock.calls.map((c) => c[0]?.queryKey)
    expect(keys).toContainEqual(['adminSites'])
    expect(keys).toContainEqual(['siteCareerList'])
    expect(keys).toContainEqual(['site', 57])
    expect(keys).toContainEqual(['public-site-logos'])
  })
})
