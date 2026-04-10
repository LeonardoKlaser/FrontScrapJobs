import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { pdfService } from '@/services/pdfService'
import type { ApplySuggestionsPayload } from '@/models/pdf'

export function useExtractPdf() {
  return useMutation({
    mutationFn: (file: File) => pdfService.extractPdf(file)
  })
}

export function useApplySuggestions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ApplySuggestionsPayload) => pdfService.applySuggestions(payload),
    onSuccess: (_data, variables) => {
      if (variables.action === 'save' || variables.action === 'both') {
        queryClient.invalidateQueries({ queryKey: ['curriculumList'] })
      }
    }
  })
}

export function useGeneratePdf() {
  return useMutation({
    mutationFn: ({ curriculumId, templateId }: { curriculumId: number; templateId: string }) =>
      pdfService.generatePdf(curriculumId, templateId)
  })
}

export function useTemplates() {
  return useQuery({
    queryKey: ['pdfTemplates'],
    queryFn: pdfService.getTemplates,
    staleTime: 30 * 60 * 1000
  })
}
