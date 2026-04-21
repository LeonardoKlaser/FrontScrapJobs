import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router'
import type { ReactNode } from 'react'
import AdminSitesListPage from '@/pages/adminSitesList'
import { useAdminSites } from '@/hooks/useSiteCareer'
import type { SiteConfig } from '@/models/siteCareer'
import { PATHS } from '@/router/paths'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, opts?: { defaultValue?: string }) => opts?.defaultValue ?? _key
  })
}))

const mockNavigate = vi.fn()
vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('@/hooks/useSiteCareer', () => ({
  useAdminSites: vi.fn()
}))

function wrap(ui: ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  )
}

function makeSite(partial: Partial<SiteConfig>): SiteConfig {
  return {
    id: 1,
    site_name: 'Default',
    base_url: 'https://example.com',
    logo_url: null,
    is_active: true,
    scraping_type: 'CSS',
    job_list_item_selector: null,
    title_selector: null,
    link_selector: null,
    link_attribute: null,
    location_selector: null,
    next_page_selector: null,
    job_description_selector: null,
    job_requisition_id_selector: null,
    job_requisition_id_attribute: null,
    api_endpoint_template: null,
    api_method: null,
    api_headers_json: null,
    api_payload_template: null,
    json_data_mappings: null,
    headless_actions_json: null,
    created_at: '2026-04-01T10:00:00Z',
    ...partial
  }
}

describe('AdminSitesListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders active AND inactive sites', () => {
    vi.mocked(useAdminSites).mockReturnValue({
      data: [
        makeSite({ id: 1, site_name: 'Active One', is_active: true }),
        makeSite({ id: 2, site_name: 'Inactive Two', is_active: false })
      ],
      isLoading: false
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(wrap(<AdminSitesListPage />))

    expect(screen.getByText('Active One')).toBeInTheDocument()
    expect(screen.getByText('Inactive Two')).toBeInTheDocument()
    expect(screen.getByText('Ativo')).toBeInTheDocument()
    expect(screen.getByText('Inativo')).toBeInTheDocument()
  })

  it('"+ Novo Site" button navigates to addNewSite', async () => {
    vi.mocked(useAdminSites).mockReturnValue({
      data: [],
      isLoading: false
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(wrap(<AdminSitesListPage />))

    const button = screen.getByRole('button', { name: /Novo Site/ })
    await userEvent.click(button)

    expect(mockNavigate).toHaveBeenCalledWith(PATHS.app.addNewSite)
  })

  it('"Editar" row button navigates to editSite(id)', async () => {
    vi.mocked(useAdminSites).mockReturnValue({
      data: [makeSite({ id: 42, site_name: 'Target' })],
      isLoading: false
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(wrap(<AdminSitesListPage />))

    const editButton = screen.getByRole('button', { name: /Editar Target/ })
    await userEvent.click(editButton)

    expect(mockNavigate).toHaveBeenCalledWith(PATHS.app.editSite(42))
  })

  it('search filters by site_name', async () => {
    vi.mocked(useAdminSites).mockReturnValue({
      data: [
        makeSite({ id: 1, site_name: 'Netflix Careers' }),
        makeSite({ id: 2, site_name: 'Spotify Careers' })
      ],
      isLoading: false
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(wrap(<AdminSitesListPage />))

    const searchInput = screen.getByPlaceholderText('Buscar por nome...')
    await userEvent.type(searchInput, 'Netflix')

    expect(screen.getByText('Netflix Careers')).toBeInTheDocument()
    expect(screen.queryByText('Spotify Careers')).not.toBeInTheDocument()
  })
})
