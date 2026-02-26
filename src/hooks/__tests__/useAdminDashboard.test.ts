import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { adminDashboardService } from '@/services/adminDashboardService'
import { useAdminDashboard } from '@/hooks/useAdminDashboard'
import type { ReactNode } from 'react'
import { createElement } from 'react'

vi.mock('@/services/adminDashboardService', () => ({
  adminDashboardService: {
    getDashboard: vi.fn()
  }
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useAdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches admin dashboard data', async () => {
    const mockData = {
      total_revenue: 1500,
      active_users: 50,
      monitored_sites: 10,
      scraping_errors: 2,
      recent_errors: null
    }
    vi.mocked(adminDashboardService.getDashboard).mockResolvedValue(mockData)

    const { result } = renderHook(() => useAdminDashboard(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockData)
  })

  it('returns error on failure', async () => {
    vi.mocked(adminDashboardService.getDashboard).mockRejectedValue(new Error('Forbidden'))

    const { result } = renderHook(() => useAdminDashboard(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
