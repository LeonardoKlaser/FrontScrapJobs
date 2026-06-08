import { describe, it, expect, afterEach } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import { api } from '@/services/api'
import { publicJobsService } from '@/services/publicJobsService'

const mock = new MockAdapter(api)
afterEach(() => mock.reset())

describe('publicJobsService.getRecentJobs', () => {
  it('requests the recent jobs endpoint with the area query param', async () => {
    mock.onGet('/api/public/jobs/recent', { params: { area: 'dev' } }).reply(200, {
      jobs: [{ title: 'Eng', company: 'Nubank', logo_url: 'x', posted_hours_ago: 2 }],
      today_count: 23
    })
    const res = await publicJobsService.getRecentJobs('dev')
    expect(res.jobs).toHaveLength(1)
    expect(res.today_count).toBe(23)
    expect(res.jobs[0].company).toBe('Nubank')
  })

  it('propagates errors so the hook can fall back', async () => {
    mock.onGet('/api/public/jobs/recent').reply(500)
    await expect(publicJobsService.getRecentJobs('dev')).rejects.toThrow()
  })
})
