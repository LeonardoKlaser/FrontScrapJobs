import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { applicationService } from '@/services/applicationService'

export function useApplications() {
  return useQuery({
    queryKey: ['applications'],
    queryFn: applicationService.getAll
  })
}

export function useCreateApplication() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: applicationService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['latestJobs'] })
    }
  })
}

export function useUpdateApplication() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      ...body
    }: {
      id: number
      status?: string
      interview_round?: number | null
      notes?: string
    }) => applicationService.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['latestJobs'] })
    }
  })
}

export function useDeleteApplication() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: applicationService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['latestJobs'] })
    }
  })
}
