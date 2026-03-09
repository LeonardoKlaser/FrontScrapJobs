import { useQuery } from '@tanstack/react-query'
import { statsService } from '@/services/statsService'

export function usePublicStats() {
  return useQuery({
    queryKey: ['public-stats'],
    queryFn: statsService.getPublicStats,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1
  })
}

export function usePublicSiteLogos() {
  return useQuery({
    queryKey: ['public-site-logos'],
    queryFn: statsService.getPublicSiteLogos,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1
  })
}
