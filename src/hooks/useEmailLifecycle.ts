import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { emailLifecycleService } from '@/services/emailLifecycleService'
import type { EmailLifecycleJob } from '@/models/email'

export const emailLifecycleKey = ['emailLifecycle'] as const
export const emailLifecycleJobKey = (id: number) => ['emailLifecycleJob', id] as const

export const useEmailLifecycleJobs = (activeOnly = false) =>
  useQuery({
    queryKey: [...emailLifecycleKey, { activeOnly }],
    queryFn: () => emailLifecycleService.list(activeOnly)
  })

export const useEmailLifecycleJob = (id: number | null) =>
  useQuery({
    queryKey: id ? emailLifecycleJobKey(id) : ['emailLifecycleJob', null],
    queryFn: () => emailLifecycleService.get(id as number),
    enabled: id !== null && id > 0
  })

export const useCreateLifecycle = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Partial<EmailLifecycleJob>) => emailLifecycleService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: emailLifecycleKey })
  })
}

export const useUpdateLifecycle = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<EmailLifecycleJob> }) =>
      emailLifecycleService.update(id, input),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: emailLifecycleKey })
      qc.setQueryData(emailLifecycleJobKey(data.id), data)
    }
  })
}

export const useDeleteLifecycle = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => emailLifecycleService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: emailLifecycleKey })
  })
}

export const useRunLifecycleNow = () =>
  useMutation({ mutationFn: (id: number) => emailLifecycleService.runNow(id) })
