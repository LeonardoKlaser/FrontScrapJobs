import { describe, it, expect } from 'vitest'
import { loginSchema, signupSchema } from './auth'

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: '12345678'
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: '12345678'
    })
    expect(result.success).toBe(false)
  })

  it('rejects short password', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: '1234567'
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty email', () => {
    const result = loginSchema.safeParse({
      email: '',
      password: '12345678'
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing fields', () => {
    const result = loginSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})

describe('signupSchema', () => {
  const valid = {
    name: 'Fulano de Tal',
    email: 'a@b.com',
    phone: '(11) 91234-5678',
    tax: '529.982.247-25',
    password: '12345678'
  }

  it('aceita payload completo', () => {
    expect(signupSchema.safeParse(valid).success).toBe(true)
  })

  it('rejeita CPF invalido', () => {
    const r = signupSchema.safeParse({ ...valid, tax: '11111111111' })
    expect(r.success).toBe(false)
  })

  it('rejeita celular invalido (10 digitos)', () => {
    const r = signupSchema.safeParse({ ...valid, phone: '(11) 1234-5678' })
    expect(r.success).toBe(false)
  })

  it('rejeita celular sem 9 inicial', () => {
    const r = signupSchema.safeParse({ ...valid, phone: '(11) 81234-5678' })
    expect(r.success).toBe(false)
  })

  it('rejeita senha curta', () => {
    const r = signupSchema.safeParse({ ...valid, password: 'short' })
    expect(r.success).toBe(false)
  })

  it('rejeita nome vazio (so espacos)', () => {
    const r = signupSchema.safeParse({ ...valid, name: '   ' })
    expect(r.success).toBe(false)
  })

  it('rejeita email invalido', () => {
    const r = signupSchema.safeParse({ ...valid, email: 'not-an-email' })
    expect(r.success).toBe(false)
  })

  it('aceita CPF sem mascara', () => {
    expect(signupSchema.safeParse({ ...valid, tax: '52998224725' }).success).toBe(true)
  })

  it('aceita celular sem mascara', () => {
    expect(signupSchema.safeParse({ ...valid, phone: '11912345678' }).success).toBe(true)
  })
})
