import { useQuery } from '@tanstack/react-query'
import { planService } from '@/services/planService'

export function usePlans() {
  return useQuery({
    queryKey: ['plans'],
    queryFn: planService.getAllPlans,
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}
