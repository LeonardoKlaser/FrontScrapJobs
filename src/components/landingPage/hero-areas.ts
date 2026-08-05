// Fonte única das áreas da hero: os ids são exatamente os que o endpoint
// público aceita (usecase/public_jobs_usecase.go), e 'all' é o estado inicial.
export const HERO_AREAS = [
  { id: 'all', labelKey: 'hero.areas.all' },
  { id: 'tecnologia', labelKey: 'hero.areas.technology' },
  { id: 'marketing', labelKey: 'hero.areas.marketing' },
  { id: 'vendas', labelKey: 'hero.areas.sales' },
  { id: 'rh', labelKey: 'hero.areas.hr' },
  { id: 'financas', labelKey: 'hero.areas.finance' },
  { id: 'design', labelKey: 'hero.areas.design' },
  { id: 'dados', labelKey: 'hero.areas.data' }
] as const

export type HeroAreaId = (typeof HERO_AREAS)[number]['id']
