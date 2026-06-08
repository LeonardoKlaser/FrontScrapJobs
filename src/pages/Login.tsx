import { useEffect } from 'react'
import { AuthForm } from '@/components/forms/Auth'
import { AuthLayout } from '@/components/forms/AuthLayout'
import { LoginSideHero } from '@/components/forms/LoginSideHero'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { PATHS } from '@/router/paths'
import { consumeRedirectToast } from '@/lib/redirect-toast'

export default function Login() {
  const { t } = useTranslation('auth')

  // Consome toast persistido pelo interceptor 401 do axios. Sem isso, mensagens
  // de "sessao expirou" disparadas em api.ts antes de window.location.href ficavam
  // perdidas no destrute do Toaster durante o reload. Helper retorna null se nao
  // houver intent valido (ou se ja tiver sido consumido).
  useEffect(() => {
    const pending = consumeRedirectToast()
    if (!pending) return
    toast[pending.type](pending.msg)
  }, [])

  return (
    <AuthLayout hero={<LoginSideHero />}>
      <h2 className="mb-1 text-xl font-semibold text-zinc-900 lg:mb-2">
        {t('login.welcome', 'Bem-vindo de volta')}
      </h2>
      <p className="mb-8 text-sm text-zinc-500">
        {t('login.subtitle', 'Entre na sua conta para continuar')}
      </p>

      <AuthForm />

      <p className="mt-6 text-center text-sm text-zinc-500">
        {t('login.noAccount', 'Primeira missão por aqui?')}{' '}
        <Link to={PATHS.signup} className="font-medium text-primary hover:underline">
          {t('login.startTrial', 'Comece grátis por 7 dias')}
        </Link>
      </p>
    </AuthLayout>
  )
}
