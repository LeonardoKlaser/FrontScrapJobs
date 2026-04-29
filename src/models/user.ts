import type { Plan } from './plan'

export interface User {
  user_name: string
  email: string
  cellphone?: string
  tax?: string
  is_admin: boolean
  plan: Plan | undefined
  expires_at?: string
  monitored_sites_count?: number
  monthly_analysis_count?: number
  monthly_extraction_count?: number
  monthly_suggestion_apply_count?: number
  monthly_pdf_generation_count?: number
  weekdays_only?: boolean
  subscription_canceled?: boolean
  trial_ends_at?: string
  payment_method?: 'credit_card' | 'pix' | null
  is_trial_active?: boolean
  feedback_modal_shown_count?: number
  feedback_given?: boolean
}
