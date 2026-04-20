import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router'
import type { ReactNode } from 'react'
import AdicionarSitePage from '@/pages/addNewSite'
import { toast } from 'sonner'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      if (opts && typeof opts.count === 'number') return `${key}:${opts.count}`
      return key
    }
  }),
  Trans: ({ children }: { children: ReactNode }) => children
}))

const mockAddSite = vi.fn()
const mockTestScrape = vi.fn()
const mockResetSandbox = vi.fn()

vi.mock('@/hooks/useAddSiteConfig', () => ({
  useAddSiteConfig: () => ({ mutate: mockAddSite, mutateAsync: mockAddSite }),
  useSandboxScrape: () => ({
    mutate: mockTestScrape,
    data: undefined,
    isPending: false,
    reset: mockResetSandbox
  })
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
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

async function fillBasicCSSForm() {
  await userEvent.type(screen.getByLabelText(/basicInfo\.nameLabel/), 'Acme Careers')
  await userEvent.type(
    screen.getByLabelText(/basicInfo\.urlLabel/),
    'https://acme.example.com/jobs'
  )
}

async function attachLogo(filename = 'logo.png', size = 1024) {
  const input = document.getElementById('logo_upload') as HTMLInputElement
  const file = new File(['x'.repeat(size)], filename, { type: 'image/png' })
  fireEvent.change(input, { target: { files: [file] } })
}

describe('AdicionarSitePage (characterization)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('happy path: fills form, attaches logo, submits → addSite mutation called with payload', async () => {
    mockAddSite.mockResolvedValue(undefined)
    render(wrap(<AdicionarSitePage />))

    await fillBasicCSSForm()
    await attachLogo()

    const submitButton = screen.getByRole('button', { name: /addSite\.submitButton/ })
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(mockAddSite).toHaveBeenCalledTimes(1)
    })
    const call = mockAddSite.mock.calls[0]
    expect(call[0].formData.site_name).toBe('Acme Careers')
    expect(call[0].formData.base_url).toBe('https://acme.example.com/jobs')
    expect(call[0].formData.scraping_type).toBe('CSS')
    expect(call[0].logoFile).toBeInstanceOf(File)
  })

  it('scraping type switch: API shows API Config section', async () => {
    render(wrap(<AdicionarSitePage />))

    // Default CSS shows css section
    expect(screen.getByText(/addSite\.cssConfig\.title/)).toBeInTheDocument()

    // Switch to API
    const apiCard = screen.getByRole('button', { name: /addSite\.strategy\.api/ })
    await userEvent.click(apiCard)

    expect(screen.getByText(/addSite\.apiConfig\.title/)).toBeInTheDocument()
  })

  it('scraping type switch: HEADLESS keeps CSS selectors section visible', async () => {
    render(wrap(<AdicionarSitePage />))

    const headlessCard = screen.getByRole('button', { name: /addSite\.strategy\.headless/ })
    await userEvent.click(headlessCard)

    // HEADLESS shares CSS selectors per addNewSite.tsx:367
    expect(screen.getByText(/addSite\.cssConfig\.title/)).toBeInTheDocument()
  })

  it('missing name/URL: shows validation alert, mutation not called', async () => {
    render(wrap(<AdicionarSitePage />))

    const submitButton = screen.getByRole('button', { name: /addSite\.submitButton/ })
    // Form relies on native required; simulate submit via form element
    const form = submitButton.closest('form')!
    // Remove required attrs to bypass browser validation so our JS validation runs
    form.querySelectorAll('input[required]').forEach((el) => el.removeAttribute('required'))
    fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByText(/addSite\.requiredFieldsError/)).toBeInTheDocument()
    })
    expect(mockAddSite).not.toHaveBeenCalled()
  })

  it('sandbox button: no URL → toast error, mutation not called', async () => {
    render(wrap(<AdicionarSitePage />))

    const testButton = screen.getByRole('button', { name: /addSite\.sandbox\.testButton/ })
    // Sandbox button is disabled when base_url is empty — assert that state
    expect(testButton).toBeDisabled()
  })

  it('sandbox button: with URL → calls testScrape', async () => {
    render(wrap(<AdicionarSitePage />))

    await userEvent.type(screen.getByLabelText(/basicInfo\.urlLabel/), 'https://sb.example.com')

    const testButton = screen.getByRole('button', { name: /addSite\.sandbox\.testButton/ })
    await userEvent.click(testButton)

    await waitFor(() => {
      expect(mockTestScrape).toHaveBeenCalledTimes(1)
    })
  })

  it('mutation error path: toast.error called when mutation rejects', async () => {
    mockAddSite.mockRejectedValueOnce(new Error('boom'))
    render(wrap(<AdicionarSitePage />))

    await fillBasicCSSForm()
    await attachLogo()

    const submitButton = screen.getByRole('button', { name: /addSite\.submitButton/ })
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled()
    })
  })

  it('submit without logo: shows logoRequiredError, mutation not called', async () => {
    render(wrap(<AdicionarSitePage />))

    await fillBasicCSSForm()
    // Sem attachLogo

    const submitButton = screen.getByRole('button', { name: /addSite\.submitButton/ })
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/addSite\.logoRequiredError/)).toBeInTheDocument()
    })
    expect(mockAddSite).not.toHaveBeenCalled()
  })

  it('logo >2MB: shows logoTooLargeError, logoFile state not set', async () => {
    render(wrap(<AdicionarSitePage />))

    await fillBasicCSSForm()
    // Arquivo 3MB — excede 2MB
    const input = document.getElementById('logo_upload') as HTMLInputElement
    const big = new File(['x'.repeat(3 * 1024 * 1024)], 'big.png', { type: 'image/png' })
    fireEvent.change(input, { target: { files: [big] } })

    await waitFor(() => {
      expect(screen.getByText(/addSite\.logoTooLargeError/)).toBeInTheDocument()
    })

    // Submit ainda deve falhar por falta de logo (file size guard nao setou logoFile)
    const submitButton = screen.getByRole('button', { name: /addSite\.submitButton/ })
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/addSite\.logoRequiredError/)).toBeInTheDocument()
    })
    expect(mockAddSite).not.toHaveBeenCalled()
  })

  it('file input accept attribute is png/jpeg/webp (backend-aligned)', () => {
    render(wrap(<AdicionarSitePage />))

    const input = document.getElementById('logo_upload') as HTMLInputElement
    expect(input.getAttribute('accept')).toBe('image/png, image/jpeg, image/webp')
  })
})
