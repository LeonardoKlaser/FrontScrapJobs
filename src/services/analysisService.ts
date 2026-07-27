import { api } from './api'

export interface MatchAnalysis {
  overallScoreNumeric: number
  overallScoreQualitative: string
  summary: string
}

export interface Strength {
  point: string
  relevanceToJob: string
}

export interface Gap {
  areaDescription: string
  jobRequirementImpacted: string
}

export interface AtsKeywords {
  matched: string[]
  missing: string[]
}

export interface Suggestion {
  suggestion: string
  curriculumSectionToApply: string
  exampleWording: string
  reasoningForThisJob: string
}

export interface ResumeAnalysis {
  matchAnalysis: MatchAnalysis
  atsKeywords: AtsKeywords
  strengthsForThisJob: Strength[]
  gapsAndImprovementAreas: Gap[]
  actionableResumeSuggestions: Suggestion[]
  finalConsiderations: string
}

export interface OptimizationPromptResponse {
  prompt: string
  cached: boolean
}

export interface AnalysisHistoryResponse {
  has_analysis: boolean
  analysis?: ResumeAnalysis
  curriculum_id?: number
  // curriculum_file_id (Task 6) e notification_id identificam, respectivamente,
  // o PDF usado na análise e a linha de job_notifications que a persistiu —
  // esta última alimenta POST /api/analyze-job/:id/optimization-prompt
  // (Task 7), consumida pelo useOptimizationPrompt.
  curriculum_file_id?: number | null
  notification_id?: number
  notified_at?: string
  stale_from_snapshot?: boolean
}

export const analysisService = {
  // curriculumFileId seleciona um PDF específico do usuário; null usa o
  // principal (Task 6) — substitui o antigo curriculum_id (struct Curriculum).
  analyzeJob: async (jobId: number, curriculumFileId: number | null): Promise<ResumeAnalysis> => {
    const { data } = await api.post('/api/analyze-job', {
      job_id: jobId,
      curriculum_file_id: curriculumFileId
    })
    return data
  },

  getAnalysisHistory: async (jobId: number): Promise<AnalysisHistoryResponse> => {
    const { data } = await api.get('/api/analyze-job/history', { params: { job_id: jobId } })
    return data
  },

  sendAnalysisEmail: async (jobId: number, analysis: ResumeAnalysis): Promise<void> => {
    await api.post('/api/analyze-job/send-email', { job_id: jobId, analysis })
  },

  // getOptimizationPrompt gera (ou reusa, cacheado no backend por análise —
  // Task 7) o prompt de otimização de currículo pra uma análise já feita.
  // `id` é o notification id (job_notifications.id), não o job_id.
  getOptimizationPrompt: async (notificationId: number): Promise<OptimizationPromptResponse> => {
    const { data } = await api.post(`/api/analyze-job/${notificationId}/optimization-prompt`)
    return data
  }
}
