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
      // tambem nos 4xx/5xx. extractApiError espera object com `error` em string.
      // Em vez de mutar response.data in place (interceptors de retry podiam re-ler),
      // construímos um Error fresh e propagamos. HTML de error pages é truncado
      // pra evitar despejar markup inteiro no toast.
      const axiosErr = err as { response?: { data?: unknown; status?: number } } | null | undefined
      const data = axiosErr?.response?.data
      if (data instanceof Blob) {
        try {
          const text = await data.text()
          if (text) {
            let parsedData: unknown
            try {
              parsedData = JSON.parse(text)
            } catch {
              const truncated = text.length > 500 ? text.slice(0, 500) + '...' : text
              parsedData = { error: truncated }
            }
            const enriched = new Error('email log export failed') as Error & {
              response?: { data: unknown; status?: number }
            }
            enriched.response = { data: parsedData, status: axiosErr?.response?.status }
            throw enriched
          }
        } catch (blobErr) {
          if (blobErr instanceof Error && 'response' in blobErr) throw blobErr
          console.error('[emailLogsService] failed to read error blob', blobErr)
        }
      }
      throw err
    }
  }
}
