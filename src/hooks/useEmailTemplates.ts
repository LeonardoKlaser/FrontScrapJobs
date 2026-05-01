import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { emailTemplatesService } from '@/services/emailTemplatesService'
import type { EmailTemplate } from '@/models/email'

export const emailTemplatesKey = ['emailTemplates'] as const
export const emailTemplateKey = (id: number) => ['emailTemplate', id] as const

export const useEmailTemplates = (activeOnly = false) =>
  useQuery({
    queryKey: [...emailTemplatesKey, { activeOnly }],
    queryFn: () => emailTemplatesService.list(activeOnly)
  })

export const useEmailTemplate = (id: number | null) =>
  useQuery({
    queryKey: id ? emailTemplateKey(id) : ['emailTemplate', null],
    queryFn: () => emailTemplatesService.get(id as number),
    enabled: id !== null && id > 0
  })

export const useCreateEmailTemplate = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Partial<EmailTemplate>) => emailTemplatesService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: emailTemplatesKey })
  })
}

export const useUpdateEmailTemplate = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<EmailTemplate> }) =>
      emailTemplatesService.update(id, input),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: emailTemplatesKey })
      qc.setQueryData(emailTemplateKey(data.id), data)
    }
  })
}

export const useDeleteEmailTemplate = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => emailTemplatesService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: emailTemplatesKey })
  })
}

export const usePreviewTemplate = () =>
  useMutation({
    mutationFn: ({ id, sample }: { id: number; sample?: Record<string, unknown> }) =>
      emailTemplatesService.preview(id, sample)
  })

export const useTestSendTemplate = () =>
  useMutation({ mutationFn: (id: number) => emailTemplatesService.testSend(id) })
