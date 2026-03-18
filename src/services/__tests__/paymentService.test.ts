import { vi } from 'vitest'
import { api } from '@/services/api'
import { createPayment, checkPixStatus } from '@/services/paymentService'
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
    it('sends POST to /api/payments/create/:planId with correct body', async () => {
      const mockResponse = {
        pix_id: 'pix-123',
        br_code: 'code-abc',
        br_code_base64: 'base64data',
        expires_at: '2026-03-18T12:00:00Z'
      }
      vi.mocked(api.post).mockResolvedValue({ data: mockResponse })

      const requestData: CreatePaymentRequest = {
        name: 'Test User',
        email: 'test@email.com',
        password: 'securePass123',
        tax: '12345678900',
        cellphone: '11999998888',
        methods: ['PIX'],
        billing_period: 'monthly'
      }

      const result = await createPayment(1, requestData)

      expect(api.post).toHaveBeenCalledWith('/api/payments/create/1', requestData)
      expect(result).toEqual(mockResponse)
    })

    it('propagates errors on failure', async () => {
      vi.mocked(api.post).mockRejectedValue(new Error('Network error'))

      await expect(
        createPayment(1, {
          name: 'Test',
          email: 'test@email.com',
          password: 'pass1234',
          tax: '123',
          cellphone: '119',
          methods: ['PIX'],
          billing_period: 'monthly'
        })
      ).rejects.toThrow('Network error')
    })
  })

  describe('checkPixStatus', () => {
    it('sends GET to /api/payments/pix/status/:pixId and returns status', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: { status: 'PAID' } })

      const result = await checkPixStatus('pix-123')

      expect(api.get).toHaveBeenCalledWith('/api/payments/pix/status/pix-123')
      expect(result).toBe('PAID')
    })

    it('returns PENDING status correctly', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: { status: 'PENDING' } })

      const result = await checkPixStatus('pix-456')

      expect(result).toBe('PENDING')
    })
  })
})
