import { api } from './api'

export interface AdminLead {
  id: number
  name: string
  email: string
  phone: string
  plan_id: number
  plan_name: string
  attempts: number
  last_attempt_at: string
  created_at: string
  contacted_at: string | null
}

export const adminLeadsService = {
  list: async (): Promise<AdminLead[]> => {
    const { data } = await api.get<AdminLead[]>('/api/admin/leads')
    return data
  },

  setContacted: async (id: number, contacted: boolean): Promise<void> => {
    await api.patch(`/api/admin/leads/${id}/contacted`, { contacted })
  }
}
