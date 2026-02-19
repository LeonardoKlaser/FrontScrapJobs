import type { Plan } from './plan'

export interface User {
  id: string
  user_name: string
  email: string
  plan: Plan | undefined
}
