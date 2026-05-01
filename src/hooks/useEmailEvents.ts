import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { emailEventsService } from '@/services/emailEventsService'
import type { EmailEventSubscriber } from '@/models/email'

export const emailEventsKey = ['emailEvents'] as const
export const emailSubscribersKey = (eventName: string) =>
  ['emailEventSubscribers', eventName] as const

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
    }
  })
}

export const useUpdateSubscriber = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<EmailEventSubscriber> }) =>
      emailEventsService.updateSubscriber(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['emailEventSubscribers'] })
    }
  })
}

export const useDeleteSubscriber = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => emailEventsService.deleteSubscriber(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['emailEventSubscribers'] })
    }
  })
}
