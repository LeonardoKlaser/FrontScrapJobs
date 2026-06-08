import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router'
import { HeroDemoSection } from '@/components/landingPage/hero-demo-section'
import * as svc from '@/services/publicJobsService'

vi.mock('@/hooks/usePublicStats', () => ({
  usePublicStats: () => ({ data: { monitored_sites: 87, total_jobs: 1000 }, error: null })
}))

function renderHero() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <HeroDemoSection />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

const FOUR = {
  jobs: [
    { title: 'Eng A', company: 'Nubank', logo_url: '', posted_hours_ago: 2 },
    { title: 'Eng B', company: 'iFood', logo_url: '', posted_hours_ago: 4 },
    { title: 'Eng C', company: 'Meli', logo_url: '', posted_hours_ago: 5 },
    { title: 'Eng D', company: 'Itau', logo_url: '', posted_hours_ago: 6 }
  ],
  today_count: 23
}

beforeEach(() => vi.restoreAllMocks())

describe('HeroDemoSection', () => {
  it('renders real jobs and the today counter when count >= 3', async () => {
    vi.spyOn(svc.publicJobsService, 'getRecentJobs').mockResolvedValue(FOUR)
    renderHero()
    expect(await screen.findByText('Eng A')).toBeInTheDocument()
    expect(screen.getByText(/23 vagas novas hoje/)).toBeInTheDocument()
  })

  it('hides the counter when today_count < 3', async () => {
    vi.spyOn(svc.publicJobsService, 'getRecentJobs').mockResolvedValue({ ...FOUR, today_count: 1 })
    renderHero()
    await screen.findByText('Eng A')
    expect(screen.queryByText(/vagas novas hoje/)).not.toBeInTheDocument()
  })

  it('shows the per-area message on an empty 200 response', async () => {
    vi.spyOn(svc.publicJobsService, 'getRecentJobs').mockResolvedValue({ jobs: [], today_count: 0 })
    renderHero()
    expect(await screen.findByText(/Nada novo nas últimas horas/)).toBeInTheDocument()
  })

  it('falls back to static toasts (and hides chips) on error', async () => {
    vi.spyOn(svc.publicJobsService, 'getRecentJobs').mockRejectedValue(new Error('boom'))
    renderHero()
    // the static HeroToastNotifications renders "Nova vaga: ..." cards.
    // usePublicJobs hardcodes retry:1, so the error state only settles after one
    // backoff (~1s) — give waitFor enough headroom past its 1000ms default.
    await waitFor(() => expect(screen.getAllByText(/Nova vaga:/).length).toBeGreaterThan(0), {
      timeout: 5000
    })
    expect(screen.queryByText('Eng A')).not.toBeInTheDocument()
    // chips disappear in fallback mode
    expect(screen.queryByRole('button', { name: 'Dev' })).not.toBeInTheDocument()
  })

  it('blurs only the last card when N>=2 (aria-hidden + tabindex)', async () => {
    vi.spyOn(svc.publicJobsService, 'getRecentJobs').mockResolvedValue(FOUR)
    renderHero()
    await screen.findByText('Eng A')
    // first card is interactive, last card is the blurred teaser
    expect(screen.getByText('Eng A').closest('[aria-hidden="true"]')).toBeNull()
    expect(screen.getByText('Eng D').closest('[aria-hidden="true"]')).not.toBeNull()
  })

  it('never blurs the card when only one job comes back', async () => {
    vi.spyOn(svc.publicJobsService, 'getRecentJobs').mockResolvedValue({
      jobs: [{ title: 'Solo', company: 'Nubank', logo_url: '', posted_hours_ago: 1 }],
      today_count: 0
    })
    renderHero()
    await screen.findByText('Solo')
    expect(screen.getByText('Solo').closest('[aria-hidden="true"]')).toBeNull()
  })

  it('refetches when a chip is clicked', async () => {
    const spy = vi.spyOn(svc.publicJobsService, 'getRecentJobs').mockResolvedValue(FOUR)
    renderHero()
    await screen.findByText('Eng A')
    fireEvent.click(screen.getByRole('button', { name: 'Produto' }))
    await waitFor(() => expect(spy).toHaveBeenCalledWith('produto'))
  })
})
