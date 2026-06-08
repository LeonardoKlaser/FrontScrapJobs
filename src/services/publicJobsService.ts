import { api } from './api'

export type AreaValue = 'dev' | 'produto' | 'design' | 'dados' | 'infra'

export interface RecentJob {
  title: string
  company: string
  logo_url: string
  posted_hours_ago: number
}

export interface RecentJobsResponse {
  jobs: RecentJob[]
  today_count: number
}

export const publicJobsService = {
  getRecentJobs: async (area: AreaValue): Promise<RecentJobsResponse> => {
    const { data } = await api.get('/api/public/jobs/recent', {
      params: { area },
      timeout: 4000
    })
    return data
  }
}
