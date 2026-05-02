import { api } from './api'
import type { EmailLifecycleJob } from '@/models/email'

export const emailLifecycleService = {
  list: async (activeOnly = false): Promise<EmailLifecycleJob[]> => {
    const { data } = await api.get<{ jobs: EmailLifecycleJob[] }>('/api/admin/email-lifecycle', {
      params: { active: activeOnly ? 'true' : undefined }
    })
    return data.jobs
  },
  get: async (id: number): Promise<EmailLifecycleJob> => {
    const { data } = await api.get<EmailLifecycleJob>(`/api/admin/email-lifecycle/${id}`)
    return data
  },
  create: async (input: Partial<EmailLifecycleJob>): Promise<EmailLifecycleJob> => {
    const { data } = await api.post<EmailLifecycleJob>('/api/admin/email-lifecycle', input)
    return data
  },
  update: async (id: number, input: Partial<EmailLifecycleJob>): Promise<EmailLifecycleJob> => {
    const { data } = await api.patch<EmailLifecycleJob>(`/api/admin/email-lifecycle/${id}`, input)
    return data
  },
  remove: async (id: number): Promise<void> => {
    await api.delete(`/api/admin/email-lifecycle/${id}`)
  },
  runNow: async (id: number): Promise<{ message: string; task_id: string }> => {
    const { data } = await api.post(`/api/admin/email-lifecycle/${id}/run-now`)
    return data
  }
}
