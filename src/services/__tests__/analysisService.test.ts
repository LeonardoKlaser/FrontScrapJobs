import { vi } from 'vitest'
import { api } from '@/services/api'
import { analysisService } from '@/services/analysisService'
import type { ResumeAnalysis } from '@/services/analysisService'

vi.mock('@/services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  }
}))

const mockAnalysis: ResumeAnalysis = {
  matchAnalysis: {
    overallScoreNumeric: 85,
    overallScoreQualitative: 'Alto',
    summary: 'Boa compatibilidade'
  },
  strengthsForThisJob: [{ point: 'React', relevanceToJob: 'Alta' }],
  gapsAndImprovementAreas: [{ areaDescription: 'Docker', jobRequirementImpacted: 'DevOps' }],
  actionableResumeSuggestions: [
    {
      suggestion: 'Adicionar Docker',
      curriculumSectionToApply: 'Skills',
      exampleWording: 'Experiência com Docker',
      reasoningForThisJob: 'Requisito da vaga'
    }
  ],
  finalConsiderations: 'Candidato promissor'
}

describe('analysisService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('analyzeJob', () => {
    it('sends POST /api/analyze-job with job_id', async () => {
      vi.mocked(api.post).mockResolvedValue({ data: mockAnalysis })

      const result = await analysisService.analyzeJob(42)

      expect(api.post).toHaveBeenCalledWith('/api/analyze-job', { job_id: 42 })
      expect(result).toEqual(mockAnalysis)
    })

    it('throws on failure', async () => {
      vi.mocked(api.post).mockRejectedValue(new Error('Server error'))

      await expect(analysisService.analyzeJob(42)).rejects.toThrow('Server error')
    })
  })

  describe('sendAnalysisEmail', () => {
    it('sends POST /api/analyze-job/send-email with job_id and analysis', async () => {
      vi.mocked(api.post).mockResolvedValue({})

      await analysisService.sendAnalysisEmail(42, mockAnalysis)

      expect(api.post).toHaveBeenCalledWith('/api/analyze-job/send-email', {
        job_id: 42,
        analysis: mockAnalysis
      })
    })
  })
})
