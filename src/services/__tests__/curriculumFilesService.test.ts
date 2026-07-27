import { describe, it, expect, beforeEach } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import { api } from '../api'
import { curriculumFilesService } from '../curriculumFilesService'

const mock = new MockAdapter(api)

beforeEach(() => mock.reset())

describe('curriculumFilesService', () => {
  describe('list', () => {
    it('sends GET /api/curriculum-files and maps data.files', async () => {
      const files = [
        {
          id: 1,
          filename: 'cv.pdf',
          size_bytes: 1024,
          is_principal: true,
          created_at: '2026-01-01'
        }
      ]
      mock.onGet('/api/curriculum-files').reply(200, { files })

      const result = await curriculumFilesService.list()

      expect(result).toEqual(files)
    })
  })

  describe('upload', () => {
    it('sends POST /api/curriculum-files with FormData field "file"', async () => {
      const file = new File(['pdf-bytes'], 'cv.pdf', { type: 'application/pdf' })
      const created = {
        id: 2,
        filename: 'cv.pdf',
        size_bytes: 9,
        is_principal: false,
        created_at: '2026-01-02'
      }
      mock.onPost('/api/curriculum-files').reply((config) => {
        expect(config.data).toBeInstanceOf(FormData)
        expect((config.data as FormData).get('file')).toBe(file)
        return [201, { file: created }]
      })

      const result = await curriculumFilesService.upload(file)

      expect(result).toEqual(created)
    })

    it('propagates limit_reached (409) untouched', async () => {
      const file = new File(['pdf-bytes'], 'cv.pdf', { type: 'application/pdf' })
      mock.onPost('/api/curriculum-files').reply(409, { error: 'limit_reached' })

      await expect(curriculumFilesService.upload(file)).rejects.toMatchObject({
        response: { status: 409, data: { error: 'limit_reached' } }
      })
    })

    it('propagates invalid_format (400) untouched', async () => {
      const file = new File(['not-a-pdf'], 'cv.txt', { type: 'text/plain' })
      mock.onPost('/api/curriculum-files').reply(400, { error: 'invalid_format' })

      await expect(curriculumFilesService.upload(file)).rejects.toMatchObject({
        response: { status: 400, data: { error: 'invalid_format' } }
      })
    })
  })

  describe('remove', () => {
    it('sends DELETE /api/curriculum-files/:id', async () => {
      mock.onDelete('/api/curriculum-files/5').reply(204)

      await curriculumFilesService.remove(5)

      expect(mock.history.delete.length).toBe(1)
    })
  })

  describe('setPrincipal', () => {
    it('sends PATCH /api/curriculum-files/:id/principal', async () => {
      mock.onPatch('/api/curriculum-files/7/principal').reply(204)

      await curriculumFilesService.setPrincipal(7)

      expect(mock.history.patch.length).toBe(1)
    })
  })

  describe('downloadUrl', () => {
    it('builds the presigned-download URL from baseURL', () => {
      const result = curriculumFilesService.downloadUrl(9)

      expect(result).toBe(`${api.defaults.baseURL}/api/curriculum-files/9/download`)
    })
  })
})
