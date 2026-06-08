import { useLayoutEffect, type ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { PATHS } from '@/router/paths'
import { Logo } from '@/components/common/logo'

interface AuthLayoutProps {
  hero: ReactNode
  children: ReactNode
}

// Casca de 2 colunas compartilhada por /login e /signup. Forca light mode (igual
// Landing.tsx) e posiciona o back-link sem sobrepor o logo. O painel hero some no
// mobile; nesse caso o logo aparece no topo do lado do form.
export function AuthLayout({ hero, children }: AuthLayoutProps) {
  const { t } = useTranslation('auth')

  useLayoutEffect(() => {
    const root = document.documentElement
    const hadDark = root.classList.contains('dark')
    root.classList.remove('dark')
    return () => {
      if (hadDark) root.classList.add('dark')
    }
  }, [])

  const backLink = (
    <Link
      to={PATHS.landing}
      className="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors
        hover:text-zinc-900"
    >
      <ArrowLeft className="h-4 w-4" />
      {t('backToHome', 'Voltar')}
    </Link>
  )

  return (
    <div className="flex min-h-screen bg-white">
      {/* Painel esquerdo — hero (escondido no mobile) */}
      <div
        className="relative hidden flex-col justify-center border-r border-zinc-200 bg-zinc-50
          px-12 lg:flex lg:w-1/2 xl:px-20"
      >
        <div className="absolute left-12 top-6 z-10 xl:left-20">{backLink}</div>
        {hero}
      </div>

      {/* Lado do formulario */}
      <div className="flex w-full items-center justify-center px-4 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-6 lg:hidden">{backLink}</div>
          <div className="mb-8 flex flex-col items-center justify-center lg:hidden">
            <Logo size={80} showText />
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
