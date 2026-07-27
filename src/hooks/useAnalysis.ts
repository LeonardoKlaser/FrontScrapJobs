import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { analysisService } from '@/services/analysisService'
import type { ResumeAnalysis } from '@/services/analysisService'

export function useAnalyzeJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ jobId, curriculumFileId }: { jobId: number; curriculumFileId: number | null }) =>
      analysisService.analyzeJob(jobId, curriculumFileId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['analysisHistory', variables.jobId] })
    }
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

// useOptimizationPrompt gera o prompt de otimização pra uma análise (Task 7).
// notificationId é fixo por instância (a seção que o consome já nasce presa a
// uma análise específica) — mutate() não recebe variáveis.
export function useOptimizationPrompt(notificationId: number) {
  return useMutation({
    mutationFn: () => analysisService.getOptimizationPrompt(notificationId)
  })
}
