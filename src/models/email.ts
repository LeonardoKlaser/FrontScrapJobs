export interface VariableSchema {
  name: string
  type: 'string' | 'int' | 'bool' | 'array' | 'object' | 'timestamp'
  required: boolean
  sample: unknown
}

export interface EmailTemplate {
  id: number
  key: string
  locale: string
  name: string
  description?: string | null
  subject: string
  body_html: string
  variables_schema: VariableSchema[]
  is_active: boolean
  created_at: string
  updated_at: string
  updated_by?: number | null
}

export interface PayloadField {
  name: string
  type: string
  required: boolean
  sample: unknown
}

export interface EmailEvent {
  id: number
  name: string
  description: string
  payload_schema: PayloadField[]
  created_at: string
}

export interface EmailEventSubscriber {
  id: number
  event_id: number
  template_id: number
  name: string
  filter_dsl?: SegmentFilter | null
  delay_seconds: number
  is_active: boolean
  created_by?: number | null
  created_at: string
  updated_at: string
}

export type LifecycleKind = 'simple_segment' | 'specialized'

export interface EmailLifecycleJob {
  id: number
  name: string
  kind: LifecycleKind
  handler_key?: string | null
  cron_expression: string
  timezone: string
  segment_filter?: SegmentFilter | null
  template_id: number
  dedup_key_template: string
  dedup_window_hours: number
  is_active: boolean
  last_run_at?: string | null
  last_run_count?: number | null
  last_run_error?: string | null
  created_by?: number | null
  created_at: string
  updated_at: string
}

// bounced/suppressed só entram quando o webhook SES/Resend (Phase 2) estiver wirado.
// unknown_post_send é gravado pelo reconciler hourly em rows que ficaram queued
// mas nunca atingiram sent/failed — preserva o status no painel admin.
// Mantemos o tipo alinhado ao que o backend realmente grava pra evitar silent
// failure no LogsViewer (filtro por status inexistente → lista vazia).
export type EmailLogStatus = 'queued' | 'sent' | 'failed' | 'unknown_post_send'

export interface EmailLog {
  id: number
  template_id?: number | null
  template_key_snapshot: string
  subscriber_id?: number | null
  lifecycle_job_id?: number | null
  campaign_id?: number | null // NEW — populado quando o log foi gerado por campaign:send
  user_id?: number | null
  recipient_email: string
  status: EmailLogStatus
  provider?: string | null
  provider_message_id?: string | null
  error_message?: string | null
  dedup_key?: string | null
  created_at: string
  sent_at?: string | null
}

// Filter Builder DSL
export type SegmentFilter = SegmentGroup | SegmentLeaf

export interface SegmentGroup {
  op: 'AND' | 'OR'
  filters: SegmentFilter[]
}

export type SegmentOperator =
  | '='
  | '!='
  | '<'
  | '<='
  | '>'
  | '>='
  | 'between'
  | 'in'
  | 'not_in'
  | 'is_null'
  | 'is_not_null'
  | 'contains'
  | 'not_contains'
  | 'starts_with'

export interface SegmentLeaf {
  field: string
  op: SegmentOperator
  value?: unknown
}

export interface SegmentField {
  name: string
  type: 'string' | 'int' | 'bool' | 'timestamp' | 'enum'
  description?: string
}

export interface RenderedEmail {
  subject: string
  body_html: string
  body_text: string
}

export interface EmailLogFilters {
  user_id?: number
  template_key?: string
  status?: EmailLogStatus
  from?: string
  to?: string
  recipient?: string
  source?: 'event' | 'lifecycle'
  campaign_id?: number // NEW — Phase 9 filtra logs por campanha
  limit?: number
  offset?: number
}
