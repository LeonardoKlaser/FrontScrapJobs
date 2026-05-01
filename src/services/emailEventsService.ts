import { api } from './api'
import type { EmailEvent, EmailEventSubscriber } from '@/models/email'

export const emailEventsService = {
  list: async (): Promise<EmailEvent[]> => {
    const { data } = await api.get<{ events: EmailEvent[] }>('/api/admin/email-events')
    return data.events
  },
  listSubscribers: async (
    eventName: string,
    activeOnly = false
  ): Promise<EmailEventSubscriber[]> => {
    const { data } = await api.get<{ subscribers: EmailEventSubscriber[] }>(
      `/api/admin/email-events/${encodeURIComponent(eventName)}/subscribers`,
      { params: { active: activeOnly ? 'true' : undefined } }
    )
    return data.subscribers
  },
  createSubscriber: async (input: Partial<EmailEventSubscriber>): Promise<EmailEventSubscriber> => {
    const { data } = await api.post<EmailEventSubscriber>(
      '/api/admin/email-event-subscribers',
      input
    )
    return data
  },
  updateSubscriber: async (
    id: number,
    input: Partial<EmailEventSubscriber>
  ): Promise<EmailEventSubscriber> => {
    const { data } = await api.patch<EmailEventSubscriber>(
      `/api/admin/email-event-subscribers/${id}`,
      input
    )
    return data
  },
  deleteSubscriber: async (id: number): Promise<void> => {
    await api.delete(`/api/admin/email-event-subscribers/${id}`)
  }
}
