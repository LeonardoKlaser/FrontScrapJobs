import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router'
import type { ReactNode } from 'react'
import EditSitePage from '@/pages/editSite'
import { useSite, useUpdateSiteConfig } from '@/hooks/useSiteCareer'
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
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: '57' })
  }
})

vi.mock('@/hooks/useSiteCareer', () => ({
  useSite: vi.fn(),
  useUpdateSiteConfig: vi.fn()
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() }
}))

vi.mock('@/components/tooltip', () => ({
  Tooltip: ({ children }: { children: ReactNode }) => <>{children}</>
}))

function wrap(ui: ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  )
}

function makeSite(partial: Partial<SiteConfig> = {}): SiteConfig {
  return {
    id: 57,
    site_name: 'Netflix Careers',
    base_url: 'https://jobs.netflix.com',
    logo_url: null,
    is_active: true,
    scraping_type: 'API',
    job_list_item_selector: null,
    title_selector: null,
    link_selector: null,
    link_attribute: null,
    location_selector: null,
    next_page_selector: null,
    job_description_selector: null,
    job_requisition_id_selector: null,
    job_requisition_id_attribute: null,
    api_endpoint_template: 'https://api.netflix.com/jobs',
    api_method: 'GET',
    api_headers_json: null,
    api_payload_template: null,
    json_data_mappings: null,
    headless_actions_json: null,
    created_at: '2026-04-20T00:00:00Z',
    ...partial
  }
}

describe('EditSitePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state while useSite pending', () => {
    vi.mocked(useSite).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    vi.mocked(useUpdateSiteConfig).mockReturnValue({
      mutateAsync: vi.fn()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(wrap(<EditSitePage />))
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('renders not-found empty state on 404', () => {
    vi.mocked(useSite).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { response: { status: 404 } }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    vi.mocked(useUpdateSiteConfig).mockReturnValue({
      mutateAsync: vi.fn()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(wrap(<EditSitePage />))
    expect(screen.getByText('Site não encontrado')).toBeInTheDocument()
  })

  it('populates form with initialData (site_name and api_endpoint)', () => {
    vi.mocked(useSite).mockReturnValue({
      data: makeSite(),
      isLoading: false,
      error: null
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    vi.mocked(useUpdateSiteConfig).mockReturnValue({
      mutateAsync: vi.fn()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(wrap(<EditSitePage />))

    const nameInput = screen.getByLabelText(/basicInfo\.nameLabel/) as HTMLInputElement
    expect(nameInput.value).toBe('Netflix Careers')

    const endpointInput = screen.getByLabelText(/apiConfig\.endpointTemplate/) as HTMLInputElement
    expect(endpointInput.value).toBe('https://api.netflix.com/jobs')
  })

  it('submit calls updateSiteConfig mutateAsync with id + formData + logoFile=null', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({ id: 57 })
    vi.mocked(useSite).mockReturnValue({
      data: makeSite(),
      isLoading: false,
      error: null
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    vi.mocked(useUpdateSiteConfig).mockReturnValue({
      mutateAsync
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(wrap(<EditSitePage />))

    const submitButton = screen.getByRole('button', { name: /Salvar Alterações/ })
    await userEvent.click(submitButton)

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledTimes(1))
    const arg = mutateAsync.mock.calls[0][0]
    expect(arg.id).toBe(57)
    expect(arg.formData.site_name).toBe('Netflix Careers')
    expect(arg.logoFile).toBeNull()
  })

  it('on success, navigate to adminSites', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({ id: 57 })
    vi.mocked(useSite).mockReturnValue({
      data: makeSite(),
      isLoading: false,
      error: null
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    vi.mocked(useUpdateSiteConfig).mockReturnValue({
      mutateAsync
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(wrap(<EditSitePage />))

    const submitButton = screen.getByRole('button', { name: /Salvar Alterações/ })
    await userEvent.click(submitButton)

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith(PATHS.app.adminSites))
  })
})
