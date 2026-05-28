import { api } from './api'
import axios from 'axios'

// WhatsAppNotOptedInError sinaliza o 409 do backend (tentou escolher o canal
// whatsapp sem ter feito opt-in). Tipada pra UI distinguir do erro genérico e
// mostrar a mensagem i18n correta — o service embrulha AxiosError em Error, então
// um `axios.isAxiosError` no componente não funcionaria.
export class WhatsAppNotOptedInError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'WhatsAppNotOptedInError'
  }
}

// WhatsAppNumberAlreadyTakenError sinaliza o 409 do confirmOptIn quando o número
// já está vinculado a outra conta (UNIQUE 23505 na migration 085). Vetor de
// account takeover por sequestro de número é fechado aqui: o atacante não
// consegue confirmar um número que outro user já legitimamente registrou.
export class WhatsAppNumberAlreadyTakenError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'WhatsAppNumberAlreadyTakenError'
  }
}

// WhatsAppCodeInvalidError sinaliza o 400 do confirmOptIn (código errado ou
// max tentativas — backend não distingue pra não dar oráculo de tentativas
// restantes). UI mostra mensagem genérica + sugere reenviar.
export class WhatsAppCodeInvalidError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'WhatsAppCodeInvalidError'
  }
}

// WhatsAppNoPendingOptinError sinaliza o 409 do confirmOptIn quando não há
// pendente (expirou no Redis, nunca pediu ou já confirmou). UI volta pro step
// de número pra pedir um novo código.
export class WhatsAppNoPendingOptinError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'WhatsAppNoPendingOptinError'
  }
}

export const whatsappService = {
  // requestOptIn é a 1ª etapa do opt-in em duas etapas (T9.x security fix):
  // gera um código de 6 dígitos e envia via WhatsApp pro próprio número. NÃO
  // grava na DB — só guarda pendente no Redis (TTL 10min). O número vai com
  // dígitos só pra evitar surpresa em logs/validação no backend.
  requestOptIn: async (whatsappNumber: string): Promise<void> => {
    try {
      await api.post('/api/user/whatsapp-optin/request', {
        whatsapp_number: whatsappNumber.replace(/\D/g, '')
      })
      return
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.error || 'Não foi possível enviar o código.')
      }
      throw new Error('Não foi possível conectar ao servidor.')
    }
  },

  // confirmOptIn é a 2ª etapa: valida o código contra o pendente. Sucesso →
  // backend commita whatsapp_number e envia welcome. Erros tipados pra UI
  // distinguir: código inválido (volta pro mesmo step), sem pendente (volta
  // pro step 1 de número), número já tomado (mostra erro bloqueante).
  confirmOptIn: async (code: string): Promise<void> => {
    try {
      await api.post('/api/user/whatsapp-optin/verify', { code: code.trim() })
      return
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const msg = error.response.data.error || 'Não foi possível confirmar o código.'
        if (error.response.status === 400) {
          throw new WhatsAppCodeInvalidError(msg)
        }
        if (error.response.status === 409) {
          if (msg.includes('já vinculado')) {
            throw new WhatsAppNumberAlreadyTakenError(msg)
          }
          throw new WhatsAppNoPendingOptinError(msg)
        }
        throw new Error(msg)
      }
      throw new Error('Não foi possível conectar ao servidor.')
    }
  },

  // setChannel troca o canal preferido (email|whatsapp). Backend retorna 409 se
  // o user tentar escolher whatsapp sem ter feito opt-in antes — o erro é
  // repassado pra UI tratar com toast.
  setChannel: async (channel: 'email' | 'whatsapp'): Promise<void> => {
    try {
      await api.patch('/api/user/preferred-channel', { channel })
      return
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 409) {
          throw new WhatsAppNotOptedInError(error.response.data.error || 'Opt-in necessário')
        }
        throw new Error(error.response.data.error || 'Não foi possível atualizar o canal.')
      }
      throw new Error('Não foi possível conectar ao servidor.')
    }
  }
}
