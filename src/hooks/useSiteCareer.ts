import { siteCareerService } from '@/services/siteCareerService'
import { useQuery } from '@tanstack/react-query'

export function useSiteCareer() {
  return useQuery({
    queryKey: ['siteCareerList'],
    queryFn: siteCareerService.getAllSiteCareer,
    staleTime: 60 * 1000 // 1 minute
  })
}
