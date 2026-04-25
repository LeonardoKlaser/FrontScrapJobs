import { useMutation } from '@tanstack/react-query'
import {
  validateCheckout,
  type ValidateCheckoutResponse
} from '@/services/checkoutValidationService'

export function useValidateCheckout() {
  return useMutation<ValidateCheckoutResponse, Error, { email: string; tax?: string }>({
    mutationFn: ({ email, tax }) => validateCheckout(email, tax)
  })
}
