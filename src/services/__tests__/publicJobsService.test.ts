import { vi } from 'vitest'
import { api } from '@/services/api'
import { publicJobsService } from '@/services/publicJobsService'

vi.mock('@/services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  }
}))

describe('publicJobsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getRecentJobs', () => {
    it('sends GET /api/public/jobs/recent with the area and returns data', async () => {
      const mockData = {
        jobs: [
          {
            title: 'Senior Software Engineer',
            company: 'QuintoAndar Carreiras',
            logo_url: 'https://cdn/logo.png',
            posted_hours_ago: 5
          }
        ],
        today_count: 57
      }
      vi.mocked(api.get).mockResolvedValue({ data: mockData })

      const result = await publicJobsService.getRecentJobs('design')

      expect(api.get).toHaveBeenCalledWith('/api/public/jobs/recent', {
        params: { area: 'design' }
      })
      expect(result).toEqual(mockData)
    })
  })
})
