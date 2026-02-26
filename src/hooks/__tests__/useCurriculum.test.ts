import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { curriculumService } from '@/services/curriculumService'
import { useCurriculum, useUpdateCurriculum, useSetActiveCurriculum } from '@/hooks/useCurriculum'
import type { Curriculum } from '@/models/curriculum'
import type { ReactNode } from 'react'
import { createElement } from 'react'

vi.mock('@/services/curriculumService', () => ({
  curriculumService: {
    getCurriculums: vi.fn(),
    updateCurriculum: vi.fn(),
    setActiveCurriculum: vi.fn()
  }
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useCurriculum', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches curriculums', async () => {
    const mockData = [{ id: 1, name: 'Main CV' }]
    vi.mocked(curriculumService.getCurriculums).mockResolvedValue(mockData as Curriculum[])

    const { result } = renderHook(() => useCurriculum(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockData)
  })
})

describe('useUpdateCurriculum', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls updateCurriculum on mutate', async () => {
    const curriculum = { id: 1, name: 'Updated' }
    vi.mocked(curriculumService.updateCurriculum).mockResolvedValue(curriculum as Curriculum)

    const { result } = renderHook(() => useUpdateCurriculum(), { wrapper: createWrapper() })

    await act(async () => {
      result.current.mutate(curriculum as Curriculum)
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(curriculumService.updateCurriculum).toHaveBeenCalledWith(curriculum)
  })
})

describe('useSetActiveCurriculum', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls setActiveCurriculum on mutate', async () => {
    vi.mocked(curriculumService.setActiveCurriculum).mockResolvedValue(undefined)

    const { result } = renderHook(() => useSetActiveCurriculum(), { wrapper: createWrapper() })

    await act(async () => {
      result.current.mutate(5)
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(curriculumService.setActiveCurriculum).toHaveBeenCalledWith(5)
  })
})
