import { useMutation, useQueryClient } from '@tanstack/react-query'
import { planService } from '@/services/planService'

// useChangePlan troca o plano da assinatura ativa. Sucesso invalida ['user']
// (mesma query do useUser/authLoader) pra refletir o novo plano/limites.
export function useChangePlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (planId: number) => planService.changePlan(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
    }
  })
}
