import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { siteCareerService } from '@/services/siteCareerService'
import { useRegisterUserSite, useUnregisterUserSite } from '@/hooks/useRegisterUserSite'
import type { UserSiteRequest } from '@/models/siteCareer'
import type { ReactNode } from 'react'
import { createElement } from 'react'

vi.mock('@/services/siteCareerService', () => ({
  siteCareerService: {
    registerUserSite: vi.fn(),
    unregisterUserFromSite: vi.fn()
  }
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useRegisterUserSite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls registerUserSite on mutate', async () => {
    const request = { site_id: 1, target_words: ['dev'] }
    vi.mocked(siteCareerService.registerUserSite).mockResolvedValue({ id: 1 })

    const { result } = renderHook(() => useRegisterUserSite(), { wrapper: createWrapper() })

    await act(async () => {
      result.current.mutate(request as UserSiteRequest)
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(siteCareerService.registerUserSite).toHaveBeenCalledWith(request)
  })
})

describe('useUnregisterUserSite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls unregisterUserFromSite on mutate', async () => {
    vi.mocked(siteCareerService.unregisterUserFromSite).mockResolvedValue(undefined)

    const { result } = renderHook(() => useUnregisterUserSite(), { wrapper: createWrapper() })

    await act(async () => {
      result.current.mutate(42)
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(siteCareerService.unregisterUserFromSite).toHaveBeenCalledWith(42)
  })
})
