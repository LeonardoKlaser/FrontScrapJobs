import { api } from './api'

export interface PlatformStats {
  monitored_sites: number
  total_jobs: number
}

export interface SiteLogo {
  site_name: string
  logo_url: string
}

export const statsService = {
  getPublicStats: async (): Promise<PlatformStats> => {
    const { data } = await api.get('/api/public/stats')
    return data
  },

  getPublicSiteLogos: async (): Promise<SiteLogo[]> => {
    const { data } = await api.get('/api/public/sites/logos')
    return data
  }
}
