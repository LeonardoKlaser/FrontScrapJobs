import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { HeroNorteSection } from '@/components/landingPage/hero-norte-section'
import * as analytics from '@/lib/analytics'
import { publicJobsService, type PublicRecentJobs } from '@/services/publicJobsService'
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
  // Distinta de FALLBACK_JOBS (live-jobs-helpers.ts) de proposito: se essas
  // fossem a mesma vaga, um bug que trocasse 'live' por 'fallback' na
  // derivacao de estado passaria despercebido pelos testes (finding A).
  vi.mocked(publicJobsService.getRecentJobs).mockResolvedValue({
    jobs: [
      {
        title: 'Analista de Dados Pleno',
        company: 'Ambev Carreiras',
        logo_url: 'https://cdn/ambev.png',
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

    await waitFor(() => expect(screen.getByText('Analista de Dados Pleno')).toBeInTheDocument())
    expect(screen.getByText('Ambev')).toBeInTheDocument()
    // Marcadores do estado 'live': sem eles, trocar a derivacao de estado por
    // 'fallback' (ou a bolha por chatDigestGeneric) passaria despercebido,
    // ja que a vaga de fixture acima nao aparece em FALLBACK_JOBS de
    // qualquer forma (finding A).
    expect(screen.getByText('ao vivo')).toBeInTheDocument()
    expect(screen.getByText(/312 vagas/)).toBeInTheDocument()
    expect(screen.getByText('1 vaga nova pra você hoje')).toBeInTheDocument()
    expect(screen.getByText('demonstração')).toBeInTheDocument()
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

  it('does not report a no-op click on the already-selected chip', () => {
    const track = vi.spyOn(analytics, 'trackLanding').mockImplementation(() => {})
    renderHero()
    fireEvent.click(screen.getByRole('button', { name: 'Todas' }))
    expect(track).not.toHaveBeenCalled()
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
    // Metade da troca de honestidade que a live-marker acima cobre: fora do
    // estado 'live' a bolha usa a versão genérica, sem número (finding A).
    expect(screen.getByText('Suas vagas novas chegam por aqui')).toBeInTheDocument()
  })

  it('shows the empty state only when an area filter is applied', async () => {
    vi.mocked(publicJobsService.getRecentJobs).mockResolvedValue({ jobs: [], today_count: 0 })
    renderHero()

    // area=all e lista vazia é falha de coleta, não filtro sem resultado
    await waitFor(() => expect(screen.getByText('exemplo')).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: 'RH' }))
    await waitFor(() => expect(screen.getByText(/Nenhuma vaga nova em RH/)).toBeInTheDocument())
  })

  it('does not claim an unfetched area has no jobs while its request is in flight', async () => {
    let resolveDesign: (value: PublicRecentJobs) => void = () => {}
    const designPromise = new Promise<PublicRecentJobs>((resolve) => {
      resolveDesign = resolve
    })

    // 'rh' resolve vazio na hora; 'design' fica pendurado ate resolveDesign
    // ser chamado, pra observar o estado enquanto o fetch da area nova ainda
    // esta em voo e o placeholder (keepPreviousData) e o resultado vazio da
    // area anterior.
    vi.mocked(publicJobsService.getRecentJobs).mockImplementation((area: string) => {
      if (area === 'rh') return Promise.resolve({ jobs: [], today_count: 0 })
      if (area === 'design') return designPromise
      return Promise.resolve({
        jobs: [
          {
            title: 'Analista de Dados Pleno',
            company: 'Ambev Carreiras',
            logo_url: '',
            posted_hours_ago: 5
          }
        ],
        today_count: 312
      })
    })

    renderHero()
    await waitFor(() => expect(publicJobsService.getRecentJobs).toHaveBeenCalledWith('all'))

    fireEvent.click(screen.getByRole('button', { name: 'RH' }))
    await waitFor(() => expect(screen.getByText(/Nenhuma vaga nova em RH/)).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: 'Design' }))
    // Sem o gate de isPlaceholderData, o placeholder vazio de RH vazaria
    // aqui, na mesma renderizacao sincrona do clique, como "Nenhuma vaga
    // nova em Design" — citando uma area que nem foi consultada ainda.
    expect(screen.queryByText(/Nenhuma vaga nova em Design/)).not.toBeInTheDocument()

    resolveDesign({ jobs: [], today_count: 0 })
    await waitFor(() => expect(screen.getByText(/Nenhuma vaga nova em Design/)).toBeInTheDocument())
  })
})
