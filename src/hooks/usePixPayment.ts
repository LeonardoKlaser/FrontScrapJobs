import { useMutation } from '@tanstack/react-query'
import {
  createPixPayment,
  type PixPaymentRequest,
  type PixPaymentResult
} from '@/services/pixService'

export function usePixPayment() {
  return useMutation<PixPaymentResult, Error, PixPaymentRequest>({
    mutationKey: ['pix-payment'],
    mutationFn: (req) => createPixPayment(req)
  })
}
