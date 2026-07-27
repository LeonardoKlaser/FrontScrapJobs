import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { analysisService } from '@/services/analysisService'
import { useAnalyzeJob, useSendAnalysisEmail, useOptimizationPrompt } from '@/hooks/useAnalysis'
import type { ResumeAnalysis } from '@/services/analysisService'
import type { ReactNode } from 'react'
import { createElement } from 'react'

vi.mock('@/services/analysisService', () => ({
  analysisService: {
    analyzeJob: vi.fn(),
    getAnalysisHistory: vi.fn(),
    sendAnalysisEmail: vi.fn(),
    getOptimizationPrompt: vi.fn()
  }
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

const mockAnalysis: ResumeAnalysis = {
  matchAnalysis: {
    overallScoreNumeric: 85,
    overallScoreQualitative: 'Alto',
    summary: 'Boa compatibilidade'
  },
  atsKeywords: { matched: [], missing: [] },
  strengthsForThisJob: [],
  gapsAndImprovementAreas: [],
  actionableResumeSuggestions: [],
  finalConsiderations: 'OK'
}

describe('useAnalyzeJob', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls analyzeJob on mutate', async () => {
    vi.mocked(analysisService.analyzeJob).mockResolvedValue(mockAnalysis)

    const { result } = renderHook(() => useAnalyzeJob(), { wrapper: createWrapper() })

    await act(async () => {
      result.current.mutate({ jobId: 42, curriculumFileId: 1 })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(analysisService.analyzeJob).toHaveBeenCalledWith(42, 1)
    expect(result.current.data).toEqual(mockAnalysis)
  })

  it('calls analyzeJob with null curriculumFileId to use the principal file', async () => {
    vi.mocked(analysisService.analyzeJob).mockResolvedValue(mockAnalysis)

    const { result } = renderHook(() => useAnalyzeJob(), { wrapper: createWrapper() })

    await act(async () => {
      result.current.mutate({ jobId: 42, curriculumFileId: null })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(analysisService.analyzeJob).toHaveBeenCalledWith(42, null)
  })
})

describe('useSendAnalysisEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls sendAnalysisEmail on mutate', async () => {
    vi.mocked(analysisService.sendAnalysisEmail).mockResolvedValue(undefined)

    const { result } = renderHook(() => useSendAnalysisEmail(), { wrapper: createWrapper() })

    await act(async () => {
      result.current.mutate({ jobId: 42, analysis: mockAnalysis })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(analysisService.sendAnalysisEmail).toHaveBeenCalledWith(42, mockAnalysis)
  })
})

describe('useOptimizationPrompt', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls getOptimizationPrompt with the notification id fixed by the hook call', async () => {
    vi.mocked(analysisService.getOptimizationPrompt).mockResolvedValue({
      prompt: 'Reescreva seu CV...',
      cached: false
    })

    const { result } = renderHook(() => useOptimizationPrompt(7), { wrapper: createWrapper() })

    await act(async () => {
      result.current.mutate()
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(analysisService.getOptimizationPrompt).toHaveBeenCalledWith(7)
    expect(result.current.data).toEqual({ prompt: 'Reescreva seu CV...', cached: false })
  })
})
