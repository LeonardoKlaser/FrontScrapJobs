import { api } from './api'

export interface AdminDashboardData {
  total_revenue: number
  active_users: number
  monitored_sites: number
  scraping_errors: number
}

export const adminDashboardService = {
  getDashboard: async (): Promise<AdminDashboardData> => {
    const { data } = await api.get('/api/admin/dashboard')
    return data
  }
}
