import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email({ message: 'E-mail inválido' }),
  password: z.string().min(8, { message: 'Mínimo 8 caracteres' })
})

export const RegisterSchema = z.object({
  email: z.email({ message: 'E-mail inválido' }),
  password: z.string().min(8, { message: 'Mínimo 8 caracteres' }),
  name: z.string().min(8, { message: 'Mínimo 8 caracteres' })
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof RegisterSchema>
