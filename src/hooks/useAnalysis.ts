import { useMutation } from '@tanstack/react-query'
import { analysisService } from '@/services/analysisService'
import type { ResumeAnalysis } from '@/services/analysisService'

export function useAnalyzeJob() {
  return useMutation({
    mutationFn: analysisService.analyzeJob
  })
}

export function useSendAnalysisEmail() {
  return useMutation({
    mutationFn: ({ jobId, analysis }: { jobId: number; analysis: ResumeAnalysis }) =>
      analysisService.sendAnalysisEmail(jobId, analysis)
  })
}
