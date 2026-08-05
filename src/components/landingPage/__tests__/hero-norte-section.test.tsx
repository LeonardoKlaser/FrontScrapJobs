import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { HeroNorteSection } from '@/components/landingPage/hero-norte-section'
import * as analytics from '@/lib/analytics'
import { publicJobsService } from '@/services/publicJobsService'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

vi.mock('qrcode', () => ({
  default: { toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,AAAA') }
}))

vi.mock('@/services/publicJobsService', () => ({
  publicJobsService: { getRecentJobs: vi.fn() }
}))

beforeEach(() => {
  vi.clearAllMocks()
  // buildWaLink('web') é avaliado no JSX do WhatsAppCtaButton mesmo com o
  // Dialog fechado — sem stub, o console.warn de env ausente dispara em
  // todo teste que renderiza o CTA (ver landing-wa.test.ts pro caso do warn
  // em si).
  vi.stubEnv('VITE_NORTE_WA_NUMBER', '5551999990000')
  vi.mocked(publicJobsService.getRecentJobs).mockResolvedValue({
    jobs: [
      {
        title: 'Senior Software Engineer - IAM',
        company: 'QuintoAndar Carreiras',
        logo_url: 'https://cdn/qa.png',
        posted_hours_ago: 5
      }
    ],
    today_count: 312
  })
})

afterEach(() => vi.unstubAllEnvs())

function renderHero() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <HeroNorteSection />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('HeroNorteSection', () => {
  it('renderiza a proposta principal e vagas reais, sem mock de empresa', async () => {
    renderHero()
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Receba as vagas mais recentes no seu WhatsApp.'
      })
    ).toBeInTheDocument()
    expect(screen.getByText('Veja vagas de')).toBeInTheDocument()

    await waitFor(() =>
      expect(screen.getByText('Senior Software Engineer - IAM')).toBeInTheDocument()
    )
    expect(screen.getByText('QuintoAndar')).toBeInTheDocument()
    expect(screen.queryByText(/Empresa A|Empresa B/)).not.toBeInTheDocument()
    expect(screen.queryByText(/CV_Nubank\.pdf|CV otimizado|92% match/i)).not.toBeInTheDocument()
    expect(screen.queryByText('online')).not.toBeInTheDocument()
  })

  it('tracks section:hero and opens the WhatsApp modal on CTA click', () => {
    const track = vi.spyOn(analytics, 'trackLanding').mockImplementation(() => {})
    renderHero()
    fireEvent.click(screen.getByRole('button', { name: /Começar grátis/ }))
    expect(track).toHaveBeenCalledWith('lp_whatsapp_click', {
      section: 'hero',
      device: 'desktop',
      method: 'modal'
    })
    expect(screen.getByText('Fale com o Norte no seu WhatsApp')).toBeInTheDocument()
  })

  it('renders the area chips as toggle controls, starting on "Todas"', () => {
    renderHero()
    const areas = screen.getByRole('list', { name: 'Veja vagas de' })
    expect(within(areas).getAllByRole('button')).toHaveLength(8)
    expect(within(areas).getByRole('button', { name: 'Todas' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(within(areas).getByRole('button', { name: 'Tecnologia' })).toHaveAttribute(
      'aria-pressed',
      'false'
    )
  })

  it('refetches for the clicked area and reports it to analytics', async () => {
    const track = vi.spyOn(analytics, 'trackLanding').mockImplementation(() => {})
    renderHero()
    await waitFor(() => expect(publicJobsService.getRecentJobs).toHaveBeenCalledWith('all'))

    fireEvent.click(screen.getByRole('button', { name: 'Design' }))

    await waitFor(() => expect(publicJobsService.getRecentJobs).toHaveBeenCalledWith('design'))
    expect(track).toHaveBeenCalledWith('lp_hero_area', { area: 'design' })
  })

  it('shows the labelled example when the request fails', async () => {
    vi.mocked(publicJobsService.getRecentJobs).mockRejectedValue(new Error('offline'))
    renderHero()

    // O hook declara retry: 1, e opções do próprio useQuery vencem as
    // defaultOptions do QueryClient — então há uma segunda tentativa com
    // backoff de ~1s antes de isError virar true. O timeout padrão de 1000ms
    // do waitFor não alcança isso.
    await waitFor(() => expect(screen.getByText('exemplo')).toBeInTheDocument(), {
      timeout: 5000
    })
    expect(screen.queryByText('ao vivo')).not.toBeInTheDocument()
    expect(screen.getByText('SRE Sênior | Cartões')).toBeInTheDocument()
  })

  it('shows the empty state only when an area filter is applied', async () => {
    vi.mocked(publicJobsService.getRecentJobs).mockResolvedValue({ jobs: [], today_count: 0 })
    renderHero()

    // area=all e lista vazia é falha de coleta, não filtro sem resultado
    await waitFor(() => expect(screen.getByText('exemplo')).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: 'RH' }))
    await waitFor(() => expect(screen.getByText(/Nenhuma vaga nova em RH/)).toBeInTheDocument())
  })
})
