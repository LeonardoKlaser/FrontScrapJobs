import { useQuery } from '@tanstack/react-query';
import { planService } from '@/services/planService';

export function usePlans() {
  return useQuery({
    queryKey: ['plans'],
    queryFn: planService.getAllPlans,
  });
}