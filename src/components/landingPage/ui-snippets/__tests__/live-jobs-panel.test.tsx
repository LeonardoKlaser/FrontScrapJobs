import { render, screen } from '@testing-library/react'
import { LiveJobsPanel } from '@/components/landingPage/ui-snippets/live-jobs-panel'
import type { RecentJob } from '@/services/publicJobsService'

// jsdom nao dispara o IntersectionObserver (o polyfill de setup.ts tem observe()
// noop), entao inView nunca vira true e useCountUp ficaria travado em 0. Mesmo
// padrao usado em proof-band-section.test.tsx: um mock controlavel por teste, pra
// tambem poder simular o cenario da finding D (ref quebrado, count travado em 0
// mesmo com todayCount > 0).
const useCountUpMock = vi.fn(({ target }: { target: number }) => target)
vi.mock('@/hooks/useCountUp', () => ({
  useCountUp: (args: { target: number }) => useCountUpMock(args)
}))

beforeEach(() => {
  useCountUpMock.mockImplementation(({ target }) => target)
})

const JOBS: RecentJob[] = [
  {
    title: 'Senior Software Engineer - IAM',
    company: 'QuintoAndar Carreiras',
    logo_url: 'https://cdn/quintoandar.png',
    posted_hours_ago: 5
  },
  {
    title: 'Sr. Data Analyst',
    company: 'Pinterest Carreiras',
    logo_url: '',
    posted_hours_ago: 0
  }
]

describe('LiveJobsPanel', () => {
  it('lists real jobs with cleaned company names and relative time', () => {
    render(
      <LiveJobsPanel
        state="live"
        jobs={JOBS}
        todayCount={312}
        areaLabel="Todas"
        onClearFilter={() => {}}
      />
    )

    expect(screen.getByText('Senior Software Engineer - IAM')).toBeInTheDocument()
    expect(screen.getByText('QuintoAndar')).toBeInTheDocument()
    expect(screen.queryByText('QuintoAndar Carreiras')).not.toBeInTheDocument()
    expect(screen.getByText('há 5h')).toBeInTheDocument()
    expect(screen.getByText('agora')).toBeInTheDocument()
    expect(screen.getByText('ao vivo')).toBeInTheDocument()
    expect(screen.getByText(/312 vagas/)).toBeInTheDocument()
  })

  it('does not render the counter when todayCount is zero (amendment 1)', () => {
    render(
      <LiveJobsPanel
        state="live"
        jobs={JOBS}
        todayCount={0}
        areaLabel="Todas"
        onClearFilter={() => {}}
      />
    )

    expect(screen.getByText('ao vivo')).toBeInTheDocument()
    // pt-BR trata count=0 como singular no CLDR ("0 vaga", não "0 vagas") — o
    // regex cobre as duas formas pra não deixar a asserção passar por acaso.
    expect(screen.queryByText(/vagas? · últimas 24h/)).not.toBeInTheDocument()
  })

  it('never shows a stuck "0 vaga" badge if the count-up animation never starts', () => {
    // finding D: se o IntersectionObserver nunca disparar em produção (ref
    // quebrado, viewport que nunca cruza o rootMargin), inView fica false pra
    // sempre e useCountUp trava em 0 — mesmo com todayCount > 0. Simulamos
    // exatamente isso: o mock ignora o target e sempre devolve 0.
    useCountUpMock.mockReturnValue(0)
    render(
      <LiveJobsPanel
        state="live"
        jobs={JOBS}
        todayCount={312}
        areaLabel="Todas"
        onClearFilter={() => {}}
      />
    )
    expect(screen.queryByText(/0 vaga/)).not.toBeInTheDocument()
    expect(screen.getByText(/312 vagas/)).toBeInTheDocument()
  })

  it('exposes the panel as an accessible region (aria-label reaches AT)', () => {
    // finding C: aria-label numa <div> pura mapeia pro role ARIA "generic",
    // cujo nome acessível é proibido — o navegador descarta a string. Sem
    // role="region", getByRole('region', { name }) não encontraria nada aqui.
    render(
      <LiveJobsPanel
        state="live"
        jobs={JOBS}
        todayCount={1}
        areaLabel="Todas"
        onClearFilter={() => {}}
      />
    )
    expect(
      screen.getByRole('region', { name: 'Vagas recentes encontradas pelo ScrapJobs' })
    ).toBeInTheDocument()
  })

  it('keeps the empty state at the same height as the populated states', () => {
    // finding B: sem min-h, o estado empty (um parágrafo + botão) encolhe uns
    // 100px em relação às 4 linhas dos outros três estados, reabrindo o buraco
    // visual que o painel existe pra fechar — e é alcançável direto pela
    // interação mais comum (Task 9 liga os chips de área a esse estado).
    render(
      <LiveJobsPanel
        state="empty"
        jobs={[]}
        todayCount={0}
        areaLabel="RH"
        onClearFilter={() => {}}
      />
    )
    const message = screen.getByText(/Nenhuma vaga nova em RH/)
    expect(message.parentElement).toHaveClass('min-h-60')
  })

  it('falls back to the company initial when the logo is missing', () => {
    const { container } = render(
      <LiveJobsPanel
        state="live"
        jobs={JOBS}
        todayCount={1}
        areaLabel="Todas"
        onClearFilter={() => {}}
      />
    )
    // Pinterest não tem logo_url → inicial. QuintoAndar tem → uma <img> só.
    expect(screen.getByText('P')).toBeInTheDocument()
    const images = container.querySelectorAll('img')
    expect(images).toHaveLength(1)
    expect(images[0]).toHaveAttribute('src', 'https://cdn/quintoandar.png')
  })

  it('renders exactly four skeleton rows while loading, with no job text', () => {
    // jobs=JOBS (nao []) de proposito: se o estado loading algum dia vazar e
    // renderizar as vagas reais em vez do skeleton, esse teste pega.
    const { container } = render(
      <LiveJobsPanel
        state="loading"
        jobs={JOBS}
        todayCount={0}
        areaLabel="Todas"
        onClearFilter={() => {}}
      />
    )
    // Conta <li> (linhas), nao [data-slot="skeleton"]: cada linha tem 3
    // skeletons + 1 no cabecalho, entao contar skeletons soltos (>=4) passaria
    // igual com SKELETON_ROWS=1 (1+3=4) — o que anularia a garantia de altura
    // constante entre os quatro estados que motivou SKELETON_ROWS=4.
    expect(container.querySelectorAll('li')).toHaveLength(4)
    expect(screen.queryByText('ao vivo')).not.toBeInTheDocument()
    expect(screen.queryByText('Senior Software Engineer - IAM')).not.toBeInTheDocument()
  })

  it('labels the fallback as an example and hides relative time', () => {
    render(
      <LiveJobsPanel
        state="fallback"
        jobs={JOBS}
        todayCount={0}
        areaLabel="Todas"
        onClearFilter={() => {}}
      />
    )
    expect(screen.getByText('exemplo')).toBeInTheDocument()
    expect(screen.queryByText('ao vivo')).not.toBeInTheDocument()
    expect(screen.queryByText('há 5h')).not.toBeInTheDocument()
    // amendment 2: FALLBACK_JOBS carregam posted_hours_ago: 0, que mapeia pra
    // "agora" — se o timestamp vazasse no fallback, os exemplos congelados
    // pareceriam ter sido postados agora mesmo, a mentira que o design de
    // quatro estados existe pra evitar.
    expect(screen.queryByText('agora')).not.toBeInTheDocument()
    expect(screen.queryByText(/vagas? · últimas 24h/)).not.toBeInTheDocument()
  })

  it('offers a way out when the filtered area has no jobs', async () => {
    const onClearFilter = vi.fn()
    render(
      <LiveJobsPanel
        state="empty"
        jobs={[]}
        todayCount={0}
        areaLabel="RH"
        onClearFilter={onClearFilter}
      />
    )
    expect(screen.getByText(/Nenhuma vaga nova em RH/)).toBeInTheDocument()

    const button = screen.getByRole('button', { name: 'Ver todas as áreas' })
    button.click()
    expect(onClearFilter).toHaveBeenCalledTimes(1)
  })
})
