import { AuthForm } from '@/components/forms/Auth'
import { PATHS } from '@/router/paths'
import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import Logo from '@/assets/logo_dark_contornado.webp'
import { useUser } from '@/hooks/useUser'
import { useTranslation } from 'react-i18next'

export default function Login() {
  const { data: user } = useUser()
  const navigate = useNavigate()
  const { t } = useTranslation('auth')

  useEffect(() => {
    if (user) navigate(PATHS.app.home)
  }, [user, navigate])

  return (
    <div className="flex min-h-screen">
      {/* Left Panel — Brand Hero (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-20 bg-card border-r border-border/50 relative overflow-hidden">
        <div className="pointer-events-none absolute -left-24 -top-24 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px]" />
        <div className="pointer-events-none absolute right-0 bottom-0 h-[300px] w-[300px] rounded-full bg-primary/3 blur-[80px]" />
        <div className="relative z-10">
          <img
            src={Logo}
            alt="ScrapJobs"
            className="h-20 w-20 mb-8 select-none"
            draggable={false}
          />
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground mb-4">
            {t('hero.title', 'Encontre as vagas certas, automaticamente.')}
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-md">
            {t('hero.subtitle', 'O ScrapJobs monitora páginas de carreiras e analisa compatibilidade com seu currículo usando IA.')}
          </p>
          <div className="flex gap-8">
            <div>
              <p className="font-display text-2xl font-bold text-primary">500+</p>
              <p className="text-sm text-muted-foreground">
                {t('hero.jobsMonitored', 'vagas monitoradas')}
              </p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-primary">50+</p>
              <p className="text-sm text-muted-foreground">
                {t('hero.companiesTracked', 'empresas rastreadas')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-4 bg-background">
        <div className="w-full max-w-sm animate-fade-in-up">
          <div className="mb-8 flex items-center justify-center lg:hidden">
            <img
              src={Logo}
              alt="ScrapJobs"
              className="h-32 w-32 select-none"
              draggable={false}
            />
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
            <Link to="/#pricing" className="font-medium text-primary hover:underline">
              {t('login.choosePlan', 'Escolha um plano')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
