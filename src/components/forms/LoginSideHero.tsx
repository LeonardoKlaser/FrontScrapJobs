import { useTranslation } from 'react-i18next'
import { AuthHero } from '@/components/forms/AuthHero'

// Painel apresentacional do lado esquerdo das paginas da jornada de login
// (/login, esqueci a senha, redefinir senha). Reusa a copia de login pra evitar
// duplicar chaves i18n. NENHUMA chave nova: espelha exatamente o que estava
// inline no Login.tsx.
export function LoginSideHero() {
  const { t } = useTranslation('auth')

  return (
    <AuthHero
      eyebrow={t('login.liveBadge', 'Buscando vagas em tempo real')}
      title={t('login.heroTitle', 'Suas próximas vagas chegaram')}
      subtitle={t(
        'login.heroSubtitle',
        'Entre na sua conta e veja as vagas que combinam com seu perfil. ' +
          'A IA do ScrapJobs continuou trabalhando enquanto você estava fora.'
      )}
      jobs={[
        {
          initial: 'A',
          title: t('login.mockJob1Title', 'Senior Frontend Developer'),
          company: t('login.mockJob1Company', 'Acme · Remoto · CLT'),
          match: 94
        },
        {
          initial: 'N',
          title: t('login.mockJob2Title', 'Tech Lead Backend'),
          company: t('login.mockJob2Company', 'Nimbus · São Paulo'),
          match: 89
        },
        {
          initial: 'O',
          title: t('login.mockJob3Title', 'Product Manager'),
          company: t('login.mockJob3Company', 'Orbit · Híbrido'),
          match: 86
        }
      ]}
      stats={[
        { value: '500+', label: t('hero.jobsMonitored', 'vagas monitoradas') },
        { value: '50+', label: t('hero.companiesTracked', 'empresas rastreadas') },
        {
          value: t('login.matchAvgValue', '94%'),
          label: t('login.matchAvgLabel', 'match médio'),
          highlight: true
        }
      ]}
    />
  )
}
