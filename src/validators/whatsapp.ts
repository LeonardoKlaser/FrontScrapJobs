import { z } from 'zod'
import { isValidBRCellphone } from '@/lib/validators/phone'

// Reusa o validador Anatel do signup (11 dígitos, 9 no 3º). Mensagem em pt-BR
// (locale primário); a UI traduz via i18n quando precisa.
export const whatsappSchema = z.object({
  whatsapp_number: z
    .string()
    .refine(isValidBRCellphone, { message: 'Número de WhatsApp inválido (use 11 dígitos com DDD)' })
})

export type WhatsAppInput = z.infer<typeof whatsappSchema>

// whatsappCodeSchema valida o código de 6 dígitos do opt-in em duas etapas
// (T9.x). Aceita só dígitos — a UI strippa espaços/dashes antes de enviar.
export const whatsappCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, { message: 'Código deve ter 6 dígitos' })
})

export type WhatsAppCodeInput = z.infer<typeof whatsappCodeSchema>
