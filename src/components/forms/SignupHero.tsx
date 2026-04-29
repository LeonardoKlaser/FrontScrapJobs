import { useTranslation } from 'react-i18next'
import { Logo } from '@/components/common/logo'
import { Sparkles } from 'lucide-react'

interface MockJob {
  initial: string
  badge: string
  title: string
  company: string
  match: number
}

export function SignupHero() {
  const { t } = useTranslation('auth')

  const jobs: MockJob[] = [
    {
      initial: 'A',
      badge: 'bg-emerald-500',
      title: t('signup.mockJob1Title', 'Senior Frontend Developer'),
      company: t('signup.mockJob1Company', 'Acme · Remoto · CLT'),
      match: 94
    },
    {
      initial: 'N',
      badge: 'bg-sky-500',
      title: t('signup.mockJob2Title', 'Tech Lead Backend'),
      company: t('signup.mockJob2Company', 'Nimbus · São Paulo'),
      match: 89
    },
    {
      initial: 'O',
      badge: 'bg-amber-500',
      title: t('signup.mockJob3Title', 'Product Manager'),
      company: t('signup.mockJob3Company', 'Orbit · Híbrido'),
      match: 86
    }
  ]

  return (
    <div className="relative z-10 flex max-w-md flex-col gap-10">
      <div>
        <Logo size={52} showText className="mb-7" />

        <div
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30
            bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
        >
          <span className="relative flex h-2 w-2">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary
                opacity-75"
            />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          {t('signup.liveBadge', 'Buscando vagas em tempo real')}
        </div>

        <h1
          className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-foreground
            mb-4"
        >
          {t('signup.heroTitle', 'Suas vagas estão esperando')}
        </h1>
        <p className="max-w-md text-base text-muted-foreground">
          {t(
            'signup.heroSubtitle',
            'Conecte seu currículo, escolha as empresas e deixe a IA do ScrapJobs ' +
              'encontrar as vagas certas pra você. 7 dias grátis, sem cartão.'
          )}
        </p>
      </div>

      <div className="space-y-3">
        {jobs.map((job, i) => (
          <div
            key={job.initial}
            className="hover-lift group flex items-center gap-3 rounded-xl border border-border/80
              bg-background/95 p-3.5 shadow-sm backdrop-blur-sm animate-fade-in-up"
            style={{
              transform: `rotate(${(i - 1) * 1.2}deg) translateX(${(i - 1) * 8}px)`,
              animationDelay: `${250 + i * 150}ms`
            }}
          >
            <div
              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg
                font-display text-sm font-bold text-white ${job.badge}`}
            >
              {job.initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{job.title}</p>
              <p className="truncate text-xs text-muted-foreground">{job.company}</p>
            </div>
            <div
              className="flex flex-shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2.5
                py-1 text-xs font-semibold text-primary"
            >
              <Sparkles className="h-3 w-3" />
              {job.match}%
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-8 border-t border-border/60 pt-6">
        <div>
          <p className="font-display text-2xl font-bold text-foreground">500+</p>
          <p className="text-xs text-muted-foreground">
            {t('hero.jobsMonitored', 'vagas monitoradas')}
          </p>
        </div>
        <div>
          <p className="font-display text-2xl font-bold text-foreground">50+</p>
          <p className="text-xs text-muted-foreground">
            {t('hero.companiesTracked', 'empresas rastreadas')}
          </p>
        </div>
        <div>
          <p className="font-display text-2xl font-bold text-primary">
            7 {t('signup.days', 'dias')}
          </p>
          <p className="text-xs text-muted-foreground">{t('signup.freeTrial', 'grátis')}</p>
        </div>
      </div>
    </div>
  )
}
