import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { publicJobsService } from '@/services/publicJobsService'
import { usePublicRecentJobs } from '@/hooks/usePublicRecentJobs'
import type { ReactNode } from 'react'
import { createElement } from 'react'

vi.mock('@/services/publicJobsService', () => ({
  publicJobsService: {
    getRecentJobs: vi.fn()
  }
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('usePublicRecentJobs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches recent jobs for the given area', async () => {
    const mockData = { jobs: [], today_count: 12 }
    vi.mocked(publicJobsService.getRecentJobs).mockResolvedValue(mockData)

    const { result } = renderHook(() => usePublicRecentJobs('all'), {
      wrapper: createWrapper()
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(publicJobsService.getRecentJobs).toHaveBeenCalledWith('all')
    expect(result.current.data).toEqual(mockData)
  })

  it('refetches when the area changes', async () => {
    vi.mocked(publicJobsService.getRecentJobs).mockResolvedValue({
      jobs: [],
      today_count: 1
    })

    const { result, rerender } = renderHook(({ area }) => usePublicRecentJobs(area), {
      wrapper: createWrapper(),
      initialProps: { area: 'all' }
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    rerender({ area: 'design' })

    await waitFor(() => expect(publicJobsService.getRecentJobs).toHaveBeenCalledWith('design'))
  })
})
