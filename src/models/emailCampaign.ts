export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'canceled'

export interface EmailCampaign {
  id: number
  name: string
  template_id: number
  segment_filter: Record<string, unknown>
  status: CampaignStatus
  send_at?: string | null
  started_at?: string | null
  finished_at?: string | null
  recipient_count?: number | null
  sent_count: number
  failed_count: number
  last_error?: string | null
  pickup_count: number
  worker_lease_until?: string | null
  created_by?: number | null
  created_at: string
  updated_at: string
}

export interface CreateCampaignInput {
  name: string
  template_id: number
  segment_filter: Record<string, unknown>
}

export interface UpdateCampaignInput {
  name?: string
  template_id?: number
  segment_filter?: Record<string, unknown>
  send_at?: string
}

export interface ListCampaignsResponse {
  data: EmailCampaign[]
  total: number
}

// CampaignApiError espelha o body 409/422/400 estruturado do backend (ver
// controller/admin_email_campaign_controller.go). UI dispatcha por `code`
// pra evitar regex em mensagens português.
export interface CampaignApiError {
  error: string
  code?: 'status_conflict' | 'not_editable'
  current_status?: CampaignStatus
  field?: string
}

const CAMPAIGN_TERMINAL_STATUSES: readonly CampaignStatus[] = [
  'sent',
  'failed',
  'canceled'
] as const

export const isCampaignTerminal = (s: CampaignStatus): boolean =>
  CAMPAIGN_TERMINAL_STATUSES.includes(s)

// isCampaignEditable — só draft permite editar template_id/segment_filter.
// scheduled permite name/send_at; sending+ permite só name. UI usa pra
// disable de inputs (defesa em profundidade — backend é source of truth).
export const isCampaignFullyEditable = (s: CampaignStatus): boolean => s === 'draft'
export const isCampaignSendAtEditable = (s: CampaignStatus): boolean =>
  s === 'draft' || s === 'scheduled'
