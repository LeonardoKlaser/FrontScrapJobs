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

export interface Suggestion {
  suggestion: string
  curriculumSectionToApply: string
  exampleWording: string
  reasoningForThisJob: string
}

export interface ResumeAnalysis {
  matchAnalysis: MatchAnalysis
  strengthsForThisJob: Strength[]
  gapsAndImprovementAreas: Gap[]
  actionableResumeSuggestions: Suggestion[]
  finalConsiderations: string
}

export const analysisService = {
  analyzeJob: async (jobId: number, curriculumId: number): Promise<ResumeAnalysis> => {
    const { data } = await api.post('/api/analyze-job', {
      job_id: jobId,
      curriculum_id: curriculumId
    })
    return data
  },

  getAnalysisHistory: async (
    jobId: number
  ): Promise<{
    has_analysis: boolean
    analysis?: ResumeAnalysis
    curriculum_id?: number
  }> => {
    const { data } = await api.get('/api/analyze-job/history', { params: { job_id: jobId } })
    return data
  },

  sendAnalysisEmail: async (jobId: number, analysis: ResumeAnalysis): Promise<void> => {
    await api.post('/api/analyze-job/send-email', { job_id: jobId, analysis })
  }
}
