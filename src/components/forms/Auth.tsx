import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '@/validators/auth'
import { useAuth } from '@/hooks/useAuth'
import { Input } from '@/components/ui/input' // shadcn/ui
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router'
import type { AuthLocationState } from '@/types/router'
import { PATHS } from '@/router/paths'

export function Auth() {
  const { login, loading, error } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema)
  })
  const location = useLocation()
  const from = (location.state as AuthLocationState | undefined)?.from?.pathname ?? PATHS.app.home

  const navigate = useNavigate()

  const onSubmit = async (data: LoginInput) => {
    const ok = await login(data)
    if (ok) navigate(from, { replace: true })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto flex w-full max-w-md flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm">E-mail</label>
        <Input type="email" placeholder="seu@email.com" {...register('email')} />
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm">Senha</label>
        <Input type="password" placeholder="••••••" {...register('password')} />
        {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button disabled={loading} className="mt-2">
        {loading ? 'Entrando...' : 'Entrar'}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </form>
  )
}
