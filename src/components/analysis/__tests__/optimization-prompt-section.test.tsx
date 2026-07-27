import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OptimizationPromptSection } from '../optimization-prompt-section'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() }
}))

vi.mock('@/services/curriculumFilesService', () => ({
  curriculumFilesService: {
    downloadUrl: (id: number) => `http://api.test/api/curriculum-files/${id}/download`
  }
}))

const mockMutate = vi.fn()
let mockMutationState: {
  data: { prompt: string; cached: boolean } | undefined
  isPending: boolean
} = { data: undefined, isPending: false }

vi.mock('@/hooks/useAnalysis', () => ({
  useOptimizationPrompt: () => ({
    mutate: mockMutate,
    data: mockMutationState.data,
    isPending: mockMutationState.isPending
  })
}))

describe('OptimizationPromptSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMutationState = { data: undefined, isPending: false }
    Object.assign(navigator, { clipboard: { writeText: vi.fn() } })
  })

  it('renderiza o botão "Gerar prompt de melhorias" inicialmente', () => {
    render(<OptimizationPromptSection notificationId={5} curriculumFileId={9} />)

    expect(
      screen.getByRole('button', { name: 'analysis.optimization.generate' })
    ).toBeInTheDocument()
  })

  it('chama a mutation ao clicar no botão', async () => {
    render(<OptimizationPromptSection notificationId={5} curriculumFileId={9} />)

    await userEvent.click(screen.getByRole('button', { name: 'analysis.optimization.generate' }))

    expect(mockMutate).toHaveBeenCalledTimes(1)
  })

  it('mostra estado de loading enquanto a mutation está pendente', () => {
    mockMutationState = { data: undefined, isPending: true }
    render(<OptimizationPromptSection notificationId={5} curriculumFileId={9} />)

    expect(screen.getByRole('button', { name: 'analysis.optimization.generate' })).toBeDisabled()
  })

  it('ao resolver, mostra o prompt num <pre> + botão de copiar + link de download', () => {
    mockMutationState = {
      data: { prompt: 'Reescreva seu CV destacando Docker.', cached: false },
      isPending: false
    }
    render(<OptimizationPromptSection notificationId={5} curriculumFileId={9} />)

    const pre = screen.getByText('Reescreva seu CV destacando Docker.')
    expect(pre.tagName).toBe('PRE')
    expect(screen.getByRole('button', { name: 'analysis.optimization.copy' })).toBeInTheDocument()

    const link = screen.getByRole('link', { name: 'analysis.optimization.download' })
    expect(link).toHaveAttribute('href', 'http://api.test/api/curriculum-files/9/download')
  })

  it('esconde o link de download quando curriculumFileId é null', () => {
    mockMutationState = { data: { prompt: 'Reescreva seu CV.', cached: false }, isPending: false }
    render(<OptimizationPromptSection notificationId={5} curriculumFileId={null} />)

    expect(
      screen.queryByRole('link', { name: 'analysis.optimization.download' })
    ).not.toBeInTheDocument()
  })

  it('copia o prompt pra área de transferência ao clicar em copiar', async () => {
    mockMutationState = { data: { prompt: 'Reescreva seu CV.', cached: false }, isPending: false }
    render(<OptimizationPromptSection notificationId={5} curriculumFileId={9} />)

    await userEvent.click(screen.getByRole('button', { name: 'analysis.optimization.copy' }))

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Reescreva seu CV.')
  })

  it('mostra o prompt instantaneamente independente do valor de cached', () => {
    mockMutationState = { data: { prompt: 'Prompt cacheado.', cached: true }, isPending: false }
    render(<OptimizationPromptSection notificationId={5} curriculumFileId={9} />)

    expect(screen.getByText('Prompt cacheado.')).toBeInTheDocument()
  })

  it('erro no_analysis mostra toast', async () => {
    const { toast } = await import('sonner')
    mockMutate.mockImplementation((_vars, opts) => {
      opts?.onError?.({
        isAxiosError: true,
        response: { status: 422, data: { error: 'no_analysis' } }
      })
    })

    render(<OptimizationPromptSection notificationId={5} curriculumFileId={9} />)
    await userEvent.click(screen.getByRole('button', { name: 'analysis.optimization.generate' }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('analysis.optimization.noAnalysisError')
    })
  })

  it('erro genérico (não no_analysis) mostra toast genérico', async () => {
    const { toast } = await import('sonner')
    mockMutate.mockImplementation((_vars, opts) => {
      opts?.onError?.(new Error('network down'))
    })

    render(<OptimizationPromptSection notificationId={5} curriculumFileId={9} />)
    await userEvent.click(screen.getByRole('button', { name: 'analysis.optimization.generate' }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('analysis.optimization.error')
    })
  })
})
