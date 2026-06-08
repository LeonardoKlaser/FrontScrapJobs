import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { publicJobsService, type AreaValue } from '@/services/publicJobsService'

export function usePublicJobs(area: AreaValue) {
  return useQuery({
    queryKey: ['public-jobs', area],
    queryFn: () => publicJobsService.getRecentJobs(area),
    staleTime: 10 * 60 * 1000,
    retry: 1,
    placeholderData: keepPreviousData
  })
}
