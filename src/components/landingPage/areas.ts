import type { AreaValue } from '@/services/publicJobsService'

// Os `value` sao constantes da API (?area=dev) e NUNCA sao traduzidos — so o
// label passa pelo i18n. Traduzir o value quebraria a query no backend.
// AreaValue (de publicJobsService) e a fonte unica de verdade do enum.
export const AREAS: ReadonlyArray<{ value: AreaValue; labelKey: string }> = [
  { value: 'dev', labelKey: 'hero.areas.dev' },
  { value: 'produto', labelKey: 'hero.areas.produto' },
  { value: 'design', labelKey: 'hero.areas.design' },
  { value: 'dados', labelKey: 'hero.areas.dados' },
  { value: 'infra', labelKey: 'hero.areas.infra' }
]

export type Area = AreaValue
export const DEFAULT_AREA: Area = 'dev'
