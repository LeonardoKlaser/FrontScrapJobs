import { vi } from 'vitest'
import { api } from '@/services/api'
import {
  cancelSubscription,
  checkPaymentStatus,
  createPixMonthly,
  createSubscribeCard
} from '@/services/paymentService'

vi.mock('@/services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn()
  }
}))

describe('paymentService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates an AbacatePay card checkout from a pending registration', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { checkout_url: 'https://example.test/checkout/card' }
    })

    const result = await createSubscribeCard(2, {
      pending_id: 'pending-fixture'
    })

    expect(api.post).toHaveBeenCalledWith('/api/payments/subscribe-card/2', {
      pending_id: 'pending-fixture'
    })
    expect(result.checkout_url).toBe('https://example.test/checkout/card')
  })

  it('returns a scheduled plan change without requiring another checkout', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { plan_change_scheduled: true }
    })

    const result = await createSubscribeCard(6, {
      name: 'Billing Fixture',
      email: 'billing-fixture@example.test',
      password: 'fixture-password',
      tax: '00000000000',
      cellphone: '11900000000'
    })

    expect(result).toEqual({ plan_change_scheduled: true })
  })

  it('creates a one-month transparent PIX charge', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: {
        checkout_id: '0198-checkout-fixture',
        qr_code: 'fixture-pix-code',
        qr_code_url: 'https://example.test/fixture-pix.png',
        expires_at: '2026-07-13T15:00:00Z'
      }
    })

    const result = await createPixMonthly({
      pending_id: 'pending-fixture',
      plan_id: 2
    })

    expect(api.post).toHaveBeenCalledWith('/api/payments/pix-monthly', {
      pending_id: 'pending-fixture',
      plan_id: 2
    })
    expect(result.qr_code).toBe('fixture-pix-code')
    expect(result.checkout_id).toBe('0198-checkout-fixture')
  })

  it('checks payment status using the pending checkout email', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { status: 'confirmed' } })

    const result = await checkPaymentStatus({
      email: 'billing-fixture@example.test'
    })

    expect(api.get).toHaveBeenCalledWith('/api/payments/status', {
      params: { email: 'billing-fixture@example.test' }
    })
    expect(result.status).toBe('confirmed')
  })

  it('prioritizes checkout_id over email when both are available', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { status: 'processing' } })

    await checkPaymentStatus({
      email: 'billing-fixture@example.test',
      checkoutId: '0198-checkout-fixture'
    })

    expect(api.get).toHaveBeenCalledWith('/api/payments/status', {
      params: { checkout_id: '0198-checkout-fixture' }
    })
  })

  it('checks by checkout_id without requiring an email', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { status: 'processing' } })

    await checkPaymentStatus({ checkoutId: '0198-checkout-fixture' })

    expect(api.get).toHaveBeenCalledWith('/api/payments/status', {
      params: { checkout_id: '0198-checkout-fixture' }
    })
  })

  it('normalizes whitespace around checkout_id before checking payment status', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { status: 'processing' } })

    await checkPaymentStatus({ checkoutId: '  0198-checkout-fixture  ' })

    expect(api.get).toHaveBeenCalledWith('/api/payments/status', {
      params: { checkout_id: '0198-checkout-fixture' }
    })
  })

  it('falls back to a normalized email when checkout_id is blank', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { status: 'confirmed' } })

    await checkPaymentStatus({
      email: '  billing-fixture@example.test  ',
      checkoutId: '   '
    })

    expect(api.get).toHaveBeenCalledWith('/api/payments/status', {
      params: { email: 'billing-fixture@example.test' }
    })
  })

  it('rejects an empty lookup before making an HTTP request', async () => {
    await expect(checkPaymentStatus({ email: '  ', checkoutId: '' })).rejects.toThrow(
      'checkout_id ou email é obrigatório'
    )

    expect(api.get).not.toHaveBeenCalled()
  })

  it('cancels the current recurring subscription through the backend', async () => {
    vi.mocked(api.delete).mockResolvedValue({
      data: { message: 'Assinatura cancelada com sucesso' }
    })

    const result = await cancelSubscription()

    expect(api.delete).toHaveBeenCalledWith('/api/subscription/cancel')
    expect(result.message).toBe('Assinatura cancelada com sucesso')
  })
})
