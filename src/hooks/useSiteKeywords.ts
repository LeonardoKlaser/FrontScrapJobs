import { useQuery } from '@tanstack/react-query'
import { getSiteKeywords } from '@/services/siteKeywordService'

export function useSiteKeywords(siteId: number, enabled: boolean) {
  return useQuery({
    queryKey: ['siteKeywords', siteId],
    queryFn: () => getSiteKeywords(siteId),
    enabled,
    staleTime: 5 * 60 * 1000
  })
}
