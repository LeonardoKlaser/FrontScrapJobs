import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Logo } from '@/components/common/logo'
import { PATHS } from '@/router/paths'

export function Footer() {
  const { t } = useTranslation('landing')
  const { t: tCommon } = useTranslation('common')

  return (
    <footer className="py-12 px-4 bg-card border-t border-border/50">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Logo */}
          <Logo size={24} showText textClassName="text-lg" />

          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <Link to={PATHS.terms} className="hover:text-foreground transition-colors duration-150">
              {t('footer.terms')}
            </Link>
            <Link
              to={PATHS.privacy}
              className="hover:text-foreground transition-colors duration-150"
            >
              {t('footer.privacy')}
            </Link>
            <a
              href={`mailto:${tCommon('footer.contactEmail')}`}
              className="hover:text-foreground transition-colors duration-150"
            >
              {tCommon('footer.contactEmail')}
            </a>
          </div>

          <p className="text-sm text-muted-foreground">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  )
}
