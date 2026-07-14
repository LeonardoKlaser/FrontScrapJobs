import { render, screen, cleanup, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router'
import type { ReactNode } from 'react'
import DigestPage from '@/pages/DigestPage'
import { useDigestSession } from '@/hooks/useDigestSession'
import type { DigestSessionResponse } from '@/services/digestService'

vi.mock('@/hooks/useDigestSession', () => ({
  useDigestSession: vi.fn()
}))

function wrap(ui: ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  )
}

const sessionFixture: DigestSessionResponse = {
  norte_number: '5511999999999',
  jobs: [
    {
      notification_id: 1,
      job_id: 10,
      title: 'Engenheiro de Software',
      company: 'Acme',
      location: 'Remoto',
      job_link: 'https://example.com/jobs/10',
      has_analysis: true,
      job_live: true
    },
    {
      notification_id: 2,
      job_id: 20,
      title: 'Dev Backend',
      company: 'Beta',
      location: 'São Paulo',
      job_link: 'https://example.com/jobs/20',
      has_analysis: false,
      job_live: false
    }
  ]
}

describe('DigestPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.dataLayer = []
  })

  afterEach(() => {
    cleanup()
  })

  it('renders a card per job with company and title', () => {
    vi.mocked(useDigestSession).mockReturnValue({
      data: sessionFixture,
      isLoading: false,
      isError: false,
      error: null
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    render(wrap(<DigestPage />))

    expect(screen.getByText('Engenheiro de Software')).toBeInTheDocument()
    expect(screen.getByText('Dev Backend')).toBeInTheDocument()
    // empresa em maiusculo
    expect(screen.getByText('ACME')).toBeInTheDocument()
    expect(screen.getByText('BETA')).toBeInTheDocument()
  })

  it('shows the "ja analisei" badge only when has_analysis is true', () => {
    vi.mocked(useDigestSession).mockReturnValue({
      data: sessionFixture,
      isLoading: false,
      isError: false,
      error: null
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    render(wrap(<DigestPage />))

    const badges = screen.getAllByText(/já analisei/i)
    expect(badges).toHaveLength(1)
  })

  it('shows WhatsApp deep link only for live jobs and "nao aceitando" badge for dead ones', () => {
    vi.mocked(useDigestSession).mockReturnValue({
      data: sessionFixture,
      isLoading: false,
      isError: false,
      error: null
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    render(wrap(<DigestPage />))

    const liveCard = screen.getByText('Engenheiro de Software').closest('[data-slot="card"]')
    const deadCard = screen.getByText('Dev Backend').closest('[data-slot="card"]')
    expect(liveCard).not.toBeNull()
    expect(deadCard).not.toBeNull()

    const liveWaLink = within(liveCard as HTMLElement).getByRole('link', {
      name: /analisar pelo whatsapp/i
    })
    expect(liveWaLink).toHaveAttribute('href', expect.stringContaining('wa.me/5511999999999'))

    expect(
      within(deadCard as HTMLElement).queryByRole('link', { name: /analisar pelo whatsapp/i })
    ).toBeNull()

    expect(
      within(deadCard as HTMLElement).getByText(/não está mais aceitando/i)
    ).toBeInTheDocument()
    expect(within(liveCard as HTMLElement).queryByText(/não está mais aceitando/i)).toBeNull()
  })

  it('renders the invalid-link screen on error', () => {
    vi.mocked(useDigestSession).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('not found')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    render(wrap(<DigestPage />))

    expect(screen.getByText(/inválido ou expirou/i)).toBeInTheDocument()
  })

  it('pushes external_link_clicked to dataLayer when clicking Ver vaga', async () => {
    vi.mocked(useDigestSession).mockReturnValue({
      data: sessionFixture,
      isLoading: false,
      isError: false,
      error: null
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    render(wrap(<DigestPage />))

    const liveCard = screen.getByText('Engenheiro de Software').closest('[data-slot="card"]')
    const verVaga = within(liveCard as HTMLElement).getByRole('link', { name: /ver vaga/i })
    await userEvent.click(verVaga)

    const events = (window.dataLayer ?? []).map((e) => e.event)
    expect(events).toContain('external_link_clicked')
  })

  it('fires digest_opened exactly once when data loads', async () => {
    vi.mocked(useDigestSession).mockReturnValue({
      data: sessionFixture,
      isLoading: false,
      isError: false,
      error: null
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    const { rerender } = render(wrap(<DigestPage />))
    // Re-render não deve disparar de novo — o ref guarda o once-fire.
    rerender(wrap(<DigestPage />))

    const opened = (window.dataLayer ?? []).filter((e) => e.event === 'digest_opened')
    expect(opened).toHaveLength(1)
  })
})
