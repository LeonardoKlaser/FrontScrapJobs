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
    try {
      const response = await api.get('/api/admin/email-logs/export.csv', {
        params: filters,
        responseType: 'blob'
      })
      return response.data as Blob
    } catch (err) {
      // Quando responseType=blob, axios entrega err.response.data como Blob
      // tambem nos 4xx/5xx. extractApiError espera object com `error` em string,
      // entao falha silenciosamente e o admin so ve o fallback. Convertemos o
      // Blob de volta pro shape esperado antes de propagar pro hook.
      const axiosErr = err as { response?: { data?: unknown } } | null | undefined
      const data = axiosErr?.response?.data
      if (data instanceof Blob) {
        try {
          const text = await data.text()
          if (text) {
            try {
              const parsed = JSON.parse(text)
              if (axiosErr?.response) {
                ;(axiosErr.response as { data?: unknown }).data = parsed
              }
            } catch {
              if (axiosErr?.response) {
                ;(axiosErr.response as { data?: unknown }).data = { error: text }
              }
            }
          }
        } catch (blobErr) {
          // Falha ao ler o Blob — segue com o erro original (fallback localizado).
          // Loga em console pra debug em dev sem quebrar o fluxo do usuário.
          console.error('[emailLogsService] failed to read error blob', blobErr)
        }
      }
      throw err
    }
  }
}
