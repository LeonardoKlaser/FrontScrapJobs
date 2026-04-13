import { useLayoutEffect } from 'react'
import { CtaFinalSection } from '@/components/landingPage/cta-final-section'
import { FaqSection } from '@/components/landingPage/faq-section'
import { FeaturesSection } from '@/components/landingPage/features-section'
import { Footer } from '@/components/landingPage/footer'
import { HeroSection } from '@/components/landingPage/hero-section'
import { HowItWorksSection } from '@/components/landingPage/how-it-works-section'
import { LandingNavbar } from '@/components/landingPage/navbar'
import { PricingSection } from '@/components/landingPage/pricing-section'
import { ProblemPromiseSection } from '@/components/landingPage/problem-promise'
import { ProductVisualizationSection } from '@/components/landingPage/product-visualization-section'
import { SavingsCalculatorSection } from '@/components/landingPage/savings-calculator-section'
import { SocialProofSection } from '@/components/landingPage/social-proof-section'
import { StatsCounterSection } from '@/components/landingPage/stats-counter-section'

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
    <div className="bg-emerald-100/30">
      <LandingNavbar />
      <HeroSection />
      <SocialProofSection />
      <StatsCounterSection />
      <ProblemPromiseSection />
      <HowItWorksSection />
      <FeaturesSection />
      <ProductVisualizationSection />
      <SavingsCalculatorSection />
      <PricingSection />
      <FaqSection />
      <CtaFinalSection />
      <Footer />
    </div>
  )
}
