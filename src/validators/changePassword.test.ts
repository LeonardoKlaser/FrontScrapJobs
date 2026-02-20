import { describe, it, expect } from 'vitest'
import { changePasswordSchema } from './changePassword'

describe('changePasswordSchema', () => {
  it('accepts valid input', () => {
    const result = changePasswordSchema.safeParse({
      old_password: 'oldpass123',
      new_password: 'newpass123',
      confirm_password: 'newpass123'
    })
    expect(result.success).toBe(true)
  })

  it('rejects mismatched passwords', () => {
    const result = changePasswordSchema.safeParse({
      old_password: 'oldpass123',
      new_password: 'newpass123',
      confirm_password: 'different'
    })
    expect(result.success).toBe(false)
  })

  it('rejects short new password', () => {
    const result = changePasswordSchema.safeParse({
      old_password: 'oldpass123',
      new_password: '1234567',
      confirm_password: '1234567'
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty old password', () => {
    const result = changePasswordSchema.safeParse({
      old_password: '',
      new_password: 'newpass123',
      confirm_password: 'newpass123'
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty confirm password', () => {
    const result = changePasswordSchema.safeParse({
      old_password: 'oldpass123',
      new_password: 'newpass123',
      confirm_password: ''
    })
    expect(result.success).toBe(false)
  })
})
