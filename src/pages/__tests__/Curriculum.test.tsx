import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router'
import type { ReactNode } from 'react'
import { Curriculum } from '@/pages/Curriculum'
import { MAX_CURRICULUM_FILES } from '@/components/curriculum/upload-curriculum-button'
import type { CurriculumFile } from '@/models/curriculum'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      if (opts && typeof opts.filename === 'string') return `${key}:${opts.filename}`
      if (opts && typeof opts.date === 'string') return `${key}:${opts.date}`
      return key
    },
    i18n: { language: 'pt-BR' }
  })
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: ReactNode }) => <>{children}</>,
  TooltipTrigger: ({ children }: { children: ReactNode }) => <>{children}</>,
  TooltipContent: ({ children }: { children: ReactNode }) => <>{children}</>,
  TooltipProvider: ({ children }: { children: ReactNode }) => <>{children}</>
}))

const mockUseCurriculumFiles = vi.fn()
const mockUpload = vi.fn()
const mockDelete = vi.fn()
const mockSetPrincipal = vi.fn()

vi.mock('@/hooks/useCurriculumFiles', () => ({
  useCurriculumFiles: () => mockUseCurriculumFiles(),
  useUploadCurriculumFile: () => ({ mutate: mockUpload, isPending: false }),
  useDeleteCurriculumFile: () => ({ mutate: mockDelete, isPending: false }),
  useSetPrincipalCurriculumFile: () => ({ mutate: mockSetPrincipal, isPending: false })
}))

function wrap(ui: ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  )
}

// A CardTitle também usa o atributo HTML `title` (tooltip nativo pra nomes
// truncados), então `screen.getByTitle` fica ambíguo com o `title` do iframe
// do viewer — consulta o iframe diretamente pra saber qual arquivo está
// selecionado no painel de visualização.
function viewerIframeTitle(): string | null {
  return document.querySelector('iframe')?.getAttribute('title') ?? null
}

function makeFile(overrides: Partial<CurriculumFile> = {}): CurriculumFile {
  return {
    id: 1,
    filename: 'cv.pdf',
    size_bytes: 204800,
    is_principal: false,
    created_at: '2026-01-01T00:00:00Z',
    ...overrides
  }
}

describe('Curriculum page (gerenciador de PDFs)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza a lista com badge de "Principal" apenas no arquivo principal', () => {
    mockUseCurriculumFiles.mockReturnValue({
      data: [
        makeFile({ id: 1, filename: 'cv-antigo.pdf', is_principal: false }),
        makeFile({ id: 2, filename: 'cv-novo.pdf', is_principal: true })
      ],
      isLoading: false
    })

    render(wrap(<Curriculum />))

    expect(screen.getByText('cv-antigo.pdf')).toBeInTheDocument()
    expect(screen.getByText('cv-novo.pdf')).toBeInTheDocument()
    expect(screen.getAllByText(/list\.principalBadge/).length).toBe(1)
  })

  it('botão de upload dispara a mutation com o arquivo escolhido', async () => {
    mockUseCurriculumFiles.mockReturnValue({
      data: [makeFile()],
      isLoading: false
    })

    render(wrap(<Curriculum />))

    const file = new File(['pdf-bytes'], 'novo.pdf', { type: 'application/pdf' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(mockUpload).toHaveBeenCalledTimes(1)
    })
    expect(mockUpload.mock.calls[0][0]).toBe(file)
  })

  it('com o limite de arquivos atingido, botão de upload fica desabilitado com tooltip', () => {
    mockUseCurriculumFiles.mockReturnValue({
      data: Array.from({ length: MAX_CURRICULUM_FILES }, (_, i) =>
        makeFile({ id: i + 1, filename: `cv-${i}.pdf` })
      ),
      isLoading: false
    })

    render(wrap(<Curriculum />))

    const button = screen.getByRole('button', { name: /upload\.button/ })
    expect(button).toBeDisabled()
    expect(screen.getByText(/errors\.limit_reached/)).toBeInTheDocument()
  })

  it('excluir pede confirmação via AlertDialog antes de chamar a mutation', async () => {
    mockUseCurriculumFiles.mockReturnValue({
      data: [makeFile({ id: 3, filename: 'cv.pdf' })],
      isLoading: false
    })

    render(wrap(<Curriculum />))

    await userEvent.click(screen.getByRole('button', { name: /list\.deleteAction/ }))

    expect(screen.getByText(/list\.deleteTitle/)).toBeInTheDocument()
    expect(mockDelete).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: /list\.confirmDelete/ }))

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith(3, expect.anything())
    })
  })

  it('"tornar principal" chama a mutation de definir principal', async () => {
    mockUseCurriculumFiles.mockReturnValue({
      data: [makeFile({ id: 4, filename: 'cv.pdf', is_principal: false })],
      isLoading: false
    })

    render(wrap(<Curriculum />))

    await userEvent.click(screen.getByRole('button', { name: /list\.makePrincipalAction/ }))

    expect(mockSetPrincipal).toHaveBeenCalledWith(4, expect.anything())
  })

  it('erro ao buscar a lista mostra mensagem de erro e NÃO mostra o CTA de vazio', () => {
    mockUseCurriculumFiles.mockReturnValue({ data: undefined, isLoading: false, isError: true })

    render(wrap(<Curriculum />))

    expect(screen.getByText(/list\.errorState/)).toBeInTheDocument()
    expect(screen.queryByText(/list\.emptyTitle/)).not.toBeInTheDocument()
  })

  it('estado vazio mostra CTA de upload', () => {
    mockUseCurriculumFiles.mockReturnValue({ data: [], isLoading: false })

    render(wrap(<Curriculum />))

    expect(screen.getByText(/list\.emptyTitle/)).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /upload\.button/ }).length).toBeGreaterThanOrEqual(
      1
    )
  })

  it('erro de upload (limit_reached) mostra toast mapeado por i18n', async () => {
    const { toast } = await import('sonner')
    mockUseCurriculumFiles.mockReturnValue({
      data: [makeFile()],
      isLoading: false
    })
    mockUpload.mockImplementation((_file, opts) => {
      opts?.onError?.({
        isAxiosError: true,
        response: { status: 409, data: { error: 'limit_reached' } }
      })
    })

    render(wrap(<Curriculum />))

    const file = new File(['pdf-bytes'], 'novo.pdf', { type: 'application/pdf' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('errors.limit_reached')
    })
  })

  it('erro de exclusão (not_found) mostra toast mapeado por i18n', async () => {
    const { toast } = await import('sonner')
    mockUseCurriculumFiles.mockReturnValue({
      data: [makeFile({ id: 9 })],
      isLoading: false
    })
    mockDelete.mockImplementation((_id, opts) => {
      opts?.onError?.({
        isAxiosError: true,
        response: { status: 404, data: { error: 'not_found' } }
      })
    })

    render(wrap(<Curriculum />))

    await userEvent.click(screen.getByRole('button', { name: /list\.deleteAction/ }))
    await userEvent.click(screen.getByRole('button', { name: /list\.confirmDelete/ }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('errors.not_found')
    })
  })

  it('ao excluir o arquivo selecionado, reseleciona o principal restante (não fica vazio)', async () => {
    const files = [
      makeFile({ id: 1, filename: 'cv-principal.pdf', is_principal: true }),
      makeFile({ id: 2, filename: 'cv-secundario.pdf', is_principal: false })
    ]
    mockUseCurriculumFiles.mockReturnValue({ data: files, isLoading: false })
    mockDelete.mockImplementation((_id, opts) => opts?.onSuccess?.())

    render(wrap(<Curriculum />))

    // auto-seleção inicial mostra o principal no viewer
    expect(viewerIframeTitle()).toBe('cv-principal.pdf')

    const secundarioCard = screen.getByText('cv-secundario.pdf').closest('[data-slot="card"]')
    expect(secundarioCard).not.toBeNull()

    await userEvent.click(
      within(secundarioCard as HTMLElement).getByRole('button', { name: /list\.viewAction/ })
    )
    expect(viewerIframeTitle()).toBe('cv-secundario.pdf')

    await userEvent.click(
      within(secundarioCard as HTMLElement).getByRole('button', { name: /list\.deleteAction/ })
    )
    await userEvent.click(screen.getByRole('button', { name: /list\.confirmDelete/ }))

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith(2, expect.anything())
    })

    // o arquivo secundário (excluído e selecionado) some do viewer, que volta
    // pro principal restante em vez de ficar vazio
    expect(viewerIframeTitle()).toBe('cv-principal.pdf')
  })
})
