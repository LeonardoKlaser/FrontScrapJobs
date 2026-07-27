import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { OnboardingWizard } from '../onboarding-wizard'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() }
}))

const mockTrackTrial = vi.fn()
vi.mock('@/lib/analytics', () => ({
  trackTrial: (...args: unknown[]) => mockTrackTrial(...args)
}))

const mockUpload = vi.fn()
const mockUseCurriculumFiles = vi.fn()
vi.mock('@/hooks/useCurriculumFiles', () => ({
  useCurriculumFiles: (...args: unknown[]) => mockUseCurriculumFiles(...args),
  useUploadCurriculumFile: () => ({ mutate: mockUpload, isPending: false })
}))

// Step 2/3 nunca montam nestes testes (o wizard fica no passo 1 ou avança só
// o suficiente pra provar o handoff) — mocks abaixo existem só pra garantir
// que, SE montarem, não disparam chamadas reais de rede (sem MockAdapter aqui).
vi.mock('@/hooks/useSiteCareer', () => ({
  useSiteCareer: () => ({ data: [] })
}))
vi.mock('@/hooks/useUser', () => ({
  useUser: () => ({ data: undefined })
}))
vi.mock('@/hooks/useRegisterUserSite', () => ({
  useRegisterUserSite: () => ({ mutate: vi.fn(), isPending: false }),
  useUnregisterUserSite: () => ({ mutate: vi.fn() }),
  useUpdateUserSiteFilters: () => ({ mutate: vi.fn(), isPending: false })
}))
vi.mock('@/hooks/useDashboard', () => ({
  useLatestJobs: () => ({ data: undefined, isLoading: false, isError: false })
}))
vi.mock('@/hooks/useOnboarding', () => ({
  useCompleteWebOnboarding: () => ({ mutate: vi.fn(), isPending: false })
}))

function wrap(ui: ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{ui}</QueryClientProvider>
}

function pdfFile(name = 'cv.pdf', sizeBytes = 1024) {
  const file = new File(['x'.repeat(sizeBytes)], name, { type: 'application/pdf' })
  return file
}

function selectFile(file: File) {
  const input = document.querySelector('input[type="file"]') as HTMLInputElement
  fireEvent.change(input, { target: { files: [file] } })
}

describe('OnboardingWizard — passo 1 (upload de currículo)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseCurriculumFiles.mockReturnValue({ data: [], isLoading: false })
  })

  it('upload bem-sucedido avança pro passo 2 e dispara o evento de funil', async () => {
    mockUpload.mockImplementation((_file, opts) => opts.onSuccess())

    render(wrap(<OnboardingWizard />))

    expect(screen.getByText('step1.title')).toBeInTheDocument()

    selectFile(pdfFile())

    await waitFor(() => expect(mockUpload).toHaveBeenCalledTimes(1))
    expect(mockUpload.mock.calls[0][0]).toBeInstanceOf(File)
    expect(mockTrackTrial).toHaveBeenCalledWith('onboarding_step_1')
    // Avançou pro passo 2 — o título do passo 1 não aparece mais.
    await waitFor(() => expect(screen.queryByText('step1.title')).not.toBeInTheDocument())
  })

  it('arquivo que não é PDF mostra o toast de invalid_format sem chamar upload', async () => {
    const { toast } = await import('sonner')

    render(wrap(<OnboardingWizard />))

    const notPdf = new File(['x'], 'foto.png', { type: 'image/png' })
    selectFile(notPdf)

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('errors.invalid_format'))
    expect(mockUpload).not.toHaveBeenCalled()
  })

  it('arquivo maior que o limite mostra o toast de too_large sem chamar upload', async () => {
    const { toast } = await import('sonner')

    render(wrap(<OnboardingWizard />))

    const tooBig = pdfFile('cv-grande.pdf', 11 * 1024 * 1024)
    selectFile(tooBig)

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('errors.too_large'))
    expect(mockUpload).not.toHaveBeenCalled()
  })

  it('erro do backend no upload mapeia pro toast via curriculumFileErrorKey', async () => {
    const { toast } = await import('sonner')
    mockUpload.mockImplementation((_file, opts) =>
      opts.onError({
        isAxiosError: true,
        response: { status: 409, data: { error: 'limit_reached' } }
      })
    )

    render(wrap(<OnboardingWizard />))

    selectFile(pdfFile())

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('errors.limit_reached'))
    expect(mockTrackTrial).not.toHaveBeenCalled()
  })
})
