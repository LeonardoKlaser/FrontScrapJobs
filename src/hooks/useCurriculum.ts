import type { Curriculum } from '@/models/curriculum'
import { curriculumService } from '@/services/curriculumService'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export function useCurriculum(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['curriculumList'],
    queryFn: curriculumService.getCurriculums,
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled ?? true
  })
}

export function useCreateCurriculum() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: curriculumService.newCurriculum,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curriculumList'] })
    }
  })
}

export function useUpdateCurriculum() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (curriculum: Curriculum) => curriculumService.updateCurriculum(curriculum),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curriculumList'] })
    }
  })
}

export function useDeleteCurriculum() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (curriculumId: number) => curriculumService.deleteCurriculum(curriculumId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curriculumList'] })
    }
  })
}
