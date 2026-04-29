import { useMutation } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { createPixAnonymous, type PixAnonymousRequest } from '@/services/pixAnonymousService'
import type { PixPaymentResult } from '@/services/pixService'

// Backend retorna 409 com {error, message} pra duplicatas e {error} pra outros
// erros. Tipar como AxiosError elimina cast no consumer e quebra build se a
// shape mudar. Não-exportado: consumer atual le err via axios.isAxiosError.
interface PixAnonymousErrorBody {
  error?: string
  message?: string
}

export function usePixAnonymous() {
  return useMutation<PixPaymentResult, AxiosError<PixAnonymousErrorBody>, PixAnonymousRequest>({
    mutationKey: ['pix-anonymous'],
    mutationFn: (req) => createPixAnonymous(req)
  })
}
