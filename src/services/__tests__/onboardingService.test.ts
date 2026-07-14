import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '@/services/api'
import { completeWebOnboarding } from '@/services/onboardingService'

vi.mock('@/services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn()
  }
}))

describe('onboardingService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('persiste a conclusão do wizard autenticado', async () => {
    vi.mocked(api.post).mockResolvedValue({})

    await completeWebOnboarding()

    expect(api.post).toHaveBeenCalledWith('/api/user/onboarding/complete')
  })
})
