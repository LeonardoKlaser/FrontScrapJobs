import type { Plan } from '@/models/plan'

export type LandingPlanBenefitKey =
  | 'siteLimit'
  | 'allSites'
  | 'analysisLimit'
  | 'prompt'
  | 'channel'
  | 'dashboard'
  | 'prioritySupport'

export type LandingPlanBenefit = {
  key: LandingPlanBenefitKey
  values?: { count: number }
}

export function getLandingPlanBenefits(plan: Plan): LandingPlanBenefit[] {
  const coverage: LandingPlanBenefit = plan.is_ultra
    ? { key: 'allSites' }
    : { key: 'siteLimit', values: { count: plan.max_sites } }
  const benefits: LandingPlanBenefit[] = [
    coverage,
    { key: 'analysisLimit', values: { count: plan.max_ai_analyses } },
    { key: 'prompt' },
    { key: 'channel' },
    { key: 'dashboard' }
  ]

  if (plan.is_ultra) benefits.push({ key: 'prioritySupport' })

  return benefits
}
