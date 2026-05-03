import api from './api'

export interface SiteKeyword {
  keyword: string
  job_count: number
}

interface SiteKeywordsResponse {
  keywords: SiteKeyword[]
}

export async function getSiteKeywords(siteId: number): Promise<SiteKeyword[]> {
  const { data } = await api.get<SiteKeywordsResponse>(`/api/sites/${siteId}/keywords`)
  return data.keywords
}
