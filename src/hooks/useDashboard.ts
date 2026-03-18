import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { dashboardService } from '@/services/dashboardService'

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboardData'],
    queryFn: dashboardService.getDashboardData,
    staleTime: 2 * 60 * 1000
  })
}

export function useLatestJobs(params: { days?: number; search?: string; matched_only?: boolean }) {
  return useQuery({
    queryKey: ['latestJobs', params],
    queryFn: () => dashboardService.getLatestJobs(params),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000
  })
}
