import { vi } from 'vitest'
import { api } from '@/services/api'
import { siteCareerService } from '@/services/siteCareerService'
import type { SiteConfigFormData } from '@/services/siteCareerService'
import type { UserSiteRequest } from '@/models/siteCareer'

vi.mock('@/services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  }
}))

const mockFormData: SiteConfigFormData = {
  base_url: 'https://careers.example.com',
  site_name: 'Example Corp',
  is_active: true,
  scraping_type: 'CSS',
  job_list_item_selector: '.job-item',
  title_selector: '.title',
  link_selector: '.link',
  link_attribute: 'href',
  location_selector: '.location',
  next_page_selector: '.next',
  job_description_selector: '.desc',
  job_requisition_id_selector: '.req-id',
  api_endpoint_template: '',
  api_method: '',
  api_headers_json: '',
  api_payload_template: '',
  json_data_mappings: ''
}

describe('siteCareerService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllSiteCareer', () => {
    it('sends GET /api/getSites and returns sites', async () => {
      const mockSites = [{ id: 1, site_name: 'Example' }]
      vi.mocked(api.get).mockResolvedValue({ data: mockSites })

      const result = await siteCareerService.getAllSiteCareer()

      expect(api.get).toHaveBeenCalledWith('/api/getSites')
      expect(result).toEqual(mockSites)
    })
  })

  describe('addSiteConfig', () => {
    it('sends POST /siteCareer with FormData', async () => {
      vi.mocked(api.post).mockResolvedValue({ data: { id: 1 } })

      const result = await siteCareerService.addSiteConfig(mockFormData, null)

      expect(api.post).toHaveBeenCalledWith('/siteCareer', expect.any(FormData), {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      expect(result).toEqual({ id: 1 })
    })

    it('appends logo file when provided', async () => {
      vi.mocked(api.post).mockResolvedValue({ data: { id: 1 } })
      const file = new File(['logo'], 'logo.png', { type: 'image/png' })

      await siteCareerService.addSiteConfig(mockFormData, file)

      const sentFormData = vi.mocked(api.post).mock.calls[0][1] as FormData
      expect(sentFormData.get('logo')).toBeTruthy()
      expect(sentFormData.get('siteData')).toBe(JSON.stringify(mockFormData))
    })
  })

  describe('requestSite', () => {
    it('sends POST /api/request-site with url', async () => {
      vi.mocked(api.post).mockResolvedValue({ data: { success: true } })

      const result = await siteCareerService.requestSite('https://careers.example.com')

      expect(api.post).toHaveBeenCalledWith('/api/request-site', {
        url: 'https://careers.example.com'
      })
      expect(result).toEqual({ success: true })
    })
  })

  describe('registerUserSite', () => {
    it('sends POST /userSite with request data', async () => {
      const request: UserSiteRequest = { site_id: 1, target_words: ['developer'] }
      vi.mocked(api.post).mockResolvedValue({ data: { id: 1 } })

      const result = await siteCareerService.registerUserSite(request)

      expect(api.post).toHaveBeenCalledWith('/userSite', request)
      expect(result).toEqual({ id: 1 })
    })
  })

  describe('unregisterUserFromSite', () => {
    it('sends DELETE /userSite/:id', async () => {
      vi.mocked(api.delete).mockResolvedValue({})

      await siteCareerService.unregisterUserFromSite(42)

      expect(api.delete).toHaveBeenCalledWith('/userSite/42')
    })
  })
})
