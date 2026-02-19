import type { Curriculum } from '@/models/curriculum'
import { curriculoService } from '@/services/curriculumService'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export function useCurriculum() {
  return useQuery({
    queryKey: ['curriculumList'],
    queryFn: curriculoService.getCurriculums
  })
}

export function useUpdateCurriculum() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (curriculum: Curriculum) => curriculoService.updateCurriculum(curriculum),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curriculumList'] })
    }
  })
}

export function useSetActiveCurriculum() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (curriculumId: string) => curriculoService.setActiveCurriculum(curriculumId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curriculumList'] })
    }
  })
}
