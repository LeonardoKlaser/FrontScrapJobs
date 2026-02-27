import { useMutation, useQuery } from '@tanstack/react-query'
import { analysisService } from '@/services/analysisService'
import type { ResumeAnalysis } from '@/services/analysisService'

export function useAnalyzeJob() {
  return useMutation({
    mutationFn: ({ jobId, curriculumId }: { jobId: number; curriculumId: number }) =>
      analysisService.analyzeJob(jobId, curriculumId)
  })
}

export function useAnalysisHistory(jobId: number | null) {
  return useQuery({
    queryKey: ['analysisHistory', jobId],
    queryFn: () => analysisService.getAnalysisHistory(jobId!),
    enabled: jobId !== null
  })
}

export function useSendAnalysisEmail() {
  return useMutation({
    mutationFn: ({ jobId, analysis }: { jobId: number; analysis: ResumeAnalysis }) =>
      analysisService.sendAnalysisEmail(jobId, analysis)
  })
}
