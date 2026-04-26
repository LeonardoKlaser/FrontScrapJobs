import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ReactNode } from 'react'

import AdminLeadsPage from '@/pages/adminLeads'
import { useAdminLeads, useSetLeadContacted } from '@/hooks/useAdminLeads'
import type { AdminLead } from '@/services/adminLeadsService'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: { defaultValue?: string; date?: string }) => {
      if (opts?.date) return (opts.defaultValue ?? key).replace('{{date}}', opts.date)
      return opts?.defaultValue ?? key
    }
  })
}))

vi.mock('@/hooks/useAdminLeads', () => ({
  useAdminLeads: vi.fn(),
  useSetLeadContacted: vi.fn()
}))

function wrap(ui: ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  )
}

const mockMutate = vi.fn()

// Helper: mock do hook de mutation. A página agora trackeia pending state
// localmente via Set<number> + onMutate/onSettled passado pra mutate(),
// então a mock só precisa simular o método mutate; pending por linha é
// observado clicando o botão (que sincronicamente adiciona id ao Set).
function setMutationMock() {
  vi.mocked(useSetLeadContacted).mockReturnValue({
    mutate: mockMutate,
    isPending: false,
    variables: undefined
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any)
}

const baseLead = (overrides: Partial<AdminLead> = {}): AdminLead => ({
  id: 1,
  name: 'Ana Silva',
  email: 'ana@test.com',
  phone: '11999998888',
  plan_id: 1,
  plan_name: 'Basic',
  attempts: 1,
  last_attempt_at: '2026-04-25T10:00:00Z',
  created_at: '2026-04-25T10:00:00Z',
  contacted_at: null,
  ...overrides
})

describe('AdminLeadsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setMutationMock()
  })

  it('renders rows with lead data', () => {
    vi.mocked(useAdminLeads).mockReturnValue({
      data: [
        baseLead({ id: 1, name: 'Ana Silva', email: 'ana@test.com' }),
        baseLead({ id: 2, name: 'Bruno Lima', email: 'bruno@test.com', phone: '21988887777' })
      ],
      isLoading: false,
      isError: false
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(wrap(<AdminLeadsPage />))

    expect(screen.getByText('Ana Silva')).toBeInTheDocument()
    expect(screen.getByText('Bruno Lima')).toBeInTheDocument()
    expect(screen.getByText('ana@test.com')).toBeInTheDocument()
  })

  it('renders error state with retry when isError', async () => {
    const refetch = vi.fn()
    vi.mocked(useAdminLeads).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(wrap(<AdminLeadsPage />))

    expect(screen.getByText('Erro ao carregar leads')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Tentar novamente/i }))
    expect(refetch).toHaveBeenCalled()
  })

  it('hides contacted leads by default and shows them when toggle is off', async () => {
    vi.mocked(useAdminLeads).mockReturnValue({
      data: [
        baseLead({ id: 1, name: 'Ana Silva', contacted_at: null }),
        baseLead({ id: 2, name: 'Bruno Lima', contacted_at: '2026-04-24T10:00:00Z' })
      ],
      isLoading: false,
      isError: false
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(wrap(<AdminLeadsPage />))

    expect(screen.getByText('Ana Silva')).toBeInTheDocument()
    expect(screen.queryByText('Bruno Lima')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('switch'))

    expect(screen.getByText('Bruno Lima')).toBeInTheDocument()
  })

  it('filters by name when typing in search', async () => {
    vi.mocked(useAdminLeads).mockReturnValue({
      data: [
        baseLead({ id: 1, name: 'Ana Silva' }),
        baseLead({ id: 2, name: 'Bruno Lima', email: 'bruno@test.com' })
      ],
      isLoading: false,
      isError: false
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(wrap(<AdminLeadsPage />))

    await userEvent.type(screen.getByPlaceholderText('Buscar por nome ou email...'), 'bruno')

    expect(screen.getByText('Bruno Lima')).toBeInTheDocument()
    expect(screen.queryByText('Ana Silva')).not.toBeInTheDocument()
  })

  it('filters by email when typing in search', async () => {
    vi.mocked(useAdminLeads).mockReturnValue({
      data: [
        baseLead({ id: 1, name: 'Ana Silva', email: 'ana@test.com' }),
        baseLead({ id: 2, name: 'Bruno Lima', email: 'bruno@test.com' })
      ],
      isLoading: false,
      isError: false
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(wrap(<AdminLeadsPage />))

    await userEvent.type(screen.getByPlaceholderText('Buscar por nome ou email...'), 'bruno@')

    expect(screen.getByText('Bruno Lima')).toBeInTheDocument()
    expect(screen.queryByText('Ana Silva')).not.toBeInTheDocument()
  })

  it('clicking mark-contacted calls mutate with id and true', async () => {
    vi.mocked(useAdminLeads).mockReturnValue({
      data: [baseLead({ id: 42, name: 'Ana Silva', contacted_at: null })],
      isLoading: false,
      isError: false
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(wrap(<AdminLeadsPage />))

    const row = screen.getByText('Ana Silva').closest('tr')!
    const btn = within(row).getByRole('button', { name: /Marcar como contatado/i })
    await userEvent.click(btn)

    // Página passa onSettled como segundo arg pro per-row pending tracking.
    expect(mockMutate).toHaveBeenCalledTimes(1)
    expect(mockMutate.mock.calls[0][0]).toEqual({ id: 42, contacted: true })
  })

  it('shows unmark on contacted row (toggle off) and calls mutate with false', async () => {
    vi.mocked(useAdminLeads).mockReturnValue({
      data: [baseLead({ id: 7, name: 'Bruno Lima', contacted_at: '2026-04-24T10:00:00Z' })],
      isLoading: false,
      isError: false
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(wrap(<AdminLeadsPage />))

    await userEvent.click(screen.getByRole('switch'))

    const row = screen.getByText('Bruno Lima').closest('tr')!
    const btn = within(row).getByRole('button', { name: /Desmarcar/i })
    await userEvent.click(btn)

    expect(mockMutate).toHaveBeenCalledTimes(1)
    expect(mockMutate.mock.calls[0][0]).toEqual({ id: 7, contacted: false })
  })

  it('clicking a row disables only that row button, leaving others enabled', async () => {
    // mockMutate não chama onSettled — então o id fica em pendingIds após o click,
    // deixando o botão da Ana disabled. Bruno permanece habilitado.
    vi.mocked(useAdminLeads).mockReturnValue({
      data: [
        baseLead({ id: 1, name: 'Ana Silva' }),
        baseLead({ id: 2, name: 'Bruno Lima', email: 'bruno@test.com' })
      ],
      isLoading: false,
      isError: false
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(wrap(<AdminLeadsPage />))

    const anaRow = screen.getByText('Ana Silva').closest('tr')!
    const brunoRow = screen.getByText('Bruno Lima').closest('tr')!
    const anaBtn = within(anaRow).getByRole('button', { name: /Marcar como contatado/i })

    await userEvent.click(anaBtn)

    expect(anaBtn).toBeDisabled()
    expect(
      within(brunoRow).getByRole('button', { name: /Marcar como contatado/i })
    ).not.toBeDisabled()
  })

  it('renders forbidden state on 403 (distinct from generic error)', async () => {
    const axiosError = Object.assign(new Error('Request failed with status code 403'), {
      isAxiosError: true,
      response: { status: 403, data: { error: 'forbidden' } }
    })
    vi.mocked(useAdminLeads).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: axiosError,
      refetch: vi.fn()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(wrap(<AdminLeadsPage />))

    expect(screen.getByText('Sem permissão')).toBeInTheDocument()
    // Não mostra retry no caso 403
    expect(screen.queryByRole('button', { name: /Tentar novamente/i })).not.toBeInTheDocument()
  })

  it('falls back to "-" when contacted_at is invalid (no crash)', () => {
    vi.mocked(useAdminLeads).mockReturnValue({
      data: [baseLead({ id: 1, name: 'Ana Silva', contacted_at: 'not-a-date' })],
      isLoading: false,
      isError: false
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    // Tem que renderizar com toggle ligado (default oculta) → liga o switch primeiro
    render(wrap(<AdminLeadsPage />))
    fireEvent.click(screen.getByRole('switch'))

    // Página renderiza sem RangeError; badge "Contatado em -"
    expect(screen.getByText('Ana Silva')).toBeInTheDocument()
    expect(screen.getByText(/Contatado em -/)).toBeInTheDocument()
  })

  it('strips leading 55 from phone if length > 11 (defensa em profundidade)', () => {
    vi.mocked(useAdminLeads).mockReturnValue({
      data: [baseLead({ id: 1, name: 'Ana Silva', phone: '5511999998888' })],
      isLoading: false,
      isError: false
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(wrap(<AdminLeadsPage />))

    const row = screen.getByText('Ana Silva').closest('tr')!
    const link = within(row).getByRole('link', { name: /WhatsApp/i })
    // 55 + 11 dígitos = wa.me/5511999998888 (não 555511...)
    expect(link.getAttribute('href')).toContain('https://wa.me/5511999998888')
  })

  it('renders WhatsApp link with valid phone (wa.me/55<digits>, target=_blank)', () => {
    vi.mocked(useAdminLeads).mockReturnValue({
      data: [baseLead({ id: 1, name: 'Ana Silva', phone: '11999998888' })],
      isLoading: false,
      isError: false
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(wrap(<AdminLeadsPage />))

    const row = screen.getByText('Ana Silva').closest('tr')!
    const link = within(row).getByRole('link', { name: /WhatsApp/i })

    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
    const href = link.getAttribute('href') || ''
    expect(href).toContain('https://wa.me/5511999998888')
    expect(href).toContain('text=')
    expect(decodeURIComponent(href.split('text=')[1])).toContain('Ana')
  })

  it('strips non-digits from phone in WhatsApp url', () => {
    vi.mocked(useAdminLeads).mockReturnValue({
      data: [baseLead({ id: 1, name: 'Ana Silva', phone: '(11) 99999-8888' })],
      isLoading: false,
      isError: false
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(wrap(<AdminLeadsPage />))

    const row = screen.getByText('Ana Silva').closest('tr')!
    const link = within(row).getByRole('link', { name: /WhatsApp/i })
    expect(link.getAttribute('href')).toContain('wa.me/5511999998888')
  })

  it('renders disabled WhatsApp button (no link) when phone is invalid', () => {
    vi.mocked(useAdminLeads).mockReturnValue({
      data: [baseLead({ id: 1, name: 'Ana Silva', phone: '123' })],
      isLoading: false,
      isError: false
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(wrap(<AdminLeadsPage />))

    const row = screen.getByText('Ana Silva').closest('tr')!
    expect(within(row).queryByRole('link', { name: /WhatsApp/i })).not.toBeInTheDocument()
    const btn = within(row).getByRole('button', { name: /WhatsApp/i })
    expect(btn).toBeDisabled()
  })
})
