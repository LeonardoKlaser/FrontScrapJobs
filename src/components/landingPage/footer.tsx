import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Logo } from '@/components/common/logo'
import { PATHS } from '@/router/paths'
import { SectionWrapper } from './section-wrapper'

export function Footer() {
  const { t } = useTranslation('landing')
  const { t: tCommon } = useTranslation('common')

  return (
    <SectionWrapper>
      <footer className="py-8 px-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            {/* Logo */}
            <Logo size={24} showText textClassName="text-lg" />

            <div className="flex items-center space-x-6">
              <Link to={PATHS.terms} className="text-sm text-zinc-500 hover:text-emerald-500 transition-colors">
                {t('footer.terms')}
              </Link>
              <Link
                to={PATHS.privacy}
                className="text-sm text-zinc-500 hover:text-emerald-500 transition-colors"
              >
                {t('footer.privacy')}
              </Link>
              <a
                href={`mailto:${tCommon('footer.contactEmail')}`}
                className="text-sm text-zinc-500 hover:text-emerald-500 transition-colors"
              >
                {tCommon('footer.contactEmail')}
              </a>
            </div>

            <p className="text-sm text-zinc-400">
              {t('footer.copyright', { year: new Date().getFullYear() })}
            </p>
          </div>
        </div>
      </footer>
    </SectionWrapper>
  )
}
