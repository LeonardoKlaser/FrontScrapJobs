import { z } from 'zod'
import { isValidCPF } from '@/lib/validators/cpf'
import { isValidBRCellphone } from '@/lib/validators/phone'

export const loginSchema = z.object({
  email: z.email({ message: 'E-mail inválido' }),
  password: z.string().min(8, { message: 'Mínimo 8 caracteres' })
})

export type LoginInput = z.infer<typeof loginSchema>

export const signupSchema = z.object({
  name: z.string().trim().min(1, { message: 'Nome obrigatório' }),
  email: z.email({ message: 'E-mail inválido' }),
  phone: z
    .string()
    .refine(isValidBRCellphone, { message: 'Celular inválido (use 11 dígitos com DDD)' }),
  tax: z.string().refine(isValidCPF, { message: 'CPF inválido' }),
  password: z.string().min(8, { message: 'Mínimo 8 caracteres' })
})

export type SignupInput = z.infer<typeof signupSchema>
