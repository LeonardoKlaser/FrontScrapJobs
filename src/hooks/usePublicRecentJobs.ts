import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { publicJobsService } from '@/services/publicJobsService'

// staleTime espelha o TTL do cache Redis do backend (10 min): refetch antes
// disso só devolveria a mesma resposta cacheada.
export function usePublicRecentJobs(area: string) {
  return useQuery({
    queryKey: ['public-recent-jobs', area],
    queryFn: () => publicJobsService.getRecentJobs(area),
    staleTime: 10 * 60 * 1000,
    retry: 1,
    // mantém a lista anterior visível ao trocar de chip, em vez de piscar
    // o skeleton a cada clique
    placeholderData: keepPreviousData
  })
}
