import { useMutation, useQuery } from '@tanstack/react-query'
import {
  getOnboardingPage,
  subscribeOnboarding,
  type OnboardingSubscribeRequest
} from '@/services/onboardingService'

// retry: false — token invalido/expirado retorna 404 e nao deve ser refeito.
// staleTime alto: a pagina de onboarding e estavel durante a visita do usuario.
export function useOnboardingPage(token: string | undefined) {
  return useQuery({
    queryKey: ['onboarding-page', token],
    queryFn: () => getOnboardingPage(token as string),
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000
  })
}

export function useOnboardingSubscribe(token: string | undefined) {
  return useMutation({
    mutationFn: (payload: OnboardingSubscribeRequest) =>
      subscribeOnboarding(token as string, payload)
  })
}
