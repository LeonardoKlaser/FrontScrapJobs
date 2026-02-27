import { useState } from 'react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Loader2, MailIcon, CheckCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { authService } from '@/services/authService'
import Logo from '@/assets/logo_dark_contornado.webp'

export default function ForgotPassword() {
  const { t } = useTranslation('auth')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      await authService.forgotPassword(email)
      setSent(true)
    } catch {
      // Always show success to prevent enumeration
      setSent(true)
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

        {sent ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground text-center">
              {t('forgot.sentTitle', 'E-mail enviado')}
            </h2>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              {t(
                'forgot.sentMessage',
                'Se o e-mail informado estiver cadastrado, você receberá instruções para redefinir sua senha.'
              )}
            </p>
            <Link
              to="/login"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('forgot.backToLogin', 'Voltar para o login')}
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-foreground mb-1">
              {t('forgot.title', 'Esqueceu sua senha?')}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {t('forgot.subtitle', 'Informe seu e-mail para receber um link de redefinição.')}
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email" className="text-muted-foreground">
                  E-mail
                </Label>
                <div className="relative">
                  <MailIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button variant="glow" disabled={loading} className="h-10">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t('forgot.submit', 'Enviar link de redefinição')
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
