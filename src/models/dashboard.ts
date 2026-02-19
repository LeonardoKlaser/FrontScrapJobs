export interface LatestJob {
  id: number
  title: string
  location: string
  company: string
  job_link: string
}

export interface MonitoredURL {
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
