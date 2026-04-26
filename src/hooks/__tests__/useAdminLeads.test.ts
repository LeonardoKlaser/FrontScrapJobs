import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { toast } from 'sonner'
import { adminLeadsService, type AdminLead } from '@/services/adminLeadsService'
import { useAdminLeads, useSetLeadContacted } from '@/hooks/useAdminLeads'
import type { ReactNode } from 'react'
import { createElement } from 'react'

vi.mock('@/services/adminLeadsService', () => ({
  adminLeadsService: {
    list: vi.fn(),
    setContacted: vi.fn()
  }
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() }
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  })
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
  return { queryClient, wrapper }
}

const sampleLead: AdminLead = {
  id: 1,
  name: 'Ana',
  email: 'ana@test.com',
  phone: '11999998888',
  plan_id: 1,
  plan_name: 'Basic',
  attempts: 1,
  last_attempt_at: '2026-04-25T10:00:00Z',
  created_at: '2026-04-25T10:00:00Z',
  contacted_at: null
}

describe('useAdminLeads', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetches leads via service.list', async () => {
    vi.mocked(adminLeadsService.list).mockResolvedValue([sampleLead])
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useAdminLeads(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([sampleLead])
  })
})

describe('useSetLeadContacted', () => {
  beforeEach(() => vi.clearAllMocks())

  it('invalidates ["adminLeads"] on success', async () => {
    vi.mocked(adminLeadsService.setContacted).mockResolvedValue(undefined)
    const { queryClient, wrapper } = createWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useSetLeadContacted(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({ id: 42, contacted: true })
    })

    expect(adminLeadsService.setContacted).toHaveBeenCalledWith(42, true)
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['adminLeads'] })
  })

  it('on axios error, toasts the backend body.error message (not generic axios message)', async () => {
    // Simula AxiosError com body { error: "Lead não encontrado" } — caso 404 do backend.
    const axiosError = Object.assign(new Error('Request failed with status code 404'), {
      isAxiosError: true,
      name: 'AxiosError',
      response: { status: 404, data: { error: 'Lead não encontrado' } }
    })
    vi.mocked(adminLeadsService.setContacted).mockRejectedValue(axiosError)
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useSetLeadContacted(), { wrapper })

    await act(async () => {
      try {
        await result.current.mutateAsync({ id: 42, contacted: true })
      } catch {
        // mutation rejeita — esperado
      }
    })

    expect(toast.error).toHaveBeenCalledWith('Lead não encontrado')
  })

  it('on non-axios error, toasts err.message', async () => {
    vi.mocked(adminLeadsService.setContacted).mockRejectedValue(new Error('boom'))
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useSetLeadContacted(), { wrapper })

    await act(async () => {
      try {
        await result.current.mutateAsync({ id: 1, contacted: true })
      } catch {
        // expected
      }
    })

    expect(toast.error).toHaveBeenCalledWith('boom')
  })
})
