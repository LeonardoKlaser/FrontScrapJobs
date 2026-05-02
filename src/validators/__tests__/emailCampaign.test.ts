import { describe, it, expect } from 'vitest'
import { createCampaignSchema, scheduleCampaignSchema } from '@/validators/emailCampaign'

describe('createCampaignSchema', () => {
  const valid = {
    name: 'Campanha Teste',
    template_id: 1,
    segment_filter: {}
  }

  it('rejeita nome vazio com "Nome obrigatório"', () => {
    const r = createCampaignSchema.safeParse({ ...valid, name: '' })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.error.issues[0].message).toBe('Nome obrigatório')
    }
  })

  it('rejeita nome com mais de 200 caracteres', () => {
    const r = createCampaignSchema.safeParse({ ...valid, name: 'a'.repeat(201) })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.error.issues[0].message).toBe('Nome muito longo (max 200)')
    }
  })

  it('rejeita template_id <= 0', () => {
    const r = createCampaignSchema.safeParse({ ...valid, template_id: 0 })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.error.issues[0].message).toBe('Selecione um template')
    }
  })

  it('aceita input válido', () => {
    const r = createCampaignSchema.safeParse(valid)
    expect(r.success).toBe(true)
  })

  it('aplica default {} em segment_filter quando omitido', () => {
    const r = createCampaignSchema.safeParse({ name: 'X', template_id: 1 })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.segment_filter).toEqual({})
    }
  })
})

describe('scheduleCampaignSchema', () => {
  it('rejeita send_at no passado com "A data deve estar no futuro"', () => {
    const past = new Date(Date.now() - 60 * 1000).toISOString()
    const r = scheduleCampaignSchema.safeParse({ send_at: past })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.error.issues[0].message).toBe('A data deve estar no futuro')
    }
  })

  it('rejeita string de data inválida', () => {
    const r = scheduleCampaignSchema.safeParse({ send_at: 'not-a-date' })
    expect(r.success).toBe(false)
  })

  it('aceita send_at no futuro', () => {
    const future = new Date(Date.now() + 60 * 60 * 1000).toISOString()
    const r = scheduleCampaignSchema.safeParse({ send_at: future })
    expect(r.success).toBe(true)
  })
})
