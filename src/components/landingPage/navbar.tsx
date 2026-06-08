import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/common/logo'
import logotipo01 from '@/assets/Logotipo ScrapJobs 01.png'
import { scrollToId } from './landing-cta'
import { trackLanding } from '@/lib/analytics'
import { PATHS } from '@/router/paths'

export function LandingNavbar() {
  const { t } = useTranslation('landing')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const anchorClass = `text-sm font-medium transition-colors duration-300 ${
    scrolled ? 'text-white/90 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'
  }`

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-emerald-600 shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {scrolled ? (
          <img src={logotipo01} alt="ScrapJobs" className="h-7" />
        ) : (
          <Logo size={28} showText textClassName="text-xl" />
        )}

        <div className="hidden items-center gap-6 md:flex">
          <button type="button" onClick={() => scrollToId('howItWorks')} className={anchorClass}>
            {t('navbar.howItWorks')}
          </button>
          <button type="button" onClick={() => scrollToId('pricing')} className={anchorClass}>
            {t('navbar.pricing')}
          </button>
          <button type="button" onClick={() => scrollToId('faq')} className={anchorClass}>
            {t('navbar.faq')}
          </button>
          <Link to={PATHS.login} className={anchorClass}>
            {t('navbar.login')}
          </Link>
        </div>

        <Button
          variant={scrolled ? 'outline' : 'glow'}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors duration-300 ${
            scrolled ? 'bg-white text-emerald-700 border-white hover:bg-white/90' : ''
          }`}
          onClick={() => {
            trackLanding('lp_cta_click', { section: 'navbar' })
            scrollToId('pricing')
          }}
        >
          {t('navbar.cta')}
        </Button>
      </div>
    </nav>
  )
}
