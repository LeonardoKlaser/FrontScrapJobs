import { api } from './api'

export interface PublicStats {
  monitored_sites: number
  total_jobs: number
}

export const statsService = {
  getPublicStats: async (): Promise<PublicStats> => {
    const { data } = await api.get('/api/public/stats')
    return data
  }
}
