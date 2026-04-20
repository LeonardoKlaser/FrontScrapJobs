import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router'
import type { ReactNode } from 'react'
import ListSitesPage from '@/pages/ListSites'
import { useSiteCareer } from '@/hooks/useSiteCareer'
import { useUser } from '@/hooks/useUser'
import type { SiteCareer } from '@/models/siteCareer'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: { defaultValue?: string; term?: string }) => {
      if (opts?.term) return `${key}:${opts.term}`
      return opts?.defaultValue ?? key
    }
  })
}))

vi.mock('@/hooks/useSiteCareer', () => ({
  useSiteCareer: vi.fn()
}))

vi.mock('@/hooks/useUser', () => ({
  useUser: vi.fn()
}))

vi.mock('@/hooks/useRegisterUserSite', () => ({
  useRegisterUserSite: () => ({ mutate: vi.fn(), isPending: false }),
  useUnregisterUserSite: () => ({ mutate: vi.fn() }),
  useUpdateUserSiteFilters: () => ({ mutate: vi.fn(), isPending: false })
}))

vi.mock('@/components/companyPopup', () => ({
  RegistrationModal: () => null
}))

function wrap(ui: ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  )
}

function site(partial: Partial<SiteCareer>): SiteCareer {
  return {
    site_id: 0,
    site_name: '',
    base_url: '',
    logo_url: null,
    is_subscribed: false,
    created_at: '2026-01-01T00:00:00Z',
    ...partial
  }
}

const fixtureNoSub: SiteCareer[] = [
  site({ site_id: 1, site_name: 'Ácme', created_at: '2026-01-01T00:00:00Z' }),
  site({ site_id: 2, site_name: 'azure', created_at: '2026-03-01T00:00:00Z' }),
  site({ site_id: 3, site_name: 'Beta', created_at: '2025-12-01T00:00:00Z' }),
  site({ site_id: 4, site_name: 'Zoom', created_at: 'not-a-date' })
]

const fixtureWithSub: SiteCareer[] = [
  site({ site_id: 1, site_name: 'Ácme', created_at: '2026-01-01T00:00:00Z' }),
  site({ site_id: 2, site_name: 'azure', created_at: '2026-03-01T00:00:00Z', is_subscribed: true }),
  site({ site_id: 3, site_name: 'Beta', created_at: '2025-12-01T00:00:00Z' }),
  site({ site_id: 4, site_name: 'Zoom', created_at: 'not-a-date' })
]

function getRenderedNames() {
  const buttons = screen.getAllByRole('button')
  return buttons
    .map((b) => b.textContent ?? '')
    .filter((text) => ['Ácme', 'azure', 'Beta', 'Zoom'].some((n) => text.includes(n)))
    .map((text) => ['Ácme', 'azure', 'Beta', 'Zoom'].find((n) => text.includes(n)) as string)
}

describe('ListSitesPage sort', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    vi.mocked(useUser).mockReturnValue({
      data: { plan: { max_sites: 10 } }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
  })

  afterEach(() => {
    cleanup()
  })

  it('default alphabetical sort handles accents + case with Intl.Collator', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useSiteCareer).mockReturnValue({ data: fixtureNoSub } as any)
    render(wrap(<ListSitesPage />))
    expect(getRenderedNames()).toEqual(['Ácme', 'azure', 'Beta', 'Zoom'])
  })

  it('newest sort: newer dates first, invalid date falls back to epoch 0 (last)', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useSiteCareer).mockReturnValue({ data: fixtureNoSub } as any)
    render(wrap(<ListSitesPage />))
    const select = screen.getByLabelText('Ordenar por')
    await userEvent.click(select)
    await userEvent.click(screen.getByText('Data de inclusão mais recente'))

    const names = getRenderedNames()
    expect(names[0]).toBe('azure') // 2026-03
    expect(names[1]).toBe('Ácme') // 2026-01
    expect(names[2]).toBe('Beta') // 2025-12
    expect(names[3]).toBe('Zoom') // epoch 0
  })

  it('subscribed_first: subscribed entries precede others, alphabetical within groups', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useSiteCareer).mockReturnValue({ data: fixtureWithSub } as any)
    render(wrap(<ListSitesPage />))

    // Auto-filter escolheu 'subscribed' (azure inscrito). Clica em "filterAll"
    // pra ver todos antes de testar a ordenacao.
    await userEvent.click(screen.getByText('filterAll'))

    const select = screen.getByLabelText('Ordenar por')
    await userEvent.click(select)
    await userEvent.click(screen.getByText('Inscritas primeiro'))

    const names = getRenderedNames()
    expect(names[0]).toBe('azure') // subscribed
    expect(names.slice(1)).toEqual(['Ácme', 'Beta', 'Zoom'])
  })

  it('localStorage persists sortBy across remounts', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useSiteCareer).mockReturnValue({ data: fixtureNoSub } as any)
    const { unmount } = render(wrap(<ListSitesPage />))

    const select = screen.getByLabelText('Ordenar por')
    await userEvent.click(select)
    await userEvent.click(screen.getByText('Data de inclusão mais recente'))

    expect(localStorage.getItem('sitesSortBy')).toBe('newest')

    unmount()
    render(wrap(<ListSitesPage />))

    // Apos remontar, order deve ser 'newest' (azure first)
    expect(getRenderedNames()[0]).toBe('azure')
  })
})
