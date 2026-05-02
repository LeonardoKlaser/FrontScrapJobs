import { z } from 'zod'

export const createCampaignSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório').max(200, 'Nome muito longo (max 200)'),
  template_id: z.number().int().positive('Selecione um template'),
  segment_filter: z.record(z.string(), z.unknown()).default({})
})

export type CreateCampaignFormValues = z.infer<typeof createCampaignSchema>

export const scheduleCampaignSchema = z.object({
  send_at: z
    .string()
    .min(1, 'Data obrigatória')
    .refine((v) => {
      const t = new Date(v).getTime()
      return Number.isFinite(t) && t > Date.now()
    }, 'A data deve estar no futuro')
})
