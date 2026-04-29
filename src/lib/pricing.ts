import type { Plan } from '@/models/plan'

// quarterlyDiscountPct calcula o desconto percentual (0-100) entre o preco
// trimestral promocional (em centavos no plano) e o equivalente a 3 meses
// no preco mensal cheio. Retorna 0 quando o plano nao tem trimestral
// configurado ou quando o preco mensal e' invalido (evita NaN no display).
//
// Math em centavos pra evitar drift de ponto flutuante (ex: 29.9 * 3 = 89.7
// em float, 8970 em centavos — saida final em inteiro).
export function quarterlyDiscountPct(plan: Plan): number {
  if (plan.quarterly_price_cents == null) return 0
  // quarterly_price_cents <= 0 indica plano misconfigurado — retornar 100%
  // confundiria UX (mostraria "Trimestral - economia de 100%" no botao).
  // Trata como "sem trimestral configurado" e esconde o discount.
  if (plan.quarterly_price_cents <= 0) return 0
  if (!plan.price || plan.price <= 0) return 0
  const monthlyCents = Math.round(plan.price * 100)
  const fullThreeMonthsCents = monthlyCents * 3
  if (fullThreeMonthsCents <= 0) return 0
  const discountCents = fullThreeMonthsCents - plan.quarterly_price_cents
  return Math.round((discountCents / fullThreeMonthsCents) * 100)
}
