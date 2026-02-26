import { vi } from 'vitest'
import { api } from '@/services/api'
import { dashboardService } from '@/services/dashboardService'

vi.mock('@/services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  }
}))

describe('dashboardService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getDashboardData', () => {
    it('sends GET /api/dashboard and returns data', async () => {
      const mockData = { total_jobs: 10, active_sites: 3 }
      vi.mocked(api.get).mockResolvedValue({ data: mockData })

      const result = await dashboardService.getDashboardData()

      expect(api.get).toHaveBeenCalledWith('/api/dashboard')
      expect(result).toEqual(mockData)
    })

    it('throws descriptive error on axios error with response', async () => {
      const axiosError = Object.assign(new Error(), {
        isAxiosError: true,
        response: { data: { error: 'Erro do servidor' }, status: 500 }
      })
      // We need to make axios.isAxiosError return true
      const axios = await import('axios')
      vi.spyOn(axios.default, 'isAxiosError').mockReturnValue(true)

      vi.mocked(api.get).mockRejectedValue(axiosError)

      await expect(dashboardService.getDashboardData()).rejects.toThrow('Erro do servidor')
    })

    it('throws connection error on non-axios error', async () => {
      const axios = await import('axios')
      vi.spyOn(axios.default, 'isAxiosError').mockReturnValue(false)

      vi.mocked(api.get).mockRejectedValue(new Error('Network error'))

      await expect(dashboardService.getDashboardData()).rejects.toThrow(
        'Não foi possível conectar ao servidor.'
      )
    })
  })

  describe('getLatestJobs', () => {
    it('sends GET /api/dashboard/jobs with params', async () => {
      const mockData = { jobs: [], total: 0 }
      const params = { days: 7, search: 'dev', page: 1, limit: 10 }
      vi.mocked(api.get).mockResolvedValue({ data: mockData })

      const result = await dashboardService.getLatestJobs(params)

      expect(api.get).toHaveBeenCalledWith('/api/dashboard/jobs', { params })
      expect(result).toEqual(mockData)
    })

    it('sends GET without optional params', async () => {
      const mockData = { jobs: [], total: 0 }
      vi.mocked(api.get).mockResolvedValue({ data: mockData })

      const result = await dashboardService.getLatestJobs({})

      expect(api.get).toHaveBeenCalledWith('/api/dashboard/jobs', { params: {} })
      expect(result).toEqual(mockData)
    })

    it('throws descriptive error on server error', async () => {
      const axiosError = Object.assign(new Error(), {
        isAxiosError: true,
        response: { data: { error: 'Vagas indisponíveis' }, status: 500 }
      })
      const axios = await import('axios')
      vi.spyOn(axios.default, 'isAxiosError').mockReturnValue(true)

      vi.mocked(api.get).mockRejectedValue(axiosError)

      await expect(dashboardService.getLatestJobs({})).rejects.toThrow('Vagas indisponíveis')
    })
  })
})
