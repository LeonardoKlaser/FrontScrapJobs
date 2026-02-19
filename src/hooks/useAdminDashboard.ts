import { useQuery } from '@tanstack/react-query'
import { adminDashboardService } from '@/services/adminDashboardService'

export function useAdminDashboard() {
  return useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: adminDashboardService.getDashboard
  })
}
