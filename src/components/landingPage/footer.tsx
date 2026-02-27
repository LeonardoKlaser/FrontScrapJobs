import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Zap } from 'lucide-react'
import { PATHS } from '@/router/paths'

export function Footer() {
  const { t } = useTranslation('landing')

  return (
    <footer className="py-12 px-4 bg-card border-t border-border/50">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">scrapJobs</span>
          </div>

          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <Link to={PATHS.terms} className="hover:text-foreground transition-colors duration-150">
              {t('footer.terms')}
            </Link>
            <Link to={PATHS.privacy} className="hover:text-foreground transition-colors duration-150">
              {t('footer.privacy')}
            </Link>
          </div>

          <p className="text-sm text-muted-foreground">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  )
}
