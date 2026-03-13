export interface LatestJob {
  id: number
  title: string
  location: string
  company: string
  job_link: string
  matched: boolean
  has_analysis: boolean
  created_at?: string
}

export interface MonitoredURL {
  site_id: number
  site_name: string
  base_url: string
}

export interface DashboardData {
  monitored_urls_count: number
  new_jobs_today_count: number
  alerts_sent_count: number
  latest_jobs: LatestJob[]
  user_monitored_urls: MonitoredURL[]
}

export interface JobsResponse {
  jobs: LatestJob[]
  total_count: number
}
