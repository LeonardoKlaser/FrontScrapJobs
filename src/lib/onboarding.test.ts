import { describe, expect, it } from 'vitest'
import { shouldStartWebOnboarding } from './onboarding'

describe('shouldStartWebOnboarding', () => {
  it('não reinicia após conclusão em outro canal, mesmo sem empresas individuais', () => {
    expect(shouldStartWebOnboarding(true, 0)).toBe(false)
  })

  it('preserva contas legadas que já monitoram empresas', () => {
    expect(shouldStartWebOnboarding(undefined, 2)).toBe(false)
  })

  it('inicia para uma conta realmente nova', () => {
    expect(shouldStartWebOnboarding(false, 0)).toBe(true)
  })
})
