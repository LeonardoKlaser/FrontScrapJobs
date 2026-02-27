import type { Plan } from './plan'

export interface User {
  id: string
  user_name: string
  email: string
  cellphone?: string
  tax?: string
  is_admin?: boolean
  plan: Plan | undefined
  expires_at?: string
  monitored_sites_count?: number
}
