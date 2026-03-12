import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { dashboardService } from '@/services/dashboardService'
import { useDashboard, useLatestJobs } from '@/hooks/useDashboard'
import type { DashboardData, JobsResponse } from '@/models/dashboard'
import type { ReactNode } from 'react'
import { createElement } from 'react'

vi.mock('@/services/dashboardService', () => ({
  dashboardService: {
    getDashboardData: vi.fn(),
    getLatestJobs: vi.fn()
  }
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches dashboard data', async () => {
    const mockData = {
      monitored_urls_count: 3,
      new_jobs_today_count: 10,
      alerts_sent_count: 5,
      latest_jobs: [],
      user_monitored_urls: []
    }
    vi.mocked(dashboardService.getDashboardData).mockResolvedValue(mockData as DashboardData)

    const { result } = renderHook(() => useDashboard(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockData)
  })
})

describe('useLatestJobs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches jobs with params', async () => {
    const mockData = { jobs: [], total_count: 0 }
    vi.mocked(dashboardService.getLatestJobs).mockResolvedValue(mockData as JobsResponse)

    const params = { days: 7 }
    const { result } = renderHook(() => useLatestJobs(params), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(dashboardService.getLatestJobs).toHaveBeenCalledWith(params)
    expect(result.current.data).toEqual(mockData)
  })
})
