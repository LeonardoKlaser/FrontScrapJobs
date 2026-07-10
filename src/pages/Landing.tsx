import { useLayoutEffect } from 'react'
import { CtaFinalSection } from '@/components/landingPage/cta-final-section'
import { FaqSection } from '@/components/landingPage/faq-section'
import { Footer } from '@/components/landingPage/footer'
import { HeroNorteSection } from '@/components/landingPage/hero-norte-section'
import { HowItWorksStrip } from '@/components/landingPage/how-it-works-strip'
import { LandingNavbar } from '@/components/landingPage/navbar'
import { MulticanalSection } from '@/components/landingPage/multicanal-section'
import { NorteCapabilitiesSection } from '@/components/landingPage/norte-capabilities-section'
import { PricingSection } from '@/components/landingPage/pricing-section'
import { ProofBandSection } from '@/components/landingPage/proof-band-section'

export function Landing() {
  useLayoutEffect(() => {
    const root = document.documentElement
    const hadDark = root.classList.contains('dark')
    root.classList.remove('dark')
    return () => {
      if (hadDark) root.classList.add('dark')
    }
  }, [])

  return (
    <div className="bg-white">
      <LandingNavbar />
      <HeroNorteSection />
      <ProofBandSection />
      <HowItWorksStrip />
      <NorteCapabilitiesSection />
      <MulticanalSection />
      <PricingSection />
      <FaqSection />
      <CtaFinalSection />
      <Footer />
    </div>
  )
}
