import { useMutation } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import {
  createSubscribePix,
  createSubscribeCard,
  createPixMonthly,
  type CreateSubscriptionRequest,
  type CreateSubscriptionWithPendingRequest,
  type SubscriptionResult,
  type CreatePixMonthlyRequest,
  type CreatePixMonthlyAuthenticatedRequest,
  type CreatePixMonthlyWithPendingRequest,
  type PixMonthlyResult
} from '@/services/paymentService'

interface AbacatePayErrorBody {
  error?: string
  message?: string
}

export function useAbacatePaySubscribePix() {
  return useMutation<
    SubscriptionResult,
    AxiosError<AbacatePayErrorBody>,
    { planId: number; data: CreateSubscriptionRequest | CreateSubscriptionWithPendingRequest }
  >({
    mutationKey: ['abacatepay-subscribe-pix'],
    mutationFn: ({ planId, data }) => createSubscribePix(planId, data)
  })
}

export function useAbacatePaySubscribeCard() {
  return useMutation<
    SubscriptionResult,
    AxiosError<AbacatePayErrorBody>,
    { planId: number; data: CreateSubscriptionRequest | CreateSubscriptionWithPendingRequest }
  >({
    mutationKey: ['abacatepay-subscribe-card'],
    mutationFn: ({ planId, data }) => createSubscribeCard(planId, data)
  })
}

export function useAbacatePayPixMonthly() {
  return useMutation<
    PixMonthlyResult,
    AxiosError<AbacatePayErrorBody>,
    | CreatePixMonthlyRequest
    | CreatePixMonthlyAuthenticatedRequest
    | CreatePixMonthlyWithPendingRequest
  >({
    mutationKey: ['abacatepay-pix-monthly'],
    mutationFn: (req) => createPixMonthly(req)
  })
}
