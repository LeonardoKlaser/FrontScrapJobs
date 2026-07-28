import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router'
import type { ReactNode } from 'react'
import { AnalysisDialog } from '../analysis-dialog'
import type { CurriculumFile } from '@/models/curriculum'
import type { ResumeAnalysis } from '@/services/analysisService'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() }
}))

const mockAnalyzeMutate = vi.fn()
const mockReset = vi.fn()
const mockSendEmailMutate = vi.fn()
const mockUploadMutate = vi.fn()
const mockUseAnalysisHistory = vi.fn()
const mockUseCurriculumFiles = vi.fn()

vi.mock('@/hooks/useAnalysis', () => ({
  useAnalyzeJob: () => ({
    mutate: mockAnalyzeMutate,
    isError: false,
    error: null,
    reset: mockReset
  }),
  useAnalysisHistory: (...args: unknown[]) => mockUseAnalysisHistory(...args),
  useSendAnalysisEmail: () => ({ mutate: mockSendEmailMutate, isPending: false, isSuccess: false })
}))

vi.mock('@/hooks/useCurriculumFiles', () => ({
  useCurriculumFiles: (...args: unknown[]) => mockUseCurriculumFiles(...args),
  useUploadCurriculumFile: () => ({ mutate: mockUploadMutate, isPending: false })
}))

// A seção real chama a API de verdade — isolada aqui pra testar só a decisão
// do dialog sobre QUANDO renderizá-la e COM QUAIS props (achado da review:
// notificationId ausente / curriculumFileId da fonte errada no step 'result').
vi.mock('../optimization-prompt-section', () => ({
  OptimizationPromptSection: ({
    notificationId,
    curriculumFileId
  }: {
    notificationId: number
    curriculumFileId: number | null
  }) => (
    <div
      data-testid="optimization-section"
      data-notification-id={notificationId}
      data-curriculum-file-id={curriculumFileId ?? 'null'}
    />
  )
}))

function wrap(ui: ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  )
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

const mockAnalysis: ResumeAnalysis = {
  matchAnalysis: { overallScoreNumeric: 85, overallScoreQualitative: 'Alto', summary: 'Boa' },
  atsKeywords: { matched: [], missing: [] },
  strengthsForThisJob: [],
  gapsAndImprovementAreas: [],
  actionableResumeSuggestions: [],
  finalConsiderations: ''
}

describe('AnalysisDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lista os currículos em PDF e pré-seleciona o principal', async () => {
    mockUseAnalysisHistory.mockReturnValue({ data: { has_analysis: false }, isLoading: false })
    mockUseCurriculumFiles.mockReturnValue({
      data: [
        makeFile({ id: 1, filename: 'cv-antigo.pdf', is_principal: false }),
        makeFile({ id: 2, filename: 'cv-principal.pdf', is_principal: true })
      ],
      isLoading: false
    })

    render(wrap(<AnalysisDialog jobId={7} open onClose={vi.fn()} />))

    await waitFor(() => {
      expect(screen.getByText('cv-antigo.pdf')).toBeInTheDocument()
      expect(screen.getByText('cv-principal.pdf')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: 'analysis.generate' }))

    expect(mockAnalyzeMutate).toHaveBeenCalledWith(
      { jobId: 7, curriculumFileId: 2 },
      expect.anything()
    )
  })

  it('envia o curriculum_file_id do arquivo escolhido manualmente (não o principal)', async () => {
    mockUseAnalysisHistory.mockReturnValue({ data: { has_analysis: false }, isLoading: false })
    mockUseCurriculumFiles.mockReturnValue({
      data: [
        makeFile({ id: 1, filename: 'cv-a.pdf', is_principal: false }),
        makeFile({ id: 2, filename: 'cv-b.pdf', is_principal: true })
      ],
      isLoading: false
    })

    render(wrap(<AnalysisDialog jobId={7} open onClose={vi.fn()} />))

    await waitFor(() => expect(screen.getByText('cv-a.pdf')).toBeInTheDocument())
    await userEvent.click(screen.getByText('cv-a.pdf'))
    await userEvent.click(screen.getByRole('button', { name: 'analysis.generate' }))

    expect(mockAnalyzeMutate).toHaveBeenCalledWith(
      { jobId: 7, curriculumFileId: 1 },
      expect.anything()
    )
  })

  it('esconde a seção de otimização quando o histórico ainda não tem notification_id', async () => {
    mockUseAnalysisHistory.mockReturnValue({
      data: {
        has_analysis: true,
        analysis: mockAnalysis,
        curriculum_file_id: 3,
        notification_id: undefined
      },
      isLoading: false
    })
    mockUseCurriculumFiles.mockReturnValue({
      data: [makeFile({ id: 3, filename: 'cv-usado.pdf' })],
      isLoading: false
    })

    render(wrap(<AnalysisDialog jobId={7} open onClose={vi.fn()} />))

    await waitFor(() => expect(screen.getByText('cv-usado.pdf')).toBeInTheDocument())
    expect(screen.queryByTestId('optimization-section')).not.toBeInTheDocument()
  })

  it('mostra a seção de otimização com os ids do histórico quando notification_id existe', async () => {
    mockUseAnalysisHistory.mockReturnValue({
      data: {
        has_analysis: true,
        analysis: mockAnalysis,
        curriculum_file_id: 3,
        notification_id: 42
      },
      isLoading: false
    })
    mockUseCurriculumFiles.mockReturnValue({ data: [makeFile({ id: 3 })], isLoading: false })

    render(wrap(<AnalysisDialog jobId={7} open onClose={vi.fn()} />))

    await waitFor(() => {
      const section = screen.getByTestId('optimization-section')
      expect(section).toHaveAttribute('data-notification-id', '42')
      expect(section).toHaveAttribute('data-curriculum-file-id', '3')
    })
  })

  it('resultado fresco usa o arquivo selecionado localmente, não o curriculum_file_id (possivelmente desatualizado) do histórico', async () => {
    mockUseAnalysisHistory.mockReturnValue({
      data: { has_analysis: false, curriculum_file_id: 999, notification_id: 42 },
      isLoading: false
    })
    mockUseCurriculumFiles.mockReturnValue({
      data: [
        makeFile({ id: 1, filename: 'cv-escolhido.pdf', is_principal: true }),
        makeFile({ id: 999, filename: 'cv-de-outra-analise.pdf' })
      ],
      isLoading: false
    })
    mockAnalyzeMutate.mockImplementation((_vars, opts) => opts.onSuccess(mockAnalysis))

    render(wrap(<AnalysisDialog jobId={7} open onClose={vi.fn()} />))

    await waitFor(() => expect(screen.getByText('cv-escolhido.pdf')).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: 'analysis.generate' }))

    await waitFor(() => {
      // "Currículo utilizado" no resultado fresco aponta pro arquivo
      // selecionado (id 1), não pro id 999 que o histórico (de uma análise
      // anterior/outro job) ainda carrega nesse instante.
      expect(screen.getByText('cv-escolhido.pdf')).toBeInTheDocument()
      expect(screen.queryByText('cv-de-outra-analise.pdf')).not.toBeInTheDocument()
    })
    const section = screen.getByTestId('optimization-section')
    expect(section).toHaveAttribute('data-curriculum-file-id', '1')
    expect(section).toHaveAttribute('data-notification-id', '42')
  })

  it('estado vazio faz upload inline e emenda direto na análise', async () => {
    mockUseAnalysisHistory.mockReturnValue({ data: { has_analysis: false }, isLoading: false })
    mockUseCurriculumFiles.mockReturnValue({ data: [], isLoading: false })
    mockUploadMutate.mockImplementation((_file, opts) =>
      opts.onSuccess(makeFile({ id: 9, filename: 'cv-novo.pdf', is_principal: true }))
    )

    render(wrap(<AnalysisDialog jobId={7} open onClose={vi.fn()} />))

    await waitFor(() => {
      expect(screen.getByText('analysis.noCurriculumError')).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: 'upload.button' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'analysis.generate' })).not.toBeInTheDocument()

    const file = new File(['%PDF-1.4'], 'cv-novo.pdf', { type: 'application/pdf' })
    fireEvent.change(screen.getByTestId('analysis-upload-input'), { target: { files: [file] } })

    expect(mockUploadMutate).toHaveBeenCalledWith(file, expect.anything())
    // upload concluído emenda direto na análise com o arquivo recém-enviado
    expect(mockAnalyzeMutate).toHaveBeenCalledWith(
      { jobId: 7, curriculumFileId: 9 },
      expect.anything()
    )
  })

  it('não envia arquivo acima do limite de tamanho nem dispara análise', async () => {
    mockUseAnalysisHistory.mockReturnValue({ data: { has_analysis: false }, isLoading: false })
    mockUseCurriculumFiles.mockReturnValue({ data: [], isLoading: false })

    render(wrap(<AnalysisDialog jobId={7} open onClose={vi.fn()} />))

    await waitFor(() => {
      expect(screen.getByText('analysis.noCurriculumError')).toBeInTheDocument()
    })

    const bigFile = new File(['x'], 'cv-grande.pdf', { type: 'application/pdf' })
    Object.defineProperty(bigFile, 'size', { value: 11 * 1024 * 1024 })
    fireEvent.change(screen.getByTestId('analysis-upload-input'), { target: { files: [bigFile] } })

    expect(mockUploadMutate).not.toHaveBeenCalled()
    expect(mockAnalyzeMutate).not.toHaveBeenCalled()
  })

  it('mostra estado de erro distinto (com retry) quando o carregamento inicial de currículos falha', async () => {
    const mockRefetch = vi.fn()
    mockUseAnalysisHistory.mockReturnValue({ data: { has_analysis: false }, isLoading: false })
    mockUseCurriculumFiles.mockReturnValue({
      data: undefined,
      isLoading: false,
      // isLoadingError (não isError): sem cache nenhum, o erro ocorreu no
      // carregamento inicial — este é o único caso que deve mostrar o
      // bloqueio de erro em vez da lista.
      isLoadingError: true,
      refetch: mockRefetch
    })

    render(wrap(<AnalysisDialog jobId={7} open onClose={vi.fn()} />))

    await waitFor(() => {
      expect(screen.getByText('analysis.curriculumFilesError')).toBeInTheDocument()
    })
    // distinto do estado de "zero PDFs": não mostra o CTA de upload nem o
    // texto do estado vazio
    expect(screen.queryByText('analysis.noCurriculumError')).not.toBeInTheDocument()
    expect(screen.queryByTestId('analysis-upload-input')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'analysis.generate' })).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'analysis.retry' }))
    expect(mockRefetch).toHaveBeenCalledTimes(1)
  })

  it('falha de refetch em segundo plano NÃO esconde os currículos já em cache', async () => {
    mockUseAnalysisHistory.mockReturnValue({ data: { has_analysis: false }, isLoading: false })
    mockUseCurriculumFiles.mockReturnValue({
      data: [makeFile({ id: 1, filename: 'cv-em-cache.pdf', is_principal: true })],
      isLoading: false,
      // isError true mas isLoadingError false: já havia dados em cache (ex.:
      // staleTime de 5min expirou e o refetch em segundo plano falhou, tipo
      // dialog reaberto depois desse tempo com um hiccup de rede) — mesmo
      // princípio do item 2 (Curriculum.tsx): não pode esconder um seletor
      // utilizável atrás do estado de erro.
      isError: true,
      isLoadingError: false,
      refetch: vi.fn()
    })

    render(wrap(<AnalysisDialog jobId={7} open onClose={vi.fn()} />))

    await waitFor(() => {
      expect(screen.getByText('cv-em-cache.pdf')).toBeInTheDocument()
    })
    expect(screen.queryByText('analysis.curriculumFilesError')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'analysis.generate' })).toBeInTheDocument()
  })
})
