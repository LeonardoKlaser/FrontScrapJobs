import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/services/api'
import { saveLead } from '@/services/leadsService'

vi.mock('@/services/api', () => ({
  api: { post: vi.fn() }
}))

describe('leadsService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('posts to /api/leads with the request payload', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { saved: true } })

    const result = await saveLead({
      name: 'João',
      email: 'joao@test.com',
      phone: '11987654321',
      plan_id: 2
    })

    expect(api.post).toHaveBeenCalledWith('/api/leads', {
      name: 'João',
      email: 'joao@test.com',
      phone: '11987654321',
      plan_id: 2
    })
    expect(result).toEqual({ saved: true })
  })

  it('returns saved=false when backend skips (existing user)', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { saved: false } })

    const result = await saveLead({
      name: 'X',
      email: 'existing@test.com',
      phone: '11999999999',
      plan_id: 1
    })

    expect(result.saved).toBe(false)
  })
})
