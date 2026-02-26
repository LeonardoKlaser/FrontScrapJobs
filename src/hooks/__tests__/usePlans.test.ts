import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { planService } from '@/services/planService'
import { usePlans } from '@/hooks/usePlans'
import type { Plan } from '@/models/plan'
import type { ReactNode } from 'react'
import { createElement } from 'react'

vi.mock('@/services/planService', () => ({
  planService: {
    getAllPlans: vi.fn()
  }
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('usePlans', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches plans', async () => {
    const mockPlans = [{ id: 1, name: 'Iniciante' }]
    vi.mocked(planService.getAllPlans).mockResolvedValue(mockPlans as Plan[])

    const { result } = renderHook(() => usePlans(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockPlans)
  })

  it('returns error on failure', async () => {
    vi.mocked(planService.getAllPlans).mockRejectedValue(new Error('Erro'))

    const { result } = renderHook(() => usePlans(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
