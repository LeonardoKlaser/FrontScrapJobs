export interface JobApplication {
  id: number
  user_id: number
  job_id: number
  status: ApplicationStatus
  interview_round: number | null
  notes: string | null
  applied_at: string
  updated_at: string
}

export interface JobApplicationWithJob extends JobApplication {
  job: {
    title: string
    company: string
    location: string
    job_link: string
  }
}

export interface ApplicationsResponse {
  applications: JobApplicationWithJob[]
}

export type ApplicationStatus =
  | 'applied'
  | 'in_review'
  | 'technical_test'
  | 'interview'
  | 'offer'
  | 'hired'
  | 'rejected'
  | 'withdrawn'

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  'applied',
  'in_review',
  'technical_test',
  'interview',
  'offer',
  'hired',
  'rejected',
  'withdrawn'
]

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  applied: '#3b82f6',
  in_review: '#6366f1',
  technical_test: '#f59e0b',
  interview: '#10b981',
  offer: '#8b5cf6',
  hired: '#047857',
  rejected: '#ef4444',
  withdrawn: '#71717a'
}
