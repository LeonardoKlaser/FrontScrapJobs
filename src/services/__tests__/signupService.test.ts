import { describe, it, expect, beforeEach } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import { api } from '../api'
import { signupService } from '../signupService'

const mock = new MockAdapter(api)

beforeEach(() => mock.reset())

describe('signupService', () => {
  it('init sends name, phone, and plan_id', async () => {
    mock.onPost('/signup/init').reply(200, {
      signup_session_id: 'sess-123',
      phone_masked: '(**) *****-4321'
    })

    const result = await signupService.init({
      name: 'Maria',
      phone: '11987654321',
      plan_id: 2
    })
    expect(result.signup_session_id).toBe('sess-123')
    expect(result.phone_masked).toContain('4321')
  })

  it('verifyPhone sends session_id and code', async () => {
    mock.onPost('/signup/verify-phone').reply(200, { verified: true })

    const result = await signupService.verifyPhone({
      signup_session_id: 'sess-123',
      code: '123456'
    })
    expect(result.verified).toBe(true)
  })

  it('complete returns payment_required for a commercial plan', async () => {
    mock.onPost('/signup/complete').reply(200, {
      action: 'payment_required',
      pending_id: 'pend-456',
      plan: { id: 2, name: 'Profissional', price: 29.9, is_trial: false }
    })

    const result = await signupService.complete({
      signup_session_id: 'sess-123',
      email: 'billing-fixture@example.test',
      password: '12345678',
      tax: '39053344705'
    })
    expect(result.action).toBe('payment_required')
    expect(result.pending_id).toBe('pend-456')
    expect(result.plan?.id).toBe(2)
  })
})
