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
