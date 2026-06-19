import { AuthLayout } from '@/components/forms/AuthLayout'
import { AuthHero } from '@/components/forms/AuthHero'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { PATHS } from '@/router/paths'
import { SignupWizard } from '@/components/signup/SignupWizard'

export default function Signup() {
  const { t } = useTranslation('auth')

  const hero = (
    <AuthHero
      eyebrow={t('signup.liveBadge', 'Buscando vagas em tempo real')}
      title={t('signup.heroTitle', 'Suas vagas estão esperando')}
      subtitle={t(
        'signup.heroSubtitle',
        'Conecte seu currículo, escolha as empresas e deixe a IA do ScrapJobs ' +
          'encontrar as vagas certas pra você. 7 dias grátis, sem cartão.'
      )}
      jobs={[
        {
          initial: 'A',
          title: t('signup.mockJob1Title', 'Senior Frontend Developer'),
          company: t('signup.mockJob1Company', 'Acme · Remoto · CLT'),
          match: 94
        },
        {
          initial: 'N',
          title: t('signup.mockJob2Title', 'Tech Lead Backend'),
          company: t('signup.mockJob2Company', 'Nimbus · São Paulo'),
          match: 89
        },
        {
          initial: 'O',
          title: t('signup.mockJob3Title', 'Product Manager'),
          company: t('signup.mockJob3Company', 'Orbit · Híbrido'),
          match: 86
        }
      ]}
      stats={[
        {
          value: '500+',
          label: t('hero.jobsMonitored', 'vagas monitoradas')
        },
        {
          value: '50+',
          label: t('hero.companiesTracked', 'empresas rastreadas')
        },
        {
          value: `7 ${t('signup.days', 'dias')}`,
          label: t('signup.freeTrial', 'grátis'),
          highlight: true
        }
      ]}
    />
  )

  return (
    <AuthLayout hero={hero}>
      <h2 className="mb-1 text-xl font-semibold text-zinc-900 lg:mb-2">
        {t('signup.title', 'Crie sua conta')}
      </h2>
      <p className="mb-8 text-sm text-zinc-500">
        {t('signup.subtitle', 'Verifique seu WhatsApp para começar.')}
      </p>

      <SignupWizard />

      <p className="mt-6 text-center text-sm text-zinc-500">
        {t('signup.hasAccount', 'Já tem uma conta?')}{' '}
        <Link to={PATHS.login} className="font-medium text-primary hover:underline">
          {t('signup.login', 'Fazer login')}
        </Link>
      </p>
    </AuthLayout>
  )
}
