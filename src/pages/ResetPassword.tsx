import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Loader2, LockIcon, CheckCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { authService } from '@/services/authService'
import Logo from '@/assets/logo_dark_contornado.webp'

export default function ResetPassword() {
  const { t } = useTranslation('auth')
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
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
      setTimeout(() => navigate('/login'), 3000)
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : t('reset.error', 'Erro ao redefinir senha. Token pode estar expirado.')
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="animate-fade-in-up relative w-full max-w-md rounded-lg border border-border/50 bg-card p-8">
        <div className="mb-6 flex items-center justify-center">
          <img src={Logo} alt="ScrapJobs" className="h-16 w-16 select-none" draggable={false} />
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground text-center">
              {t('reset.successTitle', 'Senha redefinida!')}
            </h2>
            <p className="text-sm text-muted-foreground text-center">
              {t('reset.successMessage', 'Você será redirecionado para o login em instantes...')}
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-foreground mb-1">
              {t('reset.title', 'Redefinir senha')}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {t('reset.subtitle', 'Escolha uma nova senha para sua conta.')}
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password" className="text-muted-foreground">
                  {t('reset.newPassword', 'Nova senha')}
                </Label>
                <div className="relative">
                  <LockIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="********"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirmPassword" className="text-muted-foreground">
                  {t('reset.confirmPassword', 'Confirmar senha')}
                </Label>
                <div className="relative">
                  <LockIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="********"
                    className="pl-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>
              </div>

              {error && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}

              <Button variant="glow" disabled={loading} className="h-10">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t('reset.submit', 'Redefinir senha')
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              <Link to="/login" className="font-medium text-primary hover:underline">
                <ArrowLeft className="mr-1 inline h-3 w-3" />
                {t('forgot.backToLogin', 'Voltar para o login')}
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
