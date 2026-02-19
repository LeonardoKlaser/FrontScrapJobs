import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '@/services/dashboardService'

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboardData'],
    queryFn: dashboardService.getDashboardData
  })
}
