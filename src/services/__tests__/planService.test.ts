import { vi } from 'vitest'
import { api } from '@/services/api'
import { planService } from '@/services/planService'

vi.mock('@/services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  }
}))

describe('planService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllPlans', () => {
    it('sends GET /api/plans and returns plans', async () => {
      const mockPlans = [
        { id: 1, name: 'Iniciante', price: 0 },
        { id: 2, name: 'Profissional', price: 29.9 }
      ]
      vi.mocked(api.get).mockResolvedValue({ data: mockPlans })

      const result = await planService.getAllPlans()

      expect(api.get).toHaveBeenCalledWith('/api/plans')
      expect(result).toEqual(mockPlans)
    })

    it('throws descriptive error on server error', async () => {
      const axiosError = Object.assign(new Error(), {
        isAxiosError: true,
        response: { data: { error: 'Planos indisponíveis' }, status: 500 }
      })
      const axios = await import('axios')
      vi.spyOn(axios.default, 'isAxiosError').mockReturnValue(true)

      vi.mocked(api.get).mockRejectedValue(axiosError)

      await expect(planService.getAllPlans()).rejects.toThrow('Planos indisponíveis')
    })

    it('throws connection error on non-axios error', async () => {
      const axios = await import('axios')
      vi.spyOn(axios.default, 'isAxiosError').mockReturnValue(false)

      vi.mocked(api.get).mockRejectedValue(new Error())

      await expect(planService.getAllPlans()).rejects.toThrow(
        'Não foi possível conectar ao servidor.'
      )
    })
  })
})
