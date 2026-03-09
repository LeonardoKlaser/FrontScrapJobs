import { useQuery } from '@tanstack/react-query'
import { statsService } from '@/services/statsService'

export function usePublicStats() {
  return useQuery({
    queryKey: ['publicStats'],
    queryFn: statsService.getPublicStats,
    staleTime: 5 * 60 * 1000
  })
}
