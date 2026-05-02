import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ReactNode } from 'react'
import { createElement } from 'react'
import { emailCampaignService } from '@/services/emailCampaignService'
import {
  campaignKeys,
  useCancelCampaign,
  useCreateCampaign,
  useDeleteCampaign,
  useDuplicateCampaign,
  useEmailCampaign,
  useEmailCampaigns,
  useScheduleCampaign,
  useSendNowCampaign,
  useUpdateCampaign
} from '@/hooks/useEmailCampaigns'
import type { EmailCampaign } from '@/models/emailCampaign'

vi.mock('@/services/emailCampaignService', () => ({
  emailCampaignService: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    schedule: vi.fn(),
    sendNow: vi.fn(),
    cancel: vi.fn(),
    duplicate: vi.fn(),
    remove: vi.fn()
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

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  })
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
  return { queryClient, wrapper }
}

// Helper: lê o refetchInterval configurado pelo observer (não pelo Query).
// useQuery passa refetchInterval no QueryObserverOptions; query.options expõe
// apenas QueryOptions (sem o campo). Inspecionamos via observers[0].options
// pra avaliar a função e validar polling em sending/scheduled vs terminal.
type RefetchIntervalFn = (q: unknown) => number | false | undefined
function getRefetchInterval(qc: QueryClient, id: number): number | false {
  const query = qc.getQueryCache().find({ queryKey: campaignKeys.detail(id) })
  if (!query) return false
  const observer = query.observers[0] as
    | { options: { refetchInterval?: number | false | RefetchIntervalFn } }
    | undefined
  if (!observer) return false
  const opt = observer.options.refetchInterval
  if (typeof opt === 'function') {
    const v = opt(query)
    return v === undefined ? false : v
  }
  return opt ?? false
}

describe('useEmailCampaigns', () => {
  beforeEach(() => vi.clearAllMocks())

  it('chama service.list e expõe data', async () => {
    vi.mocked(emailCampaignService.list).mockResolvedValue({
      data: [sampleCampaign],
      total: 1
    })
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useEmailCampaigns({ status: 'draft' }), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: [sampleCampaign], total: 1 })
    expect(emailCampaignService.list).toHaveBeenCalledWith({ status: 'draft' })
  })
})

describe('useEmailCampaign', () => {
  beforeEach(() => vi.clearAllMocks())

  it('chama service.get quando id é fornecido', async () => {
    vi.mocked(emailCampaignService.get).mockResolvedValue(sampleCampaign)
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useEmailCampaign(1), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(emailCampaignService.get).toHaveBeenCalledWith(1)
    expect(result.current.data).toEqual(sampleCampaign)
  })

  it('fica disabled quando id é null', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useEmailCampaign(null), { wrapper })

    expect(result.current.fetchStatus).toBe('idle')
    expect(emailCampaignService.get).not.toHaveBeenCalled()
  })

  it('fica disabled quando id é undefined', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useEmailCampaign(undefined), { wrapper })

    expect(result.current.fetchStatus).toBe('idle')
    expect(emailCampaignService.get).not.toHaveBeenCalled()
  })

  it('fica disabled quando id é 0', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useEmailCampaign(0), { wrapper })

    expect(result.current.fetchStatus).toBe('idle')
    expect(emailCampaignService.get).not.toHaveBeenCalled()
  })

  it("polla a cada 5000ms quando status='sending'", async () => {
    vi.mocked(emailCampaignService.get).mockResolvedValue({
      ...sampleCampaign,
      status: 'sending'
    })
    const { queryClient, wrapper } = createWrapper()

    const { result } = renderHook(() => useEmailCampaign(1), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(getRefetchInterval(queryClient, 1)).toBe(5000)
  })

  it("polla a cada 5000ms quando status='scheduled' e send_at <60s no futuro", async () => {
    // Polling adaptativo (multi-review): 5s só quando o disparo é iminente.
    // Sem send_at ou send_at longe → false pra evitar req-storm em campanhas
    // agendadas pra dias/semanas no futuro.
    const sendAt = new Date(Date.now() + 30_000).toISOString()
    vi.mocked(emailCampaignService.get).mockResolvedValue({
      ...sampleCampaign,
      status: 'scheduled',
      send_at: sendAt
    })
    const { queryClient, wrapper } = createWrapper()

    const { result } = renderHook(() => useEmailCampaign(1), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(getRefetchInterval(queryClient, 1)).toBe(5000)
  })

  it("polla a cada 30000ms quando status='scheduled' e send_at <5min no futuro", async () => {
    const sendAt = new Date(Date.now() + 3 * 60_000).toISOString()
    vi.mocked(emailCampaignService.get).mockResolvedValue({
      ...sampleCampaign,
      status: 'scheduled',
      send_at: sendAt
    })
    const { queryClient, wrapper } = createWrapper()

    const { result } = renderHook(() => useEmailCampaign(1), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(getRefetchInterval(queryClient, 1)).toBe(30000)
  })

  it("NÃO polla quando status='scheduled' e send_at longe no futuro", async () => {
    const sendAt = new Date(Date.now() + 24 * 60 * 60_000).toISOString()
    vi.mocked(emailCampaignService.get).mockResolvedValue({
      ...sampleCampaign,
      status: 'scheduled',
      send_at: sendAt
    })
    const { queryClient, wrapper } = createWrapper()

    const { result } = renderHook(() => useEmailCampaign(1), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(getRefetchInterval(queryClient, 1)).toBe(false)
  })

  it("NÃO polla quando status='scheduled' sem send_at", async () => {
    vi.mocked(emailCampaignService.get).mockResolvedValue({
      ...sampleCampaign,
      status: 'scheduled'
    })
    const { queryClient, wrapper } = createWrapper()

    const { result } = renderHook(() => useEmailCampaign(1), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(getRefetchInterval(queryClient, 1)).toBe(false)
  })

  it("NÃO polla quando status='sent' (terminal)", async () => {
    vi.mocked(emailCampaignService.get).mockResolvedValue({
      ...sampleCampaign,
      status: 'sent'
    })
    const { queryClient, wrapper } = createWrapper()

    const { result } = renderHook(() => useEmailCampaign(1), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(getRefetchInterval(queryClient, 1)).toBe(false)
  })
})

describe('useCreateCampaign', () => {
  beforeEach(() => vi.clearAllMocks())

  it('invalida campaignKeys.all em sucesso', async () => {
    vi.mocked(emailCampaignService.create).mockResolvedValue(sampleCampaign)
    const { queryClient, wrapper } = createWrapper()
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useCreateCampaign(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({
        name: 'X',
        template_id: 1,
        segment_filter: {}
      })
    })

    expect(spy).toHaveBeenCalledWith({ queryKey: campaignKeys.all })
  })
})

describe('useUpdateCampaign', () => {
  beforeEach(() => vi.clearAllMocks())

  it('invalida list + detail em sucesso', async () => {
    vi.mocked(emailCampaignService.update).mockResolvedValue(sampleCampaign)
    const { queryClient, wrapper } = createWrapper()
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useUpdateCampaign(1), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({ name: 'Novo' })
    })

    expect(spy).toHaveBeenCalledWith({ queryKey: campaignKeys.all })
    expect(spy).toHaveBeenCalledWith({ queryKey: campaignKeys.detail(1) })
  })
})

describe('useScheduleCampaign', () => {
  beforeEach(() => vi.clearAllMocks())

  it('invalida list + detail em sucesso', async () => {
    vi.mocked(emailCampaignService.schedule).mockResolvedValue(sampleCampaign)
    const { queryClient, wrapper } = createWrapper()
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useScheduleCampaign(7), { wrapper })

    await act(async () => {
      await result.current.mutateAsync('2026-12-31T00:00:00Z')
    })

    expect(spy).toHaveBeenCalledWith({ queryKey: campaignKeys.all })
    expect(spy).toHaveBeenCalledWith({ queryKey: campaignKeys.detail(7) })
  })
})

describe('useSendNowCampaign', () => {
  beforeEach(() => vi.clearAllMocks())

  it('invalida list + detail em sucesso', async () => {
    vi.mocked(emailCampaignService.sendNow).mockResolvedValue(sampleCampaign)
    const { queryClient, wrapper } = createWrapper()
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useSendNowCampaign(2), { wrapper })

    await act(async () => {
      await result.current.mutateAsync()
    })

    expect(spy).toHaveBeenCalledWith({ queryKey: campaignKeys.all })
    expect(spy).toHaveBeenCalledWith({ queryKey: campaignKeys.detail(2) })
  })
})

describe('useCancelCampaign', () => {
  beforeEach(() => vi.clearAllMocks())

  it('invalida list + detail em sucesso', async () => {
    vi.mocked(emailCampaignService.cancel).mockResolvedValue(sampleCampaign)
    const { queryClient, wrapper } = createWrapper()
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useCancelCampaign(3), { wrapper })

    await act(async () => {
      await result.current.mutateAsync()
    })

    expect(spy).toHaveBeenCalledWith({ queryKey: campaignKeys.all })
    expect(spy).toHaveBeenCalledWith({ queryKey: campaignKeys.detail(3) })
  })
})

describe('useDuplicateCampaign', () => {
  beforeEach(() => vi.clearAllMocks())

  it('invalida campaignKeys.all em sucesso', async () => {
    vi.mocked(emailCampaignService.duplicate).mockResolvedValue(sampleCampaign)
    const { queryClient, wrapper } = createWrapper()
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useDuplicateCampaign(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync(1)
    })

    expect(spy).toHaveBeenCalledWith({ queryKey: campaignKeys.all })
  })
})

describe('useDeleteCampaign', () => {
  beforeEach(() => vi.clearAllMocks())

  it('invalida campaignKeys.all em sucesso', async () => {
    vi.mocked(emailCampaignService.remove).mockResolvedValue(undefined)
    const { queryClient, wrapper } = createWrapper()
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useDeleteCampaign(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync(1)
    })

    expect(spy).toHaveBeenCalledWith({ queryKey: campaignKeys.all })
  })
})
