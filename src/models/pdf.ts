import type { Curriculum } from './curriculum'
import type { Suggestion } from '@/services/analysisService'

export interface Template {
  id: string
  name: string
  description: string
}

export interface ApplySuggestionsPayload {
  curriculum_id: number
  job_id: number
  suggestions: Suggestion[]
  action: 'save' | 'download' | 'both'
  save_mode?: 'new' | 'overwrite'
  template_id?: string
}

export interface ApplySuggestionsResponse {
  curriculum: Curriculum
  pdf_url?: string
}
