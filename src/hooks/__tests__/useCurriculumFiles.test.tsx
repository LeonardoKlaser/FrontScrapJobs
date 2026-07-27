import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { curriculumFilesService } from '@/services/curriculumFilesService'
import {
  useCurriculumFiles,
  useUploadCurriculumFile,
  useDeleteCurriculumFile,
  useSetPrincipalCurriculumFile
} from '@/hooks/useCurriculumFiles'
import type { CurriculumFile } from '@/models/curriculum'
import type { ReactNode } from 'react'
import { createElement } from 'react'

vi.mock('@/services/curriculumFilesService', () => ({
  curriculumFilesService: {
    list: vi.fn(),
    upload: vi.fn(),
    remove: vi.fn(),
    setPrincipal: vi.fn()
  }
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
  return { wrapper, invalidateSpy }
}

const mockFile: CurriculumFile = {
  id: 1,
  filename: 'cv.pdf',
  size_bytes: 1024,
  is_principal: true,
  created_at: '2026-01-01T00:00:00Z'
}

describe('useCurriculumFiles', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches the curriculum file list', async () => {
    vi.mocked(curriculumFilesService.list).mockResolvedValue([mockFile])

    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useCurriculumFiles(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual([mockFile])
  })
})

describe('useUploadCurriculumFile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls upload on mutate and invalidates curriculum-files', async () => {
    const file = new File(['pdf-bytes'], 'cv.pdf', { type: 'application/pdf' })
    vi.mocked(curriculumFilesService.upload).mockResolvedValue(mockFile)

    const { wrapper, invalidateSpy } = createWrapper()
    const { result } = renderHook(() => useUploadCurriculumFile(), { wrapper })

    await act(async () => {
      result.current.mutate(file)
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(curriculumFilesService.upload).toHaveBeenCalledWith(file)
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['curriculum-files'] })
  })
})

describe('useDeleteCurriculumFile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls remove on mutate and invalidates curriculum-files', async () => {
    vi.mocked(curriculumFilesService.remove).mockResolvedValue(undefined)

    const { wrapper, invalidateSpy } = createWrapper()
    const { result } = renderHook(() => useDeleteCurriculumFile(), { wrapper })

    await act(async () => {
      result.current.mutate(5)
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(curriculumFilesService.remove).toHaveBeenCalledWith(5)
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['curriculum-files'] })
  })
})

describe('useSetPrincipalCurriculumFile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls setPrincipal on mutate and invalidates curriculum-files', async () => {
    vi.mocked(curriculumFilesService.setPrincipal).mockResolvedValue(undefined)

    const { wrapper, invalidateSpy } = createWrapper()
    const { result } = renderHook(() => useSetPrincipalCurriculumFile(), { wrapper })

    await act(async () => {
      result.current.mutate(7)
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(curriculumFilesService.setPrincipal).toHaveBeenCalledWith(7)
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['curriculum-files'] })
  })
})
