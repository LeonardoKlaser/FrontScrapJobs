import { CtaFinalSection } from '@/components/landingPage/cta-final-section'
import { FaqSection } from '@/components/landingPage/faq-section'
import { Footer } from '@/components/landingPage/footer'
import { HeroNorteSection } from '@/components/landingPage/hero-norte-section'
import { HowItWorksStrip } from '@/components/landingPage/how-it-works-strip'
import { IncludedFeaturesSection } from '@/components/landingPage/included-features-section'
import { LandingNavbar } from '@/components/landingPage/navbar'
import { PricingSection } from '@/components/landingPage/pricing-section'
import { ProofBandSection } from '@/components/landingPage/proof-band-section'

export function Landing() {
  return (
    <div className="bg-background">
      <LandingNavbar />
      <HeroNorteSection />
      <ProofBandSection />
      <HowItWorksStrip />
      <IncludedFeaturesSection />
      <PricingSection />
      <FaqSection />
      <CtaFinalSection />
      <Footer />
    </div>
  )
}
