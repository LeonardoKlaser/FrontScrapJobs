import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { dashboardService } from '@/services/dashboardService'
import { useDashboard, useLatestJobs } from '@/hooks/useDashboard'
import type { DashboardData, PaginatedJobsResponse } from '@/models/dashboard'
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
    const mockData = { total_jobs: 10, active_sites: 3 }
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
    const mockData = { jobs: [], total: 0, page: 1, limit: 10 }
    vi.mocked(dashboardService.getLatestJobs).mockResolvedValue(mockData as PaginatedJobsResponse)

    const params = { days: 7, page: 1, limit: 10 }
    const { result } = renderHook(() => useLatestJobs(params), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(dashboardService.getLatestJobs).toHaveBeenCalledWith(params)
    expect(result.current.data).toEqual(mockData)
  })
})
