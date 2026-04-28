import { api } from './api'

export interface FilterPreviewResult {
  total_jobs: number
  matched_jobs: number
  sample: { title: string; location: string; job_link: string }[]
}

export async function previewFilters(
  siteId: number,
  filters: string[]
): Promise<FilterPreviewResult> {
  const response = await api.post(`/api/sites/${siteId}/preview-filters`, { filters })
  return response.data
}
