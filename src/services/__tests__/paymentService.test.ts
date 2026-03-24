import { vi } from 'vitest'
import { api } from '@/services/api'
import { createPayment, CreatePaymentRequest } from '@/services/paymentService'

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
      cellphone: '11999999999'
    }

    it('sends POST /api/payments/create/{planId} with correct data', async () => {
      const mockResponse = { checkout_url: 'https://checkout.abacatepay.com/abc123' }
      vi.mocked(api.post).mockResolvedValue({ data: mockResponse })

      const result = await createPayment(planId, paymentData)

      expect(api.post).toHaveBeenCalledWith(`/api/payments/create/${planId}`, paymentData)
      expect(result).toEqual(mockResponse)
    })

    it('returns checkout_url from response', async () => {
      const checkoutUrl = 'https://checkout.abacatepay.com/xyz789'
      vi.mocked(api.post).mockResolvedValue({ data: { checkout_url: checkoutUrl } })

      const result = await createPayment(planId, paymentData)

      expect(result.checkout_url).toBe(checkoutUrl)
    })

    it('propagates errors from api.post', async () => {
      vi.mocked(api.post).mockRejectedValue(new Error('Network error'))

      await expect(createPayment(planId, paymentData)).rejects.toThrow('Network error')
    })
  })
})
