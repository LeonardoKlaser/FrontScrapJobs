import { vi } from 'vitest'
import { api } from '@/services/api'
import { adminDashboardService } from '@/services/adminDashboardService'

vi.mock('@/services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  }
}))

describe('adminDashboardService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getDashboard', () => {
    it('sends GET /api/admin/dashboard and returns data', async () => {
      const mockData = {
        total_revenue: 1500,
        active_users: 50,
        monitored_sites: 10,
        scraping_errors: 2,
        recent_errors: null
      }
      vi.mocked(api.get).mockResolvedValue({ data: mockData })

      const result = await adminDashboardService.getDashboard()

      expect(api.get).toHaveBeenCalledWith('/api/admin/dashboard')
      expect(result).toEqual(mockData)
    })

    it('throws on failure', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Forbidden'))

      await expect(adminDashboardService.getDashboard()).rejects.toThrow('Forbidden')
    })
  })
})
