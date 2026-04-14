import { useNavigate, useSearchParams, useLocation } from 'react-router'
import { Button } from '@/components/ui/button'
import { CheckCircle2, ArrowRight, Mail } from 'lucide-react'
import { PATHS } from '@/router/paths'
import { useTranslation } from 'react-i18next'

export default function PaymentConfirmationPage() {
  const { t } = useTranslation('plans')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const location = useLocation()

  const planName = searchParams.get('plan') || t('confirmation.fallbackPlan')
  const isPublicRoute = !location.pathname.startsWith('/app')

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Success Icon */}
        <div className="animate-fade-in-up mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-14 w-14 text-primary" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        <div className="space-y-6 text-center">
          <h1 className="animate-fade-in-up text-gradient-primary text-3xl font-bold tracking-tight sm:text-4xl [animation-delay:100ms]">
            {t('confirmation.title')}
          </h1>

          <p className="animate-fade-in-up text-lg leading-relaxed text-muted-foreground [animation-delay:200ms]">
            {t('confirmation.message', { planName })}
          </p>

          <div className="animate-fade-in-up rounded-lg border border-border/50 bg-card p-4 [animation-delay:300ms]">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4 text-primary" />
              <span>{t('confirmation.emailSent')}</span>
            </div>
          </div>

          <div className="animate-fade-in-up [animation-delay:400ms]">
            <Button
              variant="glow"
              onClick={() => navigate(isPublicRoute ? PATHS.login : PATHS.app.home)}
              size="lg"
              className="w-full"
            >
              {t(isPublicRoute ? 'confirmation.goToLogin' : 'confirmation.goToDashboard')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <p className="animate-fade-in-up text-xs text-muted-foreground [animation-delay:500ms]">
            {t('confirmation.needHelp')}{' '}
            <a
              href={`mailto:${t('footer.contactEmail', { ns: 'common' })}`}
              className="text-primary hover:underline"
            >
              {t('footer.contactEmail', { ns: 'common' })}
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
