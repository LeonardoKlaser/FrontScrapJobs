import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  completeWebOnboarding,
  getOnboardingPage,
  subscribeOnboarding,
  OnboardingExpiredError,
  type OnboardingSubscribeRequest
} from '@/services/onboardingService'
import type { User } from '@/models/user'

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

export function useCompleteWebOnboarding() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: completeWebOnboarding,
    retry: 2,
    onSuccess: () => {
      queryClient.setQueryData<User>(['user'], (current) =>
        current
          ? {
              ...current,
              onboarding_completed: true,
              onboarding_completed_via: current.onboarding_completed_via ?? 'web'
            }
          : current
      )
    }
  })
}
