import { api } from './api'

// snake_case pra espelhar o JSON do backend (GET /api/digest/:token).
export interface DigestJobSnapshot {
  notification_id: number
  job_id: number | null
  title: string
  company: string
  location: string
  job_link: string
  has_analysis: boolean
  job_live: boolean
}

export interface DigestSessionResponse {
  jobs: DigestJobSnapshot[]
  norte_number?: string
  account_action?: 'login_required' | 'same_account' | 'switch_required'
}

export async function getDigestSession(token: string): Promise<DigestSessionResponse> {
  const { data } = await api.get<DigestSessionResponse>(`/api/digest/${token}`)
  return data
}
