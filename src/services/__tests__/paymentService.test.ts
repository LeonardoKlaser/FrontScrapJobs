import { vi } from 'vitest'
import { api } from '@/services/api'
import {
  createPayment,
  checkPaymentStatus,
  cancelSubscription
} from '@/services/paymentService'
import type { CreatePaymentRequest } from '@/services/paymentService'

vi.mock('@/services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  }
}))

describe('paymentService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createPayment', () => {
    const planId = 2
    const paymentData: CreatePaymentRequest = {
      name: 'João Silva',
      email: 'joao@email.com',
      password: 'senha1234',
      tax: '123.456.789-00',
      cellphone: '11999999999',
      card_token: 'tok_test_xyz',
      zip_code: '01001000',
      street: 'Rua das Flores',
      number: '100',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP'
    }

    it('sends POST /api/payments/create/{planId} with correct data', async () => {
      const mockResponse = { status: 'processing' }
      vi.mocked(api.post).mockResolvedValue({ data: mockResponse })

      const result = await createPayment(planId, paymentData)

      expect(api.post).toHaveBeenCalledWith(`/api/payments/create/${planId}`, paymentData)
      expect(result).toEqual(mockResponse)
    })

    it('returns processing status from response', async () => {
      vi.mocked(api.post).mockResolvedValue({ data: { status: 'processing' } })

      const result = await createPayment(planId, paymentData)

      expect(result.status).toBe('processing')
    })

    it('propagates errors from api.post', async () => {
      vi.mocked(api.post).mockRejectedValue(new Error('Network error'))

      await expect(createPayment(planId, paymentData)).rejects.toThrow('Network error')
    })
  })

  describe('checkPaymentStatus', () => {
    it('sends GET /api/payments/status with email param', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: { status: 'confirmed' } })

      const result = await checkPaymentStatus('joao@email.com')

      expect(api.get).toHaveBeenCalledWith('/api/payments/status', {
        params: { email: 'joao@email.com' }
      })
      expect(result.status).toBe('confirmed')
    })

    it('returns processing status', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: { status: 'processing' } })

      const result = await checkPaymentStatus('joao@email.com')

      expect(result.status).toBe('processing')
    })

    it('returns not_found status', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: { status: 'not_found' } })

      const result = await checkPaymentStatus('nobody@email.com')

      expect(result.status).toBe('not_found')
    })

    it('propagates errors from api.get', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Network error'))

      await expect(checkPaymentStatus('joao@email.com')).rejects.toThrow('Network error')
    })
  })

  describe('cancelSubscription', () => {
    it('sends DELETE /api/subscription/cancel', async () => {
      vi.mocked(api.delete).mockResolvedValue({ data: { message: 'Assinatura cancelada com sucesso' } })

      const result = await cancelSubscription()

      expect(api.delete).toHaveBeenCalledWith('/api/subscription/cancel')
      expect(result.message).toBe('Assinatura cancelada com sucesso')
    })

    it('propagates errors from api.delete', async () => {
      vi.mocked(api.delete).mockRejectedValue(new Error('Unauthorized'))

      await expect(cancelSubscription()).rejects.toThrow('Unauthorized')
    })
  })
})
