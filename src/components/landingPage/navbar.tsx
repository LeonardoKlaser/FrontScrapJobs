import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Logo } from '@/components/common/logo'
import { SectionWrapper } from './section-wrapper'

const NAV_LINKS = [
  { key: 'features', href: '#features' },
  { key: 'howItWorks', href: '#howItWorks' },
  { key: 'pricing', href: '#pricing' },
  { key: 'faq', href: '#faq' },
] as const

export function LandingNavbar() {
  const { t } = useTranslation('landing')
  const [open, setOpen] = useState(false)

  function scrollTo(href: string) {
    const id = href.replace('#', '')
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setOpen(false)
  }

  return (
    <SectionWrapper>
      <nav
        className="mx-4 mt-4 px-5 py-3 rounded-xl border border-emerald-500/10 flex items-center justify-between"
        style={{
          background: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
      >
        {/* Logo */}
        <Logo size={28} showText textClassName="text-xl" />

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map(({ key, href }) => (
            <button
              key={key}
              onClick={() => scrollTo(href)}
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              {t(`navbar.${key}`)}
            </button>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden lg:block">
          <Button
            variant="glow"
            className="rounded-full px-5 py-2 text-sm font-semibold"
            onClick={() => scrollTo('#pricing')}
          >
            {t('navbar.cta')}
          </Button>
        </div>

        {/* Mobile hamburger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="lg:hidden p-2 text-zinc-600 hover:text-zinc-900">
              <Menu className="w-5 h-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-white p-6">
            <div className="flex items-center justify-between mb-8">
              <Logo size={24} showText textClassName="text-lg" />
              <button onClick={() => setOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              {NAV_LINKS.map(({ key, href }) => (
                <button
                  key={key}
                  onClick={() => scrollTo(href)}
                  className="text-base font-medium text-zinc-600 hover:text-zinc-900 text-left py-2 transition-colors"
                >
                  {t(`navbar.${key}`)}
                </button>
              ))}
              <Button
                variant="glow"
                className="rounded-full mt-4 w-full font-semibold"
                onClick={() => scrollTo('#pricing')}
              >
                {t('navbar.cta')}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </SectionWrapper>
  )
}
