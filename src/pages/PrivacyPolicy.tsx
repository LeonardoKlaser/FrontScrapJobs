import { Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PATHS } from '@/router/paths'

interface PrivacyOperator {
  name: string
  role: string
  country: string
}

interface PrivacyRetentionRow {
  data: string
  retention: string
  basis: string
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-foreground mb-3">{title}</h2>
      {children}
    </section>
  )
}

export default function PrivacyPolicy() {
  const { t } = useTranslation('privacy')

  const operators = t('s4_operators', { returnObjects: true }) as PrivacyOperator[]
  const retention = t('s9_rows', { returnObjects: true }) as PrivacyRetentionRow[]

  const renderItems = (key: string) => {
    const items = t(key, { returnObjects: true }) as string[]
    return (
      <ul className="list-disc pl-5 mt-2 space-y-1">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    )
  }

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="container mx-auto max-w-3xl">
        <Link
          to={PATHS.landing}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground
            hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('backLink')}
        </Link>

        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground mb-2">
          {t('pageTitle')}
        </h1>
        <p className="text-sm text-muted-foreground mb-10">{t('lastUpdated')}</p>

        <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
          <Section title={t('s1_title')}>
            <p>{t('s1_controller')}</p>
            {renderItems('s1_items')}
          </Section>

          <Section title={t('s2_title')}>
            <p>{t('s2_intro')}</p>
            {renderItems('s2_items')}
          </Section>

          <Section title={t('s3_title')}>
            <p>{t('s3_intro')}</p>
            {renderItems('s3_items')}
          </Section>

          <Section title={t('s4_title')}>
            <p>{t('s4_intro')}</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              {operators.map((op, i) => (
                <li key={i}>
                  <span className="font-medium text-foreground">{op.name}</span>
                  {' — '}
                  {op.role} ({op.country})
                </li>
              ))}
            </ul>
          </Section>

          <Section title={t('s5_title')}>
            <p>{t('s5_content')}</p>
          </Section>

          <Section title={t('s6_title')}>
            <p>{t('s6_content')}</p>
          </Section>

          <Section title={t('s7_title')}>
            <p>{t('s7_intro')}</p>
            {renderItems('s7_items')}
            <p className="mt-3">{t('s7_contact')}</p>
          </Section>

          <Section title={t('s8_title')}>
            <p>{t('s8_content')}</p>
          </Section>

          <Section title={t('s9_title')}>
            <p>{t('s9_intro')}</p>
            <table className="w-full text-xs mt-2 border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-2">{t('s9_retention_data_header')}</th>
                  <th className="text-left p-2">{t('s9_retention_period_header')}</th>
                  <th className="text-left p-2">{t('s9_retention_basis_header')}</th>
                </tr>
              </thead>
              <tbody>
                {retention.map((row, i) => (
                  <tr key={i} className="border-b border-border/40">
                    <td className="p-2">{row.data}</td>
                    <td className="p-2">{row.retention}</td>
                    <td className="p-2">{row.basis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3">{t('s9_process')}</p>
          </Section>

          <Section title={t('s10_title')}>
            <p>{t('s10_content')}</p>
          </Section>

          <Section title={t('s11_title')}>
            <p>{t('s11_content')}</p>
          </Section>

          <Section title={t('s12_title')}>
            <p>
              <span className="font-medium text-foreground">{t('s12_dpo_label')}</span>{' '}
              {t('s12_dpo_name')}
              {' — '}
              <a href={`mailto:${t('s12_dpo_email')}`} className="text-foreground hover:underline">
                {t('s12_dpo_email')}
              </a>
            </p>
            <p className="mt-2">{t('s12_contact_label')}</p>
          </Section>
        </div>
      </div>
    </div>
  )
}
