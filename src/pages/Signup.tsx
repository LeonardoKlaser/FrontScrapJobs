import { SignupForm } from '@/components/forms/Signup'
import { SignupHero } from '@/components/forms/SignupHero'
import { Logo } from '@/components/common/logo'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { PATHS } from '@/router/paths'
import { AuthBackLink, AuthBackLinkLeftPanel } from '@/components/common/AuthBackLink'

export default function Signup() {
  const { t } = useTranslation('auth')

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

        <SignupHero />
      </div>

      {/* Right Panel — Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-4 bg-background">
        <div className="w-full max-w-sm animate-fade-in-up">
          <AuthBackLink className="lg:hidden" />
          <div className="mb-8 flex flex-col items-center justify-center lg:hidden">
            <Logo size={80} showText />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-1 lg:mb-2">
            {t('signup.title', 'Crie sua conta grátis')}
          </h2>
          <p className="text-sm text-muted-foreground mb-8">
            {t('signup.subtitle', '7 dias grátis. Sem cartão. Sem compromisso.')}
          </p>

          <SignupForm />

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t('signup.hasAccount', 'Já tem uma conta?')}{' '}
            <Link to={PATHS.login} className="font-medium text-primary hover:underline">
              {t('signup.login', 'Fazer login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
