import type { SiteCareer, UserSiteRequest } from '@/models/siteCareer'
import { api } from './api'

export type ScrapingType = 'CSS' | 'API'

export interface SiteConfigFormData {
  base_url: string
  site_name: string
  is_active: boolean
  scraping_type: ScrapingType
  // CSS Selectors
  job_list_item_selector: string
  title_selector: string
  link_selector: string
  link_attribute: string
  location_selector: string
  next_page_selector: string
  job_description_selector: string
  job_requisition_id_selector: string
  // API Configuration
  api_endpoint_template: string
  api_method: string
  api_headers_json: string
  api_payload_template: string
  json_data_mappings: string
}

export const SiteCareerService = {
  getAllSiteCareer: async (): Promise<SiteCareer[]> => {
    const { data } = await api.get('/api/getSites')
    return data
  },

  addSiteConfig: async (formData: SiteConfigFormData, logoFile: File | null) => {
    const multipartData = new FormData()
    multipartData.append('siteData', JSON.stringify(formData))

    if (logoFile) {
      multipartData.append('logo', logoFile)
    }

    const response = await api.post('/siteCareer', multipartData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    return response.data
  },

  requestSite: async (url: string) => {
    const { data } = await api.post('/api/request-site', { url })
    return data
  },

  registerUserSite: async (request: UserSiteRequest) => {
    const { data } = await api.post('/userSite', request)
    return data
  },

  unregisterUserFromSite: async (siteId: number): Promise<void> => {
    await api.delete(`/userSite/${siteId}`)
  }
}
