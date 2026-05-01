import { api } from './api'
import type { SegmentField, SegmentFilter } from '@/models/email'

export const emailSegmentService = {
  getSchema: async (
    scope: 'users' | 'event_payload',
    eventName?: string
  ): Promise<SegmentField[]> => {
    const params: Record<string, string> = { scope }
    if (eventName) params.event = eventName
    const { data } = await api.get<{ fields: SegmentField[] }>('/api/admin/email-segment/schema', {
      params
    })
    return data.fields
  },
  previewCount: async (filter: SegmentFilter): Promise<{ count: number }> => {
    const { data } = await api.post<{ count: number }>('/api/admin/email-segment/preview-count', {
      filter
    })
    return data
  }
}
