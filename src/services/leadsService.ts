import { api } from '@/services/api'

export interface SaveLeadRequest {
  name: string
  email: string
  phone: string
  plan_id: number
}

export interface SaveLeadResponse {
  saved: boolean
}

export async function saveLead(data: SaveLeadRequest): Promise<SaveLeadResponse> {
  const response = await api.post<SaveLeadResponse>('/api/leads', data)
  return response.data
}
