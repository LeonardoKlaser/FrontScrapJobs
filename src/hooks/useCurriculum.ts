import type { Curriculum } from '@/models/curriculum'
import { curriculumService } from '@/services/curriculumService'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export function useCurriculum() {
  return useQuery({
    queryKey: ['curriculumList'],
    queryFn: curriculumService.getCurriculums
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
