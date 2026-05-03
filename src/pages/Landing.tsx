import { useLayoutEffect } from 'react'
import { AudienceSection } from '@/components/landingPage/audience-section'
import { CtaFinalSection } from '@/components/landingPage/cta-final-section'
import { FaqSection } from '@/components/landingPage/faq-section'
import { Footer } from '@/components/landingPage/footer'
import { HeroSection } from '@/components/landingPage/hero-section'
import { HowItWorksSection } from '@/components/landingPage/how-it-works-section'
import { LandingNavbar } from '@/components/landingPage/navbar'
import { PricingSection } from '@/components/landingPage/pricing-section'
import { ProblemSection } from '@/components/landingPage/problem-section'
import { ValueFeaturesSection } from '@/components/landingPage/value-features-section'
import { SavingsCalculatorSection } from '@/components/landingPage/savings-calculator-section'
import { SocialProofSection } from '@/components/landingPage/social-proof-section'
import { StatsCounterSection } from '@/components/landingPage/stats-counter-section'
import { TestimonialsSection } from '@/components/landingPage/testimonials-section'

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
      <AudienceSection />
      <ProblemSection />
      <HowItWorksSection />
      <ValueFeaturesSection />
      <SocialProofSection />
      <StatsCounterSection />
      <TestimonialsSection />
      <SavingsCalculatorSection />
      <PricingSection />
      <FaqSection />
      <CtaFinalSection />
      <Footer />
    </div>
  )
}
