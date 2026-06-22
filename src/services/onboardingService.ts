import { api } from './api'

// snake_case pra espelhar o JSON do backend (GET /api/onboarding/:token).
export interface OnboardingPreviewJob {
  id: number
  title: string
  seniority: string
  location: string
  job_link: string
}

export interface OnboardingCompany {
  site_id: number
  name: string
  logo_url: string | null
  matching_jobs_count: number
  preview_jobs: OnboardingPreviewJob[]
}

export interface OnboardingPreferences {
  area: string
  seniority: string[]
  locations: string[]
}

export interface OnboardingPageResponse {
  user_name: string
  preferences: OnboardingPreferences
  companies: OnboardingCompany[]
  plan_site_limit: number
  sites_used: number
}

export interface OnboardingSubscribeRequest {
  site_ids: number[]
}

export interface OnboardingSubscribeSkipped {
  site_id: number
  reason: string
}

export interface OnboardingSubscribeResponse {
  subscribed: Array<{ site_id: number }>
  skipped: OnboardingSubscribeSkipped[]
  sites_used: number
  sites_limit: number
}

export async function getOnboardingPage(token: string): Promise<OnboardingPageResponse> {
  const { data } = await api.get<OnboardingPageResponse>(`/api/onboarding/${token}`)
  return data
}

export async function subscribeOnboarding(
  token: string,
  payload: OnboardingSubscribeRequest
): Promise<OnboardingSubscribeResponse> {
  const { data } = await api.post<OnboardingSubscribeResponse>(
    `/api/onboarding/${token}/subscribe`,
    payload
  )
  return data
}
