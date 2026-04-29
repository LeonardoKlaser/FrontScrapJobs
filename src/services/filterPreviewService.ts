import { api } from './api'

export interface FilterPreviewResult {
  total_jobs: number
  matched_jobs: number
  sample: { title: string; location: string; job_link: string }[]
  // BE-H14: distingue "site sem vagas recentes" de "filtros restritivos".
  // true → site não publicou vagas há ~30 dias; false + matched_jobs=0 → filtros muito apertados.
  site_has_no_recent_jobs: boolean
}

export async function previewFilters(
  siteId: number,
  filters: string[]
): Promise<FilterPreviewResult> {
  const response = await api.post<FilterPreviewResult>(`/api/sites/${siteId}/preview-filters`, {
    filters
  })
  return response.data
}
