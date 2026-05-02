import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { emailEventsService } from '@/services/emailEventsService'
import { extractApiError } from '@/lib/extractApiError'
import type { EmailEventSubscriber } from '@/models/email'

export const emailEventsKey = ['emailEvents'] as const
const emailSubscribersKey = (eventName: string) => ['emailEventSubscribers', eventName] as const

// toastError emite toast pra errors que callers não trataram. React-query
// chama tanto o onError default quanto o do call site — call site que já trata
// passa a flag implicitamente sobrescrevendo este via tryCatch + mutateAsync.
const toastError = (fallback: string) => (err: unknown) =>
  toast.error(extractApiError(err, fallback))

export const useEmailEvents = () =>
  useQuery({
    queryKey: emailEventsKey,
    queryFn: () => emailEventsService.list()
  })

export const useSubscribers = (eventName: string | null, activeOnly = false) =>
  useQuery({
    queryKey: eventName
      ? [...emailSubscribersKey(eventName), { activeOnly }]
      : ['emailEventSubscribers', null],
    queryFn: () => emailEventsService.listSubscribers(eventName as string, activeOnly),
    enabled: !!eventName
  })

export const useCreateSubscriber = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Partial<EmailEventSubscriber>) =>
      emailEventsService.createSubscriber(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['emailEventSubscribers'] })
    },
    onError: toastError('Erro ao criar subscriber')
  })
}

export const useUpdateSubscriber = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<EmailEventSubscriber> }) =>
      emailEventsService.updateSubscriber(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['emailEventSubscribers'] })
    },
    onError: toastError('Erro ao atualizar subscriber')
  })
}

export const useDeleteSubscriber = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => emailEventsService.deleteSubscriber(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['emailEventSubscribers'] })
    },
    onError: toastError('Erro ao deletar subscriber')
  })
}
