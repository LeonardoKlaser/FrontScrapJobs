import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { emailCampaignService, type ListCampaignsParams } from '@/services/emailCampaignService'
import type {
  CreateCampaignInput,
  EmailCampaign,
  UpdateCampaignInput
} from '@/models/emailCampaign'
import { isCampaignTerminal } from '@/models/emailCampaign'

export const campaignKeys = {
  all: ['email-campaigns'] as const,
  list: (params: ListCampaignsParams) => [...campaignKeys.all, 'list', params] as const,
  detail: (id: number) => [...campaignKeys.all, 'detail', id] as const
}

export const useEmailCampaigns = (params: ListCampaignsParams = {}) =>
  useQuery({
    queryKey: campaignKeys.list(params),
    queryFn: () => emailCampaignService.list(params)
  })

// Polling adaptativo (multi-review apontou que polling fixo 5s pra scheduled
// gerava ~120k requests pra campanha agendada 2 semanas longe):
//   - sending: 5s (fan-out atualiza counters e status)
//   - scheduled <1min de send_at: 5s (transicao iminente)
//   - scheduled <5min: 30s
//   - scheduled longe: false (refetchOnWindowFocus pega ao retornar a aba)
//   - terminal: false
export const useEmailCampaign = (id: number | null | undefined) =>
  useQuery({
    queryKey: campaignKeys.detail(id ?? 0),
    queryFn: () => emailCampaignService.get(id as number),
    enabled: typeof id === 'number' && id > 0,
    refetchInterval: (q) => {
      const data = q.state.data as EmailCampaign | undefined
      if (!data) return false
      if (data.status === 'sending') return 5000
      if (data.status === 'scheduled' && data.send_at) {
        const msUntilSend = new Date(data.send_at).getTime() - Date.now()
        if (msUntilSend <= 60_000) return 5000
        if (msUntilSend <= 5 * 60_000) return 30_000
        return false
      }
      return false
    }
  })

export const useCreateCampaign = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateCampaignInput) => emailCampaignService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: campaignKeys.all })
  })
}

export const useUpdateCampaign = (id: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateCampaignInput) => emailCampaignService.update(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: campaignKeys.all })
      qc.invalidateQueries({ queryKey: campaignKeys.detail(id) })
    }
  })
}

export const useScheduleCampaign = (id: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (send_at: string) => emailCampaignService.schedule(id, send_at),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: campaignKeys.all })
      qc.invalidateQueries({ queryKey: campaignKeys.detail(id) })
    }
  })
}

export const useSendNowCampaign = (id: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => emailCampaignService.sendNow(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: campaignKeys.all })
      qc.invalidateQueries({ queryKey: campaignKeys.detail(id) })
    }
  })
}

export const useCancelCampaign = (id: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => emailCampaignService.cancel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: campaignKeys.all })
      qc.invalidateQueries({ queryKey: campaignKeys.detail(id) })
    }
  })
}

export const useDuplicateCampaign = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => emailCampaignService.duplicate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: campaignKeys.all })
  })
}

export const useDeleteCampaign = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => emailCampaignService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: campaignKeys.all })
  })
}

// Re-export pra evitar imports cruzados em components
export { isCampaignTerminal }
