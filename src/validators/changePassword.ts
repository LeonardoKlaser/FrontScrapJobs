import { z } from 'zod'

export const changePasswordSchema = z
  .object({
    old_password: z.string().min(1, { message: 'Senha atual é obrigatória' }),
    new_password: z.string().min(8, { message: 'Mínimo 8 caracteres' }),
    confirm_password: z.string().min(1, { message: 'Confirmação é obrigatória' })
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'As senhas não coincidem',
    path: ['confirm_password']
  })

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
