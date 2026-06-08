import { useState } from 'react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Loader2, MailIcon, CheckCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { authService } from '@/services/authService'
import { AuthLayout } from '@/components/forms/AuthLayout'
import { LoginSideHero } from '@/components/forms/LoginSideHero'
import { PATHS } from '@/router/paths'

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
    } catch (err) {
      // Sempre mostra sucesso pra prevenir enumeration, mas loga o erro real pra
      // observabilidade (uma falha de rede/500 nao deve sumir sem rastro).
      console.error('forgot-password request failed', err)
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout hero={<LoginSideHero />}>
      {sent ? (
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle className="h-6 w-6 text-emerald-700" />
          </div>
          <h2 className="text-center text-xl font-semibold text-zinc-900">
            {t('forgot.sentTitle', 'E-mail enviado')}
          </h2>
          <p className="max-w-sm text-center text-sm text-zinc-500">
            {t(
              'forgot.sentMessage',
              'Se o e-mail informado estiver cadastrado, você receberá instruções para ' +
                'redefinir sua senha.'
            )}
          </p>
          <Link
            to={PATHS.login}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary
              hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('forgot.backToLogin', 'Voltar para o login')}
          </Link>
        </div>
      ) : (
        <>
          <h2 className="mb-1 text-xl font-semibold text-zinc-900 lg:mb-2">
            {t('forgot.title', 'Esqueceu sua senha?')}
          </h2>
          <p className="mb-8 text-sm text-zinc-500">
            {t('forgot.subtitle', 'Informe seu e-mail para receber um link de redefinição.')}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="text-zinc-500">
                E-mail
              </Label>
              <div className="relative">
                <MailIcon
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2
                    text-zinc-500"
                />
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

            <Button type="submit" variant="glow" size="lg" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t('forgot.submit', 'Enviar link de redefinição')
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
