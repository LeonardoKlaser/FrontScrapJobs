import { useQuery } from '@tanstack/react-query';
import { DashboardService } from '@/services/dashboardService';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboardData'], 
    queryFn: DashboardService.getDashboardData, 
  });
}