import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '@/validators/auth'
import { useAuth } from '@/hooks/useAuth'
import { Input } from '@/components/ui/input' // shadcn/ui
import { Button } from '@/components/ui/button'
import { ArrowRightIcon, Loader2Icon } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router'
import { PATHS } from '@/router/paths'

export function AuthForm() {
  const { login, loading, error } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange'
  })
  const { search } = useLocation()
  const params = new URLSearchParams(search)
  const fromQS = params.get('from') || PATHS.app.home

  const navigate = useNavigate()

  const onSubmit = async (data: LoginInput) => {
    const ok = await login(data)
    if (ok) navigate(fromQS, { replace: true })
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
        <Input type="password" placeholder="senha" {...register('password')} />
        {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button disabled={loading}>
        {loading ? <Loader2Icon className="h-4 w-4 animate-spin" /> : 'Entrar'}
        {!loading && <ArrowRightIcon className="ml-2 h-4 w-4" />}
      </Button>
    </form>
  )
}
