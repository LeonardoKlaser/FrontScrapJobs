import { useTranslation } from 'react-i18next'

export function ProblemPromiseSection() {
  const { t } = useTranslation('landing')

  return (
    <section className="py-20 sm:py-24 px-4">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-2 gap-16 max-w-6xl mx-auto">
          {/* Problem */}
          <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0ms' }}>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight tracking-tight text-balance">
              {t('problem.heading')}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed text-pretty">
              {t('problem.description')}
            </p>
          </div>

          {/* Promise */}
          <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight tracking-tight text-balance">
              {t('problem.promiseHeading')}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed text-pretty">
              {t('problem.promiseDescription')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
