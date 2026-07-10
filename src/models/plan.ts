export interface Plan {
  id: number
  name: string
  price: number
  max_sites: number
  max_ai_analyses: number
  max_pdf_extractions: number
  max_suggestion_applies: number
  max_pdf_generations: number
  is_trial: boolean
  features: string[]
  // Backend e fonte da verdade do preco trimestral. Ausente quando o plano
  // nao tem opcao trimestral configurada — UI deve esconder o toggle nesse caso.
  quarterly_price_cents?: number
  // Backend e fonte da verdade. Marca o plano Ultra (cobertura automatica de
  // todas as empresas — ver ListSites.tsx/isUltraMode). Usado pra decidir se
  // uma troca de plano e um downgrade que exige confirmacao explicita
  // (DowngradeUltraModal) — ver plan-section.tsx.
  is_ultra?: boolean
}
