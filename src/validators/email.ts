import { z } from 'zod'

export const variableSchemaSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['string', 'int', 'bool', 'array', 'object', 'timestamp']),
  required: z.boolean(),
  sample: z.unknown()
})

export const emailTemplateFormSchema = z.object({
  key: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9_]+$/, 'snake_case ascii only'),
  locale: z.string().default('pt-BR'),
  name: z.string().min(1).max(150),
  description: z.string().nullable().optional(),
  subject: z.string().min(1),
  body_html: z.string().min(1),
  variables_schema: z.array(variableSchemaSchema).default([]),
  is_active: z.boolean().default(true)
})

export type EmailTemplateFormInput = z.infer<typeof emailTemplateFormSchema>

export const subscriberFormSchema = z.object({
  event_id: z.number().int().positive(),
  template_id: z.number().int().positive(),
  name: z.string().min(1).max(150),
  filter_dsl: z.unknown().nullable().optional(),
  delay_seconds: z
    .number()
    .int()
    .min(0)
    .max(7 * 24 * 3600)
    .default(0),
  is_active: z.boolean().default(true)
})

export type SubscriberFormInput = z.infer<typeof subscriberFormSchema>

export const lifecycleFormSchema = z.object({
  name: z.string().min(1).max(150),
  cron_expression: z.string().min(1),
  timezone: z.string().default('America/Sao_Paulo'),
  segment_filter: z.unknown(),
  template_id: z.number().int().positive(),
  dedup_key_template: z.string().min(1),
  dedup_window_hours: z.number().int().min(1).default(168),
  is_active: z.boolean().default(true)
})

export type LifecycleFormInput = z.infer<typeof lifecycleFormSchema>
