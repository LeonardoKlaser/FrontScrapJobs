import { FaqSection } from "@/components/landingPage/faq-section";
import { FeaturesSection } from "@/components/landingPage/features-section";
import { Footer } from "@/components/landingPage/footer";
import { HeroSection } from "@/components/landingPage/hero-section";
import { HowItWorksSection } from "@/components/landingPage/how-it-works-section";
import { PricingSection } from "@/components/landingPage/pricing-section";
import { ProblemPromiseSection } from "@/components/landingPage/problem-promise";
import { ProductVisualizationSection } from "@/components/landingPage/product-visualization-section";
import { SocialProofSection } from "@/components/landingPage/social-proof-section";

export function Landing() {
  return (
    <div>
      <HeroSection />
      <SocialProofSection />
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
