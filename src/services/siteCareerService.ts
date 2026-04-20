import type { SiteCareer, SiteConfig, UserSiteRequest } from '@/models/siteCareer'
import { api } from './api'

export type ScrapingType = 'CSS' | 'API' | 'HEADLESS'

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
  job_requisition_id_attribute: string
  // API Configuration
  api_endpoint_template: string
  api_method: string
  api_headers_json: string
  api_payload_template: string
  json_data_mappings: string
}

export const siteCareerService = {
  getAllSiteCareer: async (): Promise<SiteCareer[]> => {
    const { data } = await api.get('/api/getSites')
    return data
  },

  addSiteConfig: async (formData: SiteConfigFormData, logoFile: File | null) => {
    const multipartData = new FormData()

    const cleanedData = Object.fromEntries(
      Object.entries(formData).map(([key, value]) => [key, value === '' ? null : value])
    )

    multipartData.append('siteData', JSON.stringify(cleanedData))

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

  getAllSitesAdmin: async (): Promise<SiteConfig[]> => {
    const { data } = await api.get('/siteCareer')
    return data
  },

  getSiteById: async (id: number): Promise<SiteConfig> => {
    const { data } = await api.get(`/siteCareer/${id}`)
    return data
  },

  updateSiteConfig: async (
    id: number,
    formData: SiteConfigFormData,
    logoFile: File | null
  ): Promise<SiteConfig> => {
    const cleanedData = Object.fromEntries(
      Object.entries(formData).map(([key, value]) => [key, value === '' ? null : value])
    )
    const multipartData = new FormData()
    multipartData.append('siteData', JSON.stringify(cleanedData))
    if (logoFile) {
      multipartData.append('logo', logoFile)
    }
    const { data } = await api.put(`/siteCareer/${id}`, multipartData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data
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
  },

  updateUserSiteFilters: async (siteId: number, targetWords: string[]): Promise<void> => {
    await api.patch(`/userSite/${siteId}`, { target_words: targetWords })
  },

  sandboxScrape: async (config: SiteConfigFormData) => {
    const cleanedData = Object.fromEntries(
      Object.entries(config).map(([key, value]) => [key, value === '' ? null : value])
    )

    const { data } = await api.post('/scrape-sandbox', cleanedData)

    return data as {
      success: boolean
      message: string
      data: Array<{
        id: number
        title: string
        location: string
        company: string
        job_link: string
        description: string
      }>
    }
  }
}
