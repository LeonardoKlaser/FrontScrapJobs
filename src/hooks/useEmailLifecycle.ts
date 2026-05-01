import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { emailLifecycleService } from '@/services/emailLifecycleService'
import { extractApiError } from '@/lib/extractApiError'
import type { EmailLifecycleJob } from '@/models/email'

export const emailLifecycleKey = ['emailLifecycle'] as const
export const emailLifecycleJobKey = (id: number) => ['emailLifecycleJob', id] as const

const toastError = (fallback: string) => (err: unknown) =>
  toast.error(extractApiError(err, fallback))

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
    onSuccess: () => qc.invalidateQueries({ queryKey: emailLifecycleKey }),
    onError: toastError('Erro ao criar lifecycle')
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
    },
    onError: toastError('Erro ao atualizar lifecycle')
  })
}

export const useDeleteLifecycle = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => emailLifecycleService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: emailLifecycleKey }),
    onError: toastError('Erro ao deletar lifecycle')
  })
}

// useRunLifecycleNow não tem onError default — LifecycleList passa onError
// per-call com o nome do job pra mensagem ser mais útil (extractApiError + nome).
// Adicionar default aqui geraria duplo toast.
export const useRunLifecycleNow = () =>
  useMutation({ mutationFn: (id: number) => emailLifecycleService.runNow(id) })
