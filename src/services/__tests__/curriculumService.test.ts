import { vi } from 'vitest'
import { api } from '@/services/api'
import { curriculumService } from '@/services/curriculumService'
import type { Curriculum } from '@/models/curriculum'

vi.mock('@/services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  }
}))

describe('curriculumService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getCurriculums', () => {
    it('sends GET /curriculum and returns data', async () => {
      const mockData = [{ id: 1, name: 'Main CV' }]
      vi.mocked(api.get).mockResolvedValue({ data: mockData })

      const result = await curriculumService.getCurriculums()

      expect(api.get).toHaveBeenCalledWith('/curriculum')
      expect(result).toEqual(mockData)
    })

    it('throws descriptive error on server error', async () => {
      const axiosError = Object.assign(new Error(), {
        isAxiosError: true,
        response: { data: { error: 'Erro interno' }, status: 500 }
      })
      const axios = await import('axios')
      vi.spyOn(axios.default, 'isAxiosError').mockReturnValue(true)

      vi.mocked(api.get).mockRejectedValue(axiosError)

      await expect(curriculumService.getCurriculums()).rejects.toThrow('Erro interno')
    })

    it('throws connection error on non-axios error', async () => {
      const axios = await import('axios')
      vi.spyOn(axios.default, 'isAxiosError').mockReturnValue(false)

      vi.mocked(api.get).mockRejectedValue(new Error())

      await expect(curriculumService.getCurriculums()).rejects.toThrow(
        'Não foi possível conectar ao servidor.'
      )
    })
  })

  describe('newCurriculum', () => {
    it('sends POST /curriculum', async () => {
      vi.mocked(api.post).mockResolvedValue({})

      await curriculumService.newCurriculum({ name: 'New CV' } as Omit<Curriculum, 'id'>)

      expect(api.post).toHaveBeenCalledWith('/curriculum', { name: 'New CV' })
    })
  })

  describe('updateCurriculum', () => {
    it('sends PUT /curriculum/:id and returns data', async () => {
      const curriculum = { id: 1, name: 'Updated CV' }
      vi.mocked(api.put).mockResolvedValue({ data: curriculum })

      const result = await curriculumService.updateCurriculum(curriculum as Curriculum)

      expect(api.put).toHaveBeenCalledWith('/curriculum/1', curriculum)
      expect(result).toEqual(curriculum)
    })
  })

  describe('deleteCurriculum', () => {
    it('sends DELETE /curriculum/:id', async () => {
      vi.mocked(api.delete).mockResolvedValue({})

      await curriculumService.deleteCurriculum(5)

      expect(api.delete).toHaveBeenCalledWith('/curriculum/5')
    })
  })
})
