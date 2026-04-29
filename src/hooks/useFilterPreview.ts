import { useMutation } from '@tanstack/react-query'
import { previewFilters, type FilterPreviewResult } from '@/services/filterPreviewService'

interface PreviewArgs {
  siteId: number
  filters: string[]
}

export function useFilterPreview() {
  return useMutation<FilterPreviewResult, Error, PreviewArgs>({
    mutationKey: ['filter-preview'],
    mutationFn: ({ siteId, filters }) => previewFilters(siteId, filters)
  })
}
