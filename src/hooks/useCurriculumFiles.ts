import { curriculumFilesService } from '@/services/curriculumFilesService'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const CURRICULUM_FILES_KEY = ['curriculum-files']

export function useCurriculumFiles(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: CURRICULUM_FILES_KEY,
    queryFn: curriculumFilesService.list,
    enabled: options?.enabled ?? true
  })
}

export function useUploadCurriculumFile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => curriculumFilesService.upload(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CURRICULUM_FILES_KEY })
    }
  })
}

export function useDeleteCurriculumFile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => curriculumFilesService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CURRICULUM_FILES_KEY })
    }
  })
}

export function useSetPrincipalCurriculumFile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => curriculumFilesService.setPrincipal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CURRICULUM_FILES_KEY })
    }
  })
}
