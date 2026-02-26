import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { siteCareerService } from '@/services/siteCareerService'
import { useAddSiteConfig } from '@/hooks/useAddSiteConfig'
import type { SiteConfigFormData } from '@/services/siteCareerService'
import type { ReactNode } from 'react'
import { createElement } from 'react'

vi.mock('@/services/siteCareerService', () => ({
  siteCareerService: {
    addSiteConfig: vi.fn()
  }
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useAddSiteConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls addSiteConfig with formData and null logo', async () => {
    vi.mocked(siteCareerService.addSiteConfig).mockResolvedValue({ id: 1 })

    const formData: SiteConfigFormData = {
      base_url: 'https://example.com',
      site_name: 'Test',
      is_active: true,
      scraping_type: 'CSS',
      job_list_item_selector: '.job',
      title_selector: '.title',
      link_selector: '.link',
      link_attribute: 'href',
      location_selector: '',
      next_page_selector: '',
      job_description_selector: '',
      job_requisition_id_selector: '',
      api_endpoint_template: '',
      api_method: '',
      api_headers_json: '',
      api_payload_template: '',
      json_data_mappings: ''
    }

    const { result } = renderHook(() => useAddSiteConfig(), { wrapper: createWrapper() })

    await act(async () => {
      result.current.mutate({ formData, logoFile: null })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(siteCareerService.addSiteConfig).toHaveBeenCalledWith(formData, null)
  })

  it('calls addSiteConfig with file', async () => {
    vi.mocked(siteCareerService.addSiteConfig).mockResolvedValue({ id: 1 })
    const file = new File(['logo'], 'logo.png', { type: 'image/png' })

    const formData: SiteConfigFormData = {
      base_url: 'https://example.com',
      site_name: 'Test',
      is_active: true,
      scraping_type: 'CSS',
      job_list_item_selector: '.job',
      title_selector: '.title',
      link_selector: '.link',
      link_attribute: 'href',
      location_selector: '',
      next_page_selector: '',
      job_description_selector: '',
      job_requisition_id_selector: '',
      api_endpoint_template: '',
      api_method: '',
      api_headers_json: '',
      api_payload_template: '',
      json_data_mappings: ''
    }

    const { result } = renderHook(() => useAddSiteConfig(), { wrapper: createWrapper() })

    await act(async () => {
      result.current.mutate({ formData, logoFile: file })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(siteCareerService.addSiteConfig).toHaveBeenCalledWith(formData, file)
  })
})
