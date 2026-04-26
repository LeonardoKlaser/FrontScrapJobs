import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/services/api'
import { adminLeadsService } from '@/services/adminLeadsService'

vi.mock('@/services/api', () => ({
  api: { get: vi.fn(), patch: vi.fn() }
}))

describe('adminLeadsService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('list() makes GET /api/admin/leads and returns the data array', async () => {
    const mockLeads = [
      {
        id: 1,
        name: 'Ana',
        email: 'ana@test.com',
        phone: '11999998888',
        plan_id: 1,
        plan_name: 'Basic',
        attempts: 1,
        last_attempt_at: '2026-04-25T10:00:00Z',
        created_at: '2026-04-25T10:00:00Z',
        contacted_at: null
      }
    ]
    vi.mocked(api.get).mockResolvedValue({ data: mockLeads })

    const result = await adminLeadsService.list()

    expect(api.get).toHaveBeenCalledWith('/api/admin/leads')
    expect(result).toEqual(mockLeads)
  })

  it('setContacted(id, true) makes PATCH with body { contacted: true }', async () => {
    vi.mocked(api.patch).mockResolvedValue({ data: null })

    await adminLeadsService.setContacted(42, true)

    expect(api.patch).toHaveBeenCalledWith('/api/admin/leads/42/contacted', { contacted: true })
  })

  it('setContacted(id, false) makes PATCH with body { contacted: false }', async () => {
    vi.mocked(api.patch).mockResolvedValue({ data: null })

    await adminLeadsService.setContacted(42, false)

    expect(api.patch).toHaveBeenCalledWith('/api/admin/leads/42/contacted', { contacted: false })
  })
})
