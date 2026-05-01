import { api } from './api'
import type { EmailLog, EmailLogFilters } from '@/models/email'

interface ListResponse {
  logs: EmailLog[]
  total: number
  limit: number
  offset: number
}

export const emailLogsService = {
  list: async (filters: EmailLogFilters = {}): Promise<ListResponse> => {
    const { data } = await api.get<ListResponse>('/api/admin/email-logs', {
      params: filters
    })
    return data
  },
  get: async (id: number): Promise<EmailLog> => {
    const { data } = await api.get<EmailLog>(`/api/admin/email-logs/${id}`)
    return data
  },
  exportCSV: async (filters: EmailLogFilters = {}): Promise<Blob> => {
    const response = await api.get('/api/admin/email-logs/export.csv', {
      params: filters,
      responseType: 'blob'
    })
    return response.data as Blob
  }
}
