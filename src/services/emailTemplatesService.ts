import { api } from './api'
import type { EmailTemplate, RenderedEmail } from '@/models/email'

export const emailTemplatesService = {
  list: async (activeOnly = false): Promise<EmailTemplate[]> => {
    const { data } = await api.get<{ templates: EmailTemplate[] }>('/api/admin/email-templates', {
      params: { active: activeOnly ? 'true' : undefined }
    })
    return data.templates
  },
  get: async (id: number): Promise<EmailTemplate> => {
    const { data } = await api.get<EmailTemplate>(`/api/admin/email-templates/${id}`)
    return data
  },
  create: async (input: Partial<EmailTemplate>): Promise<EmailTemplate> => {
    const { data } = await api.post<EmailTemplate>('/api/admin/email-templates', input)
    return data
  },
  update: async (id: number, input: Partial<EmailTemplate>): Promise<EmailTemplate> => {
    const { data } = await api.patch<EmailTemplate>(`/api/admin/email-templates/${id}`, input)
    return data
  },
  remove: async (id: number): Promise<void> => {
    await api.delete(`/api/admin/email-templates/${id}`)
  },
  preview: async (id: number, samplePayload?: Record<string, unknown>): Promise<RenderedEmail> => {
    const body = samplePayload ? { sample_payload: samplePayload } : {}
    const { data } = await api.post<RenderedEmail>(`/api/admin/email-templates/${id}/preview`, body)
    return data
  },
  testSend: async (
    id: number
  ): Promise<{ message: string; recipient: string; sent_at: string }> => {
    const { data } = await api.post(`/api/admin/email-templates/${id}/test-send`)
    return data
  }
}
