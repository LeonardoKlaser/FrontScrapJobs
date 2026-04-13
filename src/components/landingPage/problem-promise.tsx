import { useTranslation } from 'react-i18next'
import { AlertTriangle, Sparkles } from 'lucide-react'
import { SectionWrapper } from './section-wrapper'

export function ProblemPromiseSection() {
  const { t } = useTranslation('landing')

  return (
    <SectionWrapper>
      <div className="py-16 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {/* Problem */}
            <div
              className="bg-zinc-50 border border-zinc-200 rounded-xl p-10 space-y-6 animate-fade-in-up"
              style={{ animationDelay: '0ms' }}
            >
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <h2 className="font-display text-2xl font-semibold text-zinc-900">
                {t('problem.heading')}
              </h2>
              <p className="text-base text-zinc-500 leading-relaxed text-pretty">
                {t('problem.description')}
              </p>
            </div>

            {/* Promise */}
            <div
              className="bg-emerald-50/50 border border-emerald-200/50 rounded-xl p-10 space-y-6 animate-fade-in-up"
              style={{ animationDelay: '150ms' }}
            >
              <Sparkles className="w-8 h-8 text-emerald-500" />
              <h2 className="font-display text-2xl font-semibold text-zinc-900">
                <span className="text-gradient-primary">{t('problem.promiseHeading')}</span>
              </h2>
              <p className="text-base text-zinc-500 leading-relaxed text-pretty">
                {t('problem.promiseDescription')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  )
}
