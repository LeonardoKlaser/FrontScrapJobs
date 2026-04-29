import { useMutation, useQueryClient } from '@tanstack/react-query'
import { feedbackService } from '@/services/feedbackService'
import type { FeedbackPayload } from '@/services/feedbackService'
import { useUser } from './useUser'
import { useMemo } from 'react'

export function useFeedbackModal() {
  const { data: user } = useUser()

  const shouldShow = useMemo(() => {
    if (!user) return false
    if (!user.is_trial_active) return false
    if (user.feedback_given) return false
    if ((user.feedback_modal_shown_count ?? 0) >= 2) return false

    // Verificar se esta no dia 5+ do trial
    if (!user.trial_ends_at) return false
    const trialEnds = new Date(user.trial_ends_at)
    const now = new Date()
    const daysLeft = Math.ceil((trialEnds.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    // trial_ends_at - now <= 2 dias significa dia 5+
    return daysLeft <= 2
  }, [user])

  return { shouldShow }
}

export function useSubmitFeedback() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: FeedbackPayload) => feedbackService.submit(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
    }
  })
}

export function useIncrementModalShown() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => feedbackService.incrementModalShown(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
    }
  })
}
