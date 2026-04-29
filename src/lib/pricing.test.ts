import { describe, it, expect } from 'vitest'
import { quarterlyDiscountPct } from './pricing'
import type { Plan } from '@/models/plan'

const basePlan: Plan = {
  id: 1,
  name: 'Pro',
  price: 29.9,
  max_sites: 3,
  max_ai_analyses: 10,
  max_pdf_extractions: 10,
  max_suggestion_applies: 10,
  max_pdf_generations: 10,
  is_trial: false,
  features: []
}

describe('quarterlyDiscountPct', () => {
  it('retorna 0 quando quarterly_price_cents nao esta configurado', () => {
    expect(quarterlyDiscountPct(basePlan)).toBe(0)
  })

  it('retorna 0 quando price e 0 (evita divisao por zero / NaN)', () => {
    const plan: Plan = { ...basePlan, price: 0, quarterly_price_cents: 7490 }
    expect(quarterlyDiscountPct(plan)).toBe(0)
  })

  it('retorna 0 quando price e negativo', () => {
    const plan: Plan = { ...basePlan, price: -10, quarterly_price_cents: 7490 }
    expect(quarterlyDiscountPct(plan)).toBe(0)
  })

  it('retorna 0 quando quarterly_price_cents e 0 (plano misconfigurado)', () => {
    const plan: Plan = { ...basePlan, price: 29.9, quarterly_price_cents: 0 }
    expect(quarterlyDiscountPct(plan)).toBe(0)
  })

  it('retorna 0 quando quarterly_price_cents e negativo', () => {
    const plan: Plan = { ...basePlan, price: 29.9, quarterly_price_cents: -100 }
    expect(quarterlyDiscountPct(plan)).toBe(0)
  })

  it('calcula 16% quando quarterly é R$74,90 e mensal é R$29,90', () => {
    // 29.90 * 3 = 89.70 (8970 centavos), 8970 - 7490 = 1480, 1480 / 8970 = 16.499%, rounds to 16
    const plan: Plan = { ...basePlan, price: 29.9, quarterly_price_cents: 7490 }
    expect(quarterlyDiscountPct(plan)).toBe(16)
  })

  it('retorna 0 quando quarterly_price_cents é >= preço mensal * 3', () => {
    // sem desconto / preço igual = 0%
    const plan: Plan = { ...basePlan, price: 30, quarterly_price_cents: 9000 }
    expect(quarterlyDiscountPct(plan)).toBe(0)
  })

  it('arredonda para inteiro mais proximo', () => {
    // 49.90 * 3 = 149.70, quarterly = 119.90 (11990), discount = 2980/14970 ≈ 19.91% → 20
    const plan: Plan = { ...basePlan, price: 49.9, quarterly_price_cents: 11990 }
    expect(quarterlyDiscountPct(plan)).toBe(20)
  })
})
