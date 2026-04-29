import { useEffect } from 'react'
import { AuthForm } from '@/components/forms/Auth'
import { LoginHero } from '@/components/forms/LoginHero'
import { Logo } from '@/components/common/logo'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { PATHS } from '@/router/paths'
import { AuthBackLink, AuthBackLinkLeftPanel } from '@/components/common/AuthBackLink'
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
    <div className="flex min-h-screen">
      {/* Left Panel — Brand Hero (hidden on mobile) */}
      <div
        className="relative hidden overflow-hidden border-r border-border/50 bg-card lg:flex
          lg:w-1/2 flex-col justify-center px-12 xl:px-20"
      >
        <AuthBackLinkLeftPanel />

        {/* Layered ambient glows */}
        <div
          className="pointer-events-none absolute -left-32 -top-32 h-[480px] w-[480px] rounded-full
            bg-primary/10 blur-[120px] animate-glow-pulse"
        />
        <div
          className="pointer-events-none absolute -right-24 bottom-0 h-[360px] w-[360px]
            rounded-full bg-sky-500/5 blur-[100px]"
        />

        {/* Faint grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              'linear-gradient(to right, var(--border) 1px, transparent 1px),' +
              ' linear-gradient(to bottom, var(--border) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)'
          }}
        />

        <LoginHero />
      </div>

      {/* Right Panel — Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-4 bg-background">
        <div className="w-full max-w-sm animate-fade-in-up">
          <AuthBackLink className="lg:hidden" />
          <div className="mb-8 flex flex-col items-center justify-center lg:hidden">
            <Logo size={80} showText />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-1 lg:mb-2">
            {t('login.welcome', 'Bem-vindo de volta')}
          </h2>
          <p className="text-sm text-muted-foreground mb-8">
            {t('login.subtitle', 'Entre na sua conta para continuar')}
          </p>

          <AuthForm />

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t('login.noAccount', 'Primeira missão por aqui?')}{' '}
            <Link to={PATHS.signup} className="font-medium text-primary hover:underline">
              {t('login.startTrial', 'Comece grátis por 7 dias')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
