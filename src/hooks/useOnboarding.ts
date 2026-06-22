import { useMutation, useQuery } from '@tanstack/react-query'
import {
  getOnboardingPage,
  subscribeOnboarding,
  OnboardingExpiredError,
  type OnboardingSubscribeRequest
} from '@/services/onboardingService'

export function useOnboardingPage(token: string | undefined) {
  return useQuery({
    queryKey: ['onboarding-page', token],
    queryFn: () => getOnboardingPage(token as string),
    enabled: !!token,
    retry: (_, error) => !(error instanceof OnboardingExpiredError),
    staleTime: 5 * 60 * 1000
  })
}

export function useOnboardingSubscribe(token: string | undefined) {
  return useMutation({
    mutationFn: (payload: OnboardingSubscribeRequest) =>
      subscribeOnboarding(token as string, payload)
  })
}
