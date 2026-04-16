import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Logo } from '@/components/common/logo'
import { PATHS } from '@/router/paths'

export function Footer() {
  const { t } = useTranslation('landing')

  return (
    <footer className="py-8 px-4 sm:px-6 border-t border-zinc-200 bg-white">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <Logo size={20} showText textClassName="text-base" />

        <div className="flex items-center gap-6">
          <Link
            to={PATHS.terms}
            className="text-sm text-zinc-500 hover:text-emerald-500 transition-colors"
          >
            {t('footer.terms')}
          </Link>
          <Link
            to={PATHS.privacy}
            className="text-sm text-zinc-500 hover:text-emerald-500 transition-colors"
          >
            {t('footer.privacy')}
          </Link>
        </div>

        <p className="text-xs text-zinc-400">
          {t('footer.copyright', { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  )
}
