import { useMutation } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import {
  createSubscription,
  createPixQuarterly,
  type CreateSubscriptionRequest,
  type CreateSubscriptionWithPendingRequest,
  type SubscriptionResult,
  type CreatePixQuarterlyRequest,
  type CreatePixQuarterlyWithPendingRequest,
  type PixQuarterlyResult
} from '@/services/paymentService'

interface AbacatePayErrorBody {
  error?: string
  message?: string
}

export function useAbacatePaySubscription() {
  return useMutation<
    SubscriptionResult,
    AxiosError<AbacatePayErrorBody>,
    { planId: number; data: CreateSubscriptionRequest | CreateSubscriptionWithPendingRequest }
  >({
    mutationKey: ['abacatepay-subscription'],
    mutationFn: ({ planId, data }) => createSubscription(planId, data)
  })
}

export function useAbacatePayPixQuarterly() {
  return useMutation<
    PixQuarterlyResult,
    AxiosError<AbacatePayErrorBody>,
    CreatePixQuarterlyRequest | CreatePixQuarterlyWithPendingRequest
  >({
    mutationKey: ['abacatepay-pix-quarterly'],
    mutationFn: (req) => createPixQuarterly(req)
  })
}
