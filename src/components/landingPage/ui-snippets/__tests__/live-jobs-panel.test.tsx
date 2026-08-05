import { render, screen } from '@testing-library/react'
import { LiveJobsPanel } from '@/components/landingPage/ui-snippets/live-jobs-panel'
import type { RecentJob } from '@/services/publicJobsService'

// jsdom nao dispara o IntersectionObserver (o polyfill de setup.ts tem observe()
// noop), entao inView nunca vira true e useCountUp ficaria travado em 0. Mesmo
// mock usado em proof-band-section.test.tsx pra testar o valor final do contador.
vi.mock('@/hooks/useCountUp', () => ({ useCountUp: ({ target }: { target: number }) => target }))

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

  it('renders four skeleton rows while loading, with no job text', () => {
    const { container } = render(
      <LiveJobsPanel
        state="loading"
        jobs={[]}
        todayCount={0}
        areaLabel="Todas"
        onClearFilter={() => {}}
      />
    )
    expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThanOrEqual(4)
    expect(screen.queryByText('ao vivo')).not.toBeInTheDocument()
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
