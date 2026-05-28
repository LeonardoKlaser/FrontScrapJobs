import { useMutation, useQueryClient } from '@tanstack/react-query'
import { whatsappService } from '@/services/whatsappService'

// useWhatsApp expõe as mutations do opt-in em duas etapas (T9.x):
//   - requestOptIn: envia o código via WhatsApp (não muda DB; não invalida user).
//   - confirmOptIn: valida o código → invalida ['user'] (a mesma query do
//     useUser/authLoader) pra que o banner, o toggle e o /api/me reflitam o
//     novo estado.
//   - setChannel: idem confirm — invalida ['user'] no sucesso.
export function useWhatsApp() {
  const queryClient = useQueryClient()

  const requestOptIn = useMutation({
    mutationFn: (whatsappNumber: string) => whatsappService.requestOptIn(whatsappNumber)
  })

  const confirmOptIn = useMutation({
    mutationFn: (code: string) => whatsappService.confirmOptIn(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
    }
  })

  const setChannel = useMutation({
    mutationFn: (channel: 'email' | 'whatsapp') => whatsappService.setChannel(channel),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
    }
  })

  return { requestOptIn, confirmOptIn, setChannel }
}
