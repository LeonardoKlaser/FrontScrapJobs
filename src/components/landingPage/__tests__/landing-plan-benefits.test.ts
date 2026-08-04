import { describe, expect, it } from 'vitest'
import type { Plan } from '@/models/plan'
import { getLandingPlanBenefits } from '../landing-plan-benefits'

const profissional: Plan = {
  id: 2,
  name: 'Profissional',
  price: 19.9,
  max_sites: 40,
  max_ai_analyses: 20,
  is_trial: false,
  is_ultra: false,
  features: ['NÃO RENDERIZAR']
}

describe('getLandingPlanBenefits', () => {
  it('deriva Profissional sem consultar features', () => {
    expect(getLandingPlanBenefits(profissional)).toEqual([
      { key: 'siteLimit', values: { count: 40 } },
      { key: 'analysisLimit', values: { count: 20 } },
      { key: 'prompt' },
      { key: 'channel' },
      { key: 'dashboard' }
    ])
  })

  it('troca limite por cobertura total e suporte no Ultra', () => {
    expect(
      getLandingPlanBenefits({
        ...profissional,
        id: 3,
        name: 'Ultra',
        price: 29.9,
        max_sites: 0,
        max_ai_analyses: 50,
        is_ultra: true
      })
    ).toEqual([
      { key: 'allSites' },
      { key: 'analysisLimit', values: { count: 50 } },
      { key: 'prompt' },
      { key: 'channel' },
      { key: 'dashboard' },
      { key: 'prioritySupport' }
    ])
  })
})
