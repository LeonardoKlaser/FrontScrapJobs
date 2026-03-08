import { api } from './api'

export interface PlatformStats {
  total_sites: number
  total_jobs: number
}

export const statsService = {
  getPublicStats: async (): Promise<PlatformStats> => {
    const { data } = await api.get('/api/public/stats')
    return data
  }
}
