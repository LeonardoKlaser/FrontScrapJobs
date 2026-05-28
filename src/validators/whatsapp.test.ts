import { describe, it, expect } from 'vitest'
import { whatsappSchema, whatsappCodeSchema } from './whatsapp'

describe('whatsappSchema', () => {
  it('aceita celular valido com mascara', () => {
    expect(whatsappSchema.safeParse({ whatsapp_number: '(11) 91234-5678' }).success).toBe(true)
  })

  it('aceita celular valido sem mascara', () => {
    expect(whatsappSchema.safeParse({ whatsapp_number: '11912345678' }).success).toBe(true)
  })

  it('rejeita celular com 10 digitos', () => {
    expect(whatsappSchema.safeParse({ whatsapp_number: '(11) 1234-5678' }).success).toBe(false)
  })

  it('rejeita celular sem 9 inicial', () => {
    expect(whatsappSchema.safeParse({ whatsapp_number: '11812345678' }).success).toBe(false)
  })

  it('rejeita string vazia', () => {
    expect(whatsappSchema.safeParse({ whatsapp_number: '' }).success).toBe(false)
  })
})

describe('whatsappCodeSchema', () => {
  it('aceita codigo de 6 digitos', () => {
    expect(whatsappCodeSchema.safeParse({ code: '654321' }).success).toBe(true)
  })

  it('aceita codigo com espaços (trim)', () => {
    expect(whatsappCodeSchema.safeParse({ code: '  654321  ' }).success).toBe(true)
  })

  it('rejeita codigo com menos de 6 digitos', () => {
    expect(whatsappCodeSchema.safeParse({ code: '12345' }).success).toBe(false)
  })

  it('rejeita codigo com mais de 6 digitos', () => {
    expect(whatsappCodeSchema.safeParse({ code: '1234567' }).success).toBe(false)
  })

  it('rejeita codigo com letras', () => {
    expect(whatsappCodeSchema.safeParse({ code: '12345a' }).success).toBe(false)
  })

  it('rejeita string vazia', () => {
    expect(whatsappCodeSchema.safeParse({ code: '' }).success).toBe(false)
  })
})
