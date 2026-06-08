import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Loader2, LockIcon, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { authService } from '@/services/authService'
import { isAxiosError } from 'axios'
import { AuthLayout } from '@/components/forms/AuthLayout'
import { LoginSideHero } from '@/components/forms/LoginSideHero'
import { PATHS } from '@/router/paths'

export default function ResetPassword() {
  const { t } = useTranslation('auth')
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError(t('reset.minLength', 'A senha deve ter no mínimo 8 caracteres'))
      return
    }
    if (password !== confirmPassword) {
      setError(t('reset.mismatch', 'As senhas não coincidem'))
      return
    }
    if (!token) {
      setError(t('reset.noToken', 'Token de redefinição não encontrado'))
      return
    }

    setLoading(true)
    try {
      await authService.resetPassword(token, password)
      setSuccess(true)
    } catch (err: unknown) {
      const msg =
        isAxiosError(err) && err.response?.data?.error
          ? err.response.data.error
          : t('reset.error', 'Erro ao redefinir senha. Token pode estar expirado.')
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // Redireciona pro login apos o sucesso. O timer e limpo no cleanup pra nao
  // disparar navigate depois que o componente desmontar.
  useEffect(() => {
    if (!success) return
    const id = setTimeout(() => navigate(PATHS.login), 3000)
    return () => clearTimeout(id)
  }, [success, navigate])

  return (
    <AuthLayout hero={<LoginSideHero />}>
      {success ? (
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle className="h-6 w-6 text-emerald-700" />
          </div>
          <h2 className="text-center text-xl font-semibold text-zinc-900">
            {t('reset.successTitle', 'Senha redefinida!')}
          </h2>
          <p className="text-center text-sm text-zinc-500">
            {t('reset.successMessage', 'Você será redirecionado para o login em instantes...')}
          </p>
        </div>
      ) : (
        <>
          <h2 className="mb-1 text-xl font-semibold text-zinc-900 lg:mb-2">
            {t('reset.title', 'Redefinir senha')}
          </h2>
          <p className="mb-8 text-sm text-zinc-500">
            {t('reset.subtitle', 'Escolha uma nova senha para sua conta.')}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password" className="text-zinc-500">
                {t('reset.newPassword', 'Nova senha')}
              </Label>
              <div className="relative">
                <LockIcon
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2
                    text-zinc-500"
                />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="********"
                  className="pl-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500
                    transition-colors hover:text-zinc-900"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirmPassword" className="text-zinc-500">
                {t('reset.confirmPassword', 'Confirmar senha')}
              </Label>
              <div className="relative">
                <LockIcon
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2
                    text-zinc-500"
                />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="********"
                  className="pl-10 pr-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500
                    transition-colors hover:text-zinc-900"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" variant="glow" size="lg" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t('reset.submit', 'Redefinir senha')
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            <Link to={PATHS.login} className="font-medium text-primary hover:underline">
              <ArrowLeft className="mr-1 inline h-3 w-3" />
              {t('forgot.backToLogin', 'Voltar para o login')}
            </Link>
          </p>
        </>
      )}
    </AuthLayout>
  )
}
