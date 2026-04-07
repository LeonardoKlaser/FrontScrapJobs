import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { FaqSection } from '@/components/landingPage/faq-section'
import { FeaturesSection } from '@/components/landingPage/features-section'
import { Footer } from '@/components/landingPage/footer'
import { HeroSection } from '@/components/landingPage/hero-section'
import { HowItWorksSection } from '@/components/landingPage/how-it-works-section'
import { PricingSection } from '@/components/landingPage/pricing-section'
import { ProblemPromiseSection } from '@/components/landingPage/problem-promise'
import { ProductVisualizationSection } from '@/components/landingPage/product-visualization-section'
import { SocialProofSection } from '@/components/landingPage/social-proof-section'
import { StatsCounterSection } from '@/components/landingPage/stats-counter-section'

export function Landing() {
  const { hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [hash])

  return (
    <div>
      <HeroSection />
      <SocialProofSection />
      <StatsCounterSection />
      <ProblemPromiseSection />
      <HowItWorksSection />
      <FeaturesSection />
      <ProductVisualizationSection />
      <PricingSection />
      <FaqSection />
      <Footer />
    </div>
  )
}
