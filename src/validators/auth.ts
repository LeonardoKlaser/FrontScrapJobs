import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email({ message: 'E-mail inválido' }),
  password: z.string().min(8, { message: 'Mínimo 8 caracteres' })
})

export const RegisterSchema = z.object({
  email: z.email({ message: 'E-mail inválido' }),
  password: z.string().min(8, { message: 'Mínimo 8 caracteres' }),
  confirmPassword: z.string().min(8, { message: 'Mínimo 8 caracteres' }),
  name: z.string().min(2, { message: 'Mínimo 2 caracteres' })
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword']
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof RegisterSchema>
