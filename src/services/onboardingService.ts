import axios from 'axios'
import { api } from './api'

export class OnboardingExpiredError extends Error {
  constructor() {
    super('expired')
    this.name = 'OnboardingExpiredError'
  }
}

export class OnboardingLimitExceededError extends Error {
  sitesLimit: number
  sitesUsed: number
  constructor(sitesLimit: number, sitesUsed: number) {
    super('limit_exceeded')
    this.name = 'OnboardingLimitExceededError'
    this.sitesLimit = sitesLimit
    this.sitesUsed = sitesUsed
  }
}

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
  area: string[]
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
  try {
    const { data } = await api.get<OnboardingPageResponse>(`/api/onboarding/${token}`)
    return data
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      throw new OnboardingExpiredError()
    }
    throw err
  }
}

export async function subscribeOnboarding(
  token: string,
  payload: OnboardingSubscribeRequest
): Promise<OnboardingSubscribeResponse> {
  try {
    const { data } = await api.post<OnboardingSubscribeResponse>(
      `/api/onboarding/${token}/subscribe`,
      payload
    )
    return data
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 422) {
      const body = err.response.data as { sites_limit?: number; sites_used?: number }
      throw new OnboardingLimitExceededError(body.sites_limit ?? 0, body.sites_used ?? 0)
    }
    throw err
  }
}

export async function completeWebOnboarding(): Promise<void> {
  await api.post('/api/user/onboarding/complete')
}
