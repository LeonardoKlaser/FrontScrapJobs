// src/components/forms/Register.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { RegisterSchema, type RegisterInput } from '@/validators/auth'
import { useAuth } from '@/hooks/useAuth'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ArrowRightIcon, Loader2Icon } from 'lucide-react'

export function RegisterForm() {
  const { register: registerUser, loading, error } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    mode: 'onChange'
  })

  const onSubmit = async (data: RegisterInput) => {
    await registerUser(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto flex w-full max-w-md flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm">Nome</label>
        <Input type="text" placeholder="Seu nome completo" {...register('name')} />
        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm">E-mail</label>
        <Input type="email" placeholder="seu@email.com" {...register('email')} />
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm">Senha</label>
        <Input type="password" placeholder="senha" {...register('password')} />
        {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="confirmPassword" className="text-sm">
          Confirmar Senha
        </label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirme a senha"
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button disabled={loading}>
        {loading ? <Loader2Icon className="h-4 w-4 animate-spin" /> : 'Cadastrar'}
        {!loading && <ArrowRightIcon className="ml-2 h-4 w-4" />}
      </Button>
    </form>
  )
}
