import { vi, describe, it, expect, beforeEach } from 'vitest'
import { api } from '@/services/api'
import { emailCampaignService } from '@/services/emailCampaignService'
import type { EmailCampaign } from '@/models/emailCampaign'

vi.mock('@/services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  }
}))

const sampleCampaign: EmailCampaign = {
  id: 1,
  name: 'Teste',
  template_id: 1,
  segment_filter: {},
  status: 'draft',
  sent_count: 0,
  failed_count: 0,
  pickup_count: 0,
  created_at: '2026-05-02T00:00:00Z',
  updated_at: '2026-05-02T00:00:00Z'
}

describe('emailCampaignService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('list returns data + total', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: { data: [sampleCampaign], total: 1 }
    })
    const res = await emailCampaignService.list({ status: 'draft' })
    expect(res).toEqual({ data: [sampleCampaign], total: 1 })
    expect(api.get).toHaveBeenCalledWith('/api/admin/email-campaigns', {
      params: { status: 'draft' }
    })
  })

  it('list with no params still sends empty params object', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: [], total: 0 } })
    await emailCampaignService.list()
    expect(api.get).toHaveBeenCalledWith('/api/admin/email-campaigns', { params: {} })
  })

  it('get fetches single campaign by id', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: sampleCampaign })
    const res = await emailCampaignService.get(1)
    expect(res).toEqual(sampleCampaign)
    expect(api.get).toHaveBeenCalledWith('/api/admin/email-campaigns/1')
  })

  it('create posts to base and returns campaign', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: sampleCampaign })
    const input = { name: 'Teste', template_id: 1, segment_filter: {} }
    const res = await emailCampaignService.create(input)
    expect(res).toEqual(sampleCampaign)
    expect(api.post).toHaveBeenCalledWith('/api/admin/email-campaigns', input)
  })

  it('update patches campaign', async () => {
    vi.mocked(api.patch).mockResolvedValue({ data: sampleCampaign })
    const input = { name: 'Atualizado' }
    const res = await emailCampaignService.update(1, input)
    expect(res).toEqual(sampleCampaign)
    expect(api.patch).toHaveBeenCalledWith('/api/admin/email-campaigns/1', input)
  })

  it('schedule posts send_at to /:id/schedule', async () => {
    const scheduled = { ...sampleCampaign, status: 'scheduled' as const }
    vi.mocked(api.post).mockResolvedValue({ data: scheduled })
    const res = await emailCampaignService.schedule(1, '2026-12-31T00:00:00Z')
    expect(res).toEqual(scheduled)
    expect(api.post).toHaveBeenCalledWith('/api/admin/email-campaigns/1/schedule', {
      send_at: '2026-12-31T00:00:00Z'
    })
  })

  it('sendNow posts to /:id/send-now', async () => {
    const sending = { ...sampleCampaign, status: 'sending' as const }
    vi.mocked(api.post).mockResolvedValue({ data: sending })
    const res = await emailCampaignService.sendNow(1)
    expect(res).toEqual(sending)
    expect(api.post).toHaveBeenCalledWith('/api/admin/email-campaigns/1/send-now')
  })

  it('cancel posts to /:id/cancel', async () => {
    const canceled = { ...sampleCampaign, status: 'canceled' as const }
    vi.mocked(api.post).mockResolvedValue({ data: canceled })
    const res = await emailCampaignService.cancel(1)
    expect(res).toEqual(canceled)
    expect(api.post).toHaveBeenCalledWith('/api/admin/email-campaigns/1/cancel')
  })

  it('duplicate posts to /:id/duplicate and returns new draft', async () => {
    const duplicated = { ...sampleCampaign, id: 2 }
    vi.mocked(api.post).mockResolvedValue({ data: duplicated })
    const res = await emailCampaignService.duplicate(1)
    expect(res).toEqual(duplicated)
    expect(api.post).toHaveBeenCalledWith('/api/admin/email-campaigns/1/duplicate')
  })

  it('remove sends DELETE to /:id', async () => {
    vi.mocked(api.delete).mockResolvedValue({})
    await emailCampaignService.remove(1)
    expect(api.delete).toHaveBeenCalledWith('/api/admin/email-campaigns/1')
  })

  it('sendNow propagates 409 status_conflict response', async () => {
    const err = {
      response: {
        status: 409,
        data: { error: 'x', code: 'status_conflict', current_status: 'sending' }
      }
    }
    vi.mocked(api.post).mockRejectedValue(err)
    await expect(emailCampaignService.sendNow(1)).rejects.toMatchObject({
      response: {
        status: 409,
        data: { code: 'status_conflict', current_status: 'sending' }
      }
    })
  })
})
