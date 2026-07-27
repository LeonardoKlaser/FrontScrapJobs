import { useMutation, useQuery } from '@tanstack/react-query'
import { pdfService } from '@/services/pdfService'

export function useExtractPdf() {
  return useMutation({
    mutationFn: (file: File) => pdfService.extractPdf(file)
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
