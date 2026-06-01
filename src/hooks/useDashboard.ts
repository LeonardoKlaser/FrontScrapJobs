import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { dashboardService } from '@/services/dashboardService'

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboardData'],
    queryFn: dashboardService.getDashboardData,
    staleTime: 2 * 60 * 1000
  })
}

export function useLatestJobs(params: {
  days?: number
  search?: string
  matched_only?: boolean
  regions?: string[]
  company?: string
  location?: string
  sort?: string
  dir?: string
  page?: number
  limit?: number
}) {
  return useQuery({
    queryKey: ['latestJobs', params],
    queryFn: () => dashboardService.getLatestJobs(params),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000
  })
}

export function useJobCompanies(days?: number) {
  return useQuery({
    queryKey: ['jobCompanies', days ?? null],
    queryFn: () => dashboardService.getJobCompanies(days),
    staleTime: 5 * 60 * 1000
  })
}
