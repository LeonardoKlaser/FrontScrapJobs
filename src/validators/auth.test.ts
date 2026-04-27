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
  it('accepts valid signup data', () => {
    const result = signupSchema.safeParse({
      email: 'user@example.com',
      password: '12345678',
      confirmPassword: '12345678'
    })
    expect(result.success).toBe(true)
  })

  it('rejects mismatched passwords', () => {
    const result = signupSchema.safeParse({
      email: 'user@example.com',
      password: '12345678',
      confirmPassword: 'different'
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === 'confirmPassword')
      expect(issue?.message).toBe('As senhas não coincidem')
    }
  })

  it('rejects invalid email', () => {
    const result = signupSchema.safeParse({
      email: 'not-an-email',
      password: '12345678',
      confirmPassword: '12345678'
    })
    expect(result.success).toBe(false)
  })

  it('rejects short password', () => {
    const result = signupSchema.safeParse({
      email: 'user@example.com',
      password: '1234567',
      confirmPassword: '1234567'
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty confirmPassword', () => {
    const result = signupSchema.safeParse({
      email: 'user@example.com',
      password: '12345678',
      confirmPassword: ''
    })
    expect(result.success).toBe(false)
  })
})
