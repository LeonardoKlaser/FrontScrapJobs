import { api } from './api'
import type {
  EmailCampaign,
  CreateCampaignInput,
  UpdateCampaignInput,
  ListCampaignsResponse
} from '@/models/emailCampaign'

const BASE = '/api/admin/email-campaigns'

export interface ListCampaignsParams {
  status?: string
  limit?: number
  offset?: number
}

export const emailCampaignService = {
  list: async (params: ListCampaignsParams = {}): Promise<ListCampaignsResponse> => {
    const { data } = await api.get<ListCampaignsResponse>(BASE, { params })
    return data
  },
  get: async (id: number): Promise<EmailCampaign> => {
    const { data } = await api.get<EmailCampaign>(`${BASE}/${id}`)
    return data
  },
  create: async (input: CreateCampaignInput): Promise<EmailCampaign> => {
    const { data } = await api.post<EmailCampaign>(BASE, input)
    return data
  },
  update: async (id: number, input: UpdateCampaignInput): Promise<EmailCampaign> => {
    const { data } = await api.patch<EmailCampaign>(`${BASE}/${id}`, input)
    return data
  },
  schedule: async (id: number, send_at: string): Promise<EmailCampaign> => {
    const { data } = await api.post<EmailCampaign>(`${BASE}/${id}/schedule`, { send_at })
    return data
  },
  sendNow: async (id: number): Promise<EmailCampaign> => {
    const { data } = await api.post<EmailCampaign>(`${BASE}/${id}/send-now`)
    return data
  },
  cancel: async (id: number): Promise<EmailCampaign> => {
    const { data } = await api.post<EmailCampaign>(`${BASE}/${id}/cancel`)
    return data
  },
  duplicate: async (id: number): Promise<EmailCampaign> => {
    const { data } = await api.post<EmailCampaign>(`${BASE}/${id}/duplicate`)
    return data
  },
  remove: async (id: number): Promise<void> => {
    await api.delete(`${BASE}/${id}`)
  }
}
