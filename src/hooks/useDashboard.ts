import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { dashboardService } from '@/services/dashboardService'

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboardData'],
    queryFn: dashboardService.getDashboardData
  })
}

export function useLatestJobs(params: {
  days?: number
  search?: string
  page?: number
  limit?: number
}) {
  return useQuery({
    queryKey: ['latestJobs', params],
    queryFn: () => dashboardService.getLatestJobs(params),
    placeholderData: keepPreviousData
  })
}
