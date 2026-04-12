import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { PATHS } from '@/router/paths'

export function AppFooter() {
  const { t } = useTranslation('common')

  return (
    <footer className="border-t border-border/50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link
              to={PATHS.terms}
              className="hover:text-foreground transition-colors duration-150"
            >
              {t('footer.terms')}
            </Link>
            <Link
              to={PATHS.privacy}
              className="hover:text-foreground transition-colors duration-150"
            >
              {t('footer.privacy')}
            </Link>
          </div>

          <p className="text-sm text-muted-foreground">
            {t('footer.contact')}{' '}
            <a
              href={`mailto:${t('footer.contactEmail')}`}
              className="text-primary hover:underline transition-colors duration-150"
            >
              {t('footer.contactEmail')}
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
