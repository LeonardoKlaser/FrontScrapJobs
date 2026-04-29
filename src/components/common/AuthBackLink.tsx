import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router'
import { PATHS } from '@/router/paths'
import { Logo } from '@/components/common/logo'
import { useTranslation } from 'react-i18next'

interface AuthBackLinkProps {
  className?: string
}

export function AuthBackLink({ className = '' }: AuthBackLinkProps) {
  const { t } = useTranslation('auth')

  return (
    <div className={`flex items-center justify-between mb-6 ${className}`.trim()}>
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

// Variante usada no painel hero esquerdo das paginas de auth: so o link
// "Voltar", sem o logo (a coluna ja exibe o Logo grande). Posicionada absoluta
// no canto top-left pra nao desalinhar o conteudo centralizado verticalmente.
export function AuthBackLinkLeftPanel() {
  const { t } = useTranslation('auth')

  return (
    <Link
      to={PATHS.landing}
      className="absolute top-6 left-12 xl:left-20 z-20 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      <ArrowLeft className="h-4 w-4" />
      {t('backToHome', 'Voltar')}
    </Link>
  )
}
