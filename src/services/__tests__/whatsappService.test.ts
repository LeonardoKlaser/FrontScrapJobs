import { vi } from 'vitest'
import { api } from '@/services/api'
import {
  whatsappService,
  WhatsAppCodeInvalidError,
  WhatsAppNoPendingOptinError,
  WhatsAppNumberAlreadyTakenError,
  WhatsAppNotOptedInError
} from '@/services/whatsappService'

vi.mock('@/services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  }
}))

describe('whatsappService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('requestOptIn', () => {
    it('sends POST /api/user/whatsapp-optin/request with digits-only number', async () => {
      vi.mocked(api.post).mockResolvedValue({})

      await whatsappService.requestOptIn('(11) 99999-9999')

      expect(api.post).toHaveBeenCalledWith('/api/user/whatsapp-optin/request', {
        whatsapp_number: '11999999999'
      })
    })

    it('throws descriptive error from response body', async () => {
      const axiosError = Object.assign(new Error(), {
        isAxiosError: true,
        response: { data: { error: 'Número inválido' }, status: 400 }
      })
      const axios = await import('axios')
      vi.spyOn(axios.default, 'isAxiosError').mockReturnValue(true)
      vi.mocked(api.post).mockRejectedValue(axiosError)

      await expect(whatsappService.requestOptIn('11999999999')).rejects.toThrow('Número inválido')
    })

    it('throws connection error on non-axios error', async () => {
      const axios = await import('axios')
      vi.spyOn(axios.default, 'isAxiosError').mockReturnValue(false)
      vi.mocked(api.post).mockRejectedValue(new Error())

      await expect(whatsappService.requestOptIn('11999999999')).rejects.toThrow(
        'Não foi possível conectar ao servidor.'
      )
    })
  })

  describe('confirmOptIn', () => {
    it('sends POST /api/user/whatsapp-optin/verify with trimmed code', async () => {
      vi.mocked(api.post).mockResolvedValue({})

      await whatsappService.confirmOptIn('  654321  ')

      expect(api.post).toHaveBeenCalledWith('/api/user/whatsapp-optin/verify', { code: '654321' })
    })

    it('throws WhatsAppCodeInvalidError on 400', async () => {
      const axiosError = Object.assign(new Error(), {
        isAxiosError: true,
        response: { data: { error: 'código de verificação inválido' }, status: 400 }
      })
      const axios = await import('axios')
      vi.spyOn(axios.default, 'isAxiosError').mockReturnValue(true)
      vi.mocked(api.post).mockRejectedValue(axiosError)

      await expect(whatsappService.confirmOptIn('000000')).rejects.toBeInstanceOf(
        WhatsAppCodeInvalidError
      )
    })

    it('throws WhatsAppNumberAlreadyTakenError on 409 when error mentions "já vinculado"', async () => {
      const axiosError = Object.assign(new Error(), {
        isAxiosError: true,
        response: {
          data: { error: 'número de WhatsApp já vinculado a outra conta' },
          status: 409
        }
      })
      const axios = await import('axios')
      vi.spyOn(axios.default, 'isAxiosError').mockReturnValue(true)
      vi.mocked(api.post).mockRejectedValue(axiosError)

      await expect(whatsappService.confirmOptIn('654321')).rejects.toBeInstanceOf(
        WhatsAppNumberAlreadyTakenError
      )
    })

    it('throws WhatsAppNoPendingOptinError on generic 409', async () => {
      const axiosError = Object.assign(new Error(), {
        isAxiosError: true,
        response: {
          data: { error: 'nenhum opt-in pendente — solicite o código primeiro' },
          status: 409
        }
      })
      const axios = await import('axios')
      vi.spyOn(axios.default, 'isAxiosError').mockReturnValue(true)
      vi.mocked(api.post).mockRejectedValue(axiosError)

      await expect(whatsappService.confirmOptIn('654321')).rejects.toBeInstanceOf(
        WhatsAppNoPendingOptinError
      )
    })

    it('throws connection error on non-axios error', async () => {
      const axios = await import('axios')
      vi.spyOn(axios.default, 'isAxiosError').mockReturnValue(false)
      vi.mocked(api.post).mockRejectedValue(new Error())

      await expect(whatsappService.confirmOptIn('654321')).rejects.toThrow(
        'Não foi possível conectar ao servidor.'
      )
    })
  })

  describe('setChannel', () => {
    it('sends PATCH /api/user/preferred-channel with channel', async () => {
      vi.mocked(api.patch).mockResolvedValue({})

      await whatsappService.setChannel('whatsapp')

      expect(api.patch).toHaveBeenCalledWith('/api/user/preferred-channel', {
        channel: 'whatsapp'
      })
    })

    it('throws WhatsAppNotOptedInError on 409', async () => {
      const axiosError = Object.assign(new Error(), {
        isAxiosError: true,
        response: { data: { error: 'opte pelo WhatsApp primeiro' }, status: 409 }
      })
      const axios = await import('axios')
      vi.spyOn(axios.default, 'isAxiosError').mockReturnValue(true)
      vi.mocked(api.patch).mockRejectedValue(axiosError)

      await expect(whatsappService.setChannel('whatsapp')).rejects.toBeInstanceOf(
        WhatsAppNotOptedInError
      )
    })
  })
})
