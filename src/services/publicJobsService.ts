import { api } from './api'

export interface RecentJob {
  title: string
  company: string
  logo_url: string
  posted_hours_ago: number
}

export interface PublicRecentJobs {
  jobs: RecentJob[]
  today_count: number
}

export const publicJobsService = {
  getRecentJobs: async (area: string): Promise<PublicRecentJobs> => {
    const { data } = await api.get('/api/public/jobs/recent', { params: { area } })
    return data
  }
}
