import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email({ message: 'E-mail inválido' }),
  password: z.string().min(8, { message: 'Mínimo 8 caracteres' })
})

export type LoginInput = z.infer<typeof loginSchema>

export const signupSchema = z
  .object({
    email: z.email({ message: 'E-mail inválido' }),
    password: z.string().min(8, { message: 'Mínimo 8 caracteres' }),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword']
  })

export type SignupInput = z.infer<typeof signupSchema>
