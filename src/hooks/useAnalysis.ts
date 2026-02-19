import { useMutation } from '@tanstack/react-query'
import { analysisService } from '@/services/analysisService'

export function useAnalyzeJob() {
  return useMutation({
    mutationFn: analysisService.analyzeJob
  })
}
