import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router'
import { PATHS } from '@/router/paths'
import { Logo } from '@/components/common/logo'
import { useTranslation } from 'react-i18next'

export function AuthBackLink() {
  const { t } = useTranslation('auth')

  return (
    <div className="flex items-center justify-between mb-6">
      <Link
        to={PATHS.landing}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('backToHome', 'Voltar')}
      </Link>
      <Link to={PATHS.landing}>
        <Logo size={32} />
      </Link>
    </div>
  )
}
