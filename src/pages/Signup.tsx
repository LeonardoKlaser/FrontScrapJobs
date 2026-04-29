import { SignupForm } from '@/components/forms/Signup'
import { Logo } from '@/components/common/logo'
import { ShieldCheck } from 'lucide-react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { PATHS } from '@/router/paths'
import { AuthBackLink, AuthBackLinkLeftPanel } from '@/components/common/AuthBackLink'

export default function Signup() {
  const { t } = useTranslation('auth')

  return (
    <div className="flex min-h-screen">
      {/* Left Panel — Brand Hero (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-20 bg-card border-r border-border/50 relative overflow-hidden">
        <AuthBackLinkLeftPanel />
        <div className="pointer-events-none absolute -left-24 -top-24 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px]" />
        <div className="pointer-events-none absolute right-0 bottom-0 h-[300px] w-[300px] rounded-full bg-primary/3 blur-[80px]" />
        <div className="relative z-10">
          <Logo size={80} showText className="mb-8" />
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground mb-4">
            {t('signup.heroTitle', 'Comece grátis. Sem cartão.')}
          </h1>
          <p className="text-lg text-muted-foreground mb-6 max-w-md">
            {t(
              'signup.heroSubtitle',
              '7 dias de acesso Premium completo. Configure seus alertas, ' +
                'suba seu currículo, veja vagas relevantes — depois decide se assina.'
            )}
          </p>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              {t('signup.bullet1', 'Sem cartão de crédito')}
            </li>
            <li className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              {t('signup.bullet2', 'Cancele quando quiser')}
            </li>
            <li className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              {t('signup.bullet3', 'Acesso completo às features Premium')}
            </li>
          </ul>
        </div>
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
