import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '@/validators/auth'
import { useAuth } from '@/hooks/useAuth'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ArrowRightIcon, Loader2Icon, MailIcon, LockIcon, Eye, EyeOff } from 'lucide-react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'

export function AuthForm() {
  const { login, loading, error } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const { t } = useTranslation('auth')
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange'
  })

  const onSubmit = async (data: LoginInput) => {
    await login(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email" className="text-muted-foreground">
          {t('email', 'E-mail')}
        </Label>
        <div className="relative">
          <MailIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder={t('emailPlaceholder', 'seu@email.com')}
            className="pl-10"
            {...register('email')}
          />
        </div>
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-muted-foreground">
            {t('password', 'Senha')}
          </Label>
          <Link to="/forgot-password" className="text-xs text-primary hover:underline">
            {t('forgotPassword', 'Esqueci minha senha')}
          </Link>
        </div>
        <div className="relative">
          <LockIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder={t('passwordPlaceholder', 'senha')}
            className="pl-10 pr-10"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      <Button
        type="submit"
        variant="glow"
        disabled={loading}
        className="mt-1 h-12 text-base font-semibold"
      >
        {loading ? (
          <Loader2Icon className="h-4 w-4 animate-spin" />
        ) : (
          <>
            {t('submit', 'Entrar')}
            <ArrowRightIcon className="ml-1 h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  )
}
