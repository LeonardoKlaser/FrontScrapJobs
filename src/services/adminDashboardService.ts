import { api } from './api'

export interface ScrapingError {
  id: number
  site_name: string
  error_message: string
  created_at: string
}

export interface AdminDashboardData {
  total_revenue: number
  active_users: number
  monitored_sites: number
  scraping_errors: number
  recent_errors: ScrapingError[] | null
}

export const adminDashboardService = {
  getDashboard: async (): Promise<AdminDashboardData> => {
    const { data } = await api.get('/api/admin/dashboard')
    return data
  }
}

export interface EmailProviderConfig {
  id: number
  provider_name: string
  is_active: boolean
  priority: number
  updated_at: string
  updated_by: number | null
}

export interface UpdateEmailConfigPayload {
  providers: {
    provider_name: string
    is_active: boolean
    priority: number
  }[]
}

export const emailConfigService = {
  getConfig: async (): Promise<EmailProviderConfig[]> => {
    const { data } = await api.get('/api/admin/email-config')
    return data
  },

  updateConfig: async (payload: UpdateEmailConfigPayload): Promise<void> => {
    await api.put('/api/admin/email-config', payload)
  }
}
