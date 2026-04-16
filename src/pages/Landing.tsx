import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Footer } from '@/components/landingPage/footer'
import { HeroSection } from '@/components/landingPage/hero-section'
import { LandingNavbar } from '@/components/landingPage/navbar'
import { PricingSection } from '@/components/landingPage/pricing-section'
import { ProblemSection } from '@/components/landingPage/problem-section'
import { StickyCtaBar } from '@/components/landingPage/sticky-cta-bar'
import { TrustSection } from '@/components/landingPage/trust-section'
import { ValueFeaturesSection } from '@/components/landingPage/value-features-section'

export function Landing() {
  const [stickyVisible, setStickyVisible] = useState(false)
  const heroSentinelRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const root = document.documentElement
    const hadDark = root.classList.contains('dark')
    root.classList.remove('dark')
    return () => {
      if (hadDark) root.classList.add('dark')
    }
  }, [])

  useEffect(() => {
    const sentinel = heroSentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setStickyVisible(!entry.isIntersecting)
      },
      { threshold: 0 }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="bg-white">
      <LandingNavbar />
      <StickyCtaBar visible={stickyVisible} />
      <HeroSection />
      <div ref={heroSentinelRef} aria-hidden="true" />
      <ProblemSection />
      <ValueFeaturesSection />
      <TrustSection />
      <PricingSection />
      <Footer />
    </div>
  )
}
