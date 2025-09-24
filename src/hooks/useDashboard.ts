import { useQuery } from '@tanstack/react-query';
import { DashboardService } from '@/services/dashboardService';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboardData'], // Chave única para esta query no cache
    queryFn: DashboardService.getDashboardData, // A função que busca os dados
  });
}