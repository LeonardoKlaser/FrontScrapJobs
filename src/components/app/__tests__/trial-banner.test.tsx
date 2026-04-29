import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TrialBanner } from '@/components/app/trial-banner'
import type { User } from '@/models/user'

const mockNavigate = vi.fn()
const mockUseUser = { data: undefined as User | undefined }
const mockTrackTrial = vi.fn()
let mockPathname = '/app'

vi.mock('@/hooks/useUser', () => ({
  useUser: () => mockUseUser
}))

vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: mockPathname })
}))

vi.mock('@/router/paths', () => ({
  PATHS: { app: { renew: '/app/renew' } }
}))

vi.mock('@/lib/analytics', () => ({
  trackTrial: () => mockTrackTrial()
}))

// Stubs the i18n keys used by TrialBanner with the Portuguese copy the
// tests assert against. Centralizing here keeps the component free of
// hardcoded strings while preserving the existing test contract.
const TRANSLATION_STUB: Record<string, string> = {
  'banner.pixExpiresIn': 'Sua assinatura vence em ',
  'banner.pixExpiresToday': 'Sua assinatura expira hoje. ',
  'banner.renewNow': 'Renovar agora',
  'banner.trialActive': 'Você está no trial gratuito. ',
  'banner.trialExpired': 'Seu trial acabou. Assine pra continuar recebendo vagas.',
  'banner.subscribeNow': 'Assinar agora'
}

function stubTranslate(key: string, opts?: { count?: number }): string {
  if (key === 'banner.pixDays' || key === 'banner.pixDays_one') {
    const count = opts?.count ?? 0
    return `${count} ${count === 1 ? 'dia' : 'dias'}`
  }
  if (key === 'banner.trialDaysLeft') {
    const count = opts?.count ?? 0
    return `${count} ${count === 1 ? 'dia restante' : 'dias restantes'}`
  }
  return TRANSLATION_STUB[key] ?? key
}

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: stubTranslate })
}))

function makeUser(overrides: Partial<User> = {}): User {
  return {
    user_name: 'Test',
    email: 'test@x.com',
    is_admin: false,
    plan: undefined,
    ...overrides
  }
}

describe('TrialBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseUser.data = undefined
    mockPathname = '/app'
    window.sessionStorage.clear()
  })

  it('returns null when user is undefined', () => {
    mockUseUser.data = undefined
    const { container } = render(<TrialBanner />)
    expect(container.firstChild).toBeNull()
  })

  it('returns null when user has paid (payment_method present)', () => {
    mockUseUser.data = makeUser({
      payment_method: 'credit_card',
      is_trial_active: false,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    })
    const { container } = render(<TrialBanner />)
    expect(container.firstChild).toBeNull()
  })

  it('shows countdown banner when trial is active', () => {
    const trialEnd = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
    mockUseUser.data = makeUser({
      is_trial_active: true,
      trial_ends_at: trialEnd,
      expires_at: trialEnd
    })

    render(<TrialBanner />)
    expect(screen.getByText(/trial gratuito/i)).toBeInTheDocument()
    // Math.ceil(5d - epsilon) = 5
    expect(screen.getByText(/5 dias restantes/)).toBeInTheDocument()
  })

  it('uses singular "dia restante" when 1 day left', () => {
    // daysBetweenLocal compara start-of-day, então +23h pode dar 0 ou 1
    // dependendo da hora local em que o teste roda. Trava o clock pra garantir
    // que o target cai exatamente no dia seguinte.
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-29T12:00:00.000Z'))
    try {
      const trialEnd = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      mockUseUser.data = makeUser({
        is_trial_active: true,
        trial_ends_at: trialEnd,
        expires_at: trialEnd
      })

      render(<TrialBanner />)
      expect(screen.getByText(/1 dia restante/)).toBeInTheDocument()
      expect(screen.queryByText(/dias restantes/)).not.toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })

  it('shows paywall banner when trial expired (no payment_method, expires_at past)', () => {
    const past = new Date(Date.now() - 1000).toISOString()
    mockUseUser.data = makeUser({
      is_trial_active: false,
      trial_ends_at: past,
      expires_at: past
    })

    render(<TrialBanner />)
    expect(screen.getByText(/Seu trial acabou/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Assinar agora/i })).toBeInTheDocument()
  })

  it('navigates to /app/renew when "Assinar agora" clicked', async () => {
    const past = new Date(Date.now() - 1000).toISOString()
    mockUseUser.data = makeUser({
      is_trial_active: false,
      trial_ends_at: past,
      expires_at: past
    })

    const user = userEvent.setup()
    render(<TrialBanner />)
    await user.click(screen.getByRole('button', { name: /Assinar agora/i }))

    expect(mockNavigate).toHaveBeenCalledWith('/app/renew')
  })

  it('fires paywall_view trackTrial event once when paywall appears', () => {
    const past = new Date(Date.now() - 1000).toISOString()
    mockUseUser.data = makeUser({
      is_trial_active: false,
      trial_ends_at: past,
      expires_at: past
    })

    render(<TrialBanner />)
    expect(mockTrackTrial).toHaveBeenCalledTimes(1)
  })

  it('does NOT fire paywall_view a second time within same session (sessionStorage flag)', () => {
    const past = new Date(Date.now() - 1000).toISOString()
    mockUseUser.data = makeUser({
      is_trial_active: false,
      trial_ends_at: past,
      expires_at: past
    })

    const { unmount } = render(<TrialBanner />)
    expect(mockTrackTrial).toHaveBeenCalledTimes(1)
    unmount()

    // Re-mount na mesma sessao — sessionStorage flag impede segundo fire
    render(<TrialBanner />)
    expect(mockTrackTrial).toHaveBeenCalledTimes(1)
  })

  it('returns null when user never had trial (trial_ends_at NULL) even with expires_at future', () => {
    // Caso real: admin extension / conta legacy pre-Phase 1 — expires_at no
    // futuro mas trial_ends_at NULL. Antes do fix, banner amber renderizava
    // erradamente "Seu trial acabou".
    mockUseUser.data = makeUser({
      is_trial_active: false,
      trial_ends_at: undefined,
      expires_at: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
    })

    const { container } = render(<TrialBanner />)
    expect(container.firstChild).toBeNull()
    expect(mockTrackTrial).not.toHaveBeenCalled()
  })

  it('returns null when user never had trial and no expires_at', () => {
    // Estado totalmente vazio (legacy raro): sem trial e sem acesso vigente.
    // Banner de trial não se aplica — outro fluxo cuida desse user.
    mockUseUser.data = makeUser({
      is_trial_active: false,
      trial_ends_at: undefined,
      expires_at: undefined
    })

    const { container } = render(<TrialBanner />)
    expect(container.firstChild).toBeNull()
  })

  it('returns null when trial expired but expires_at extended into future', () => {
    // Trial expirou mas admin estendeu expires_at sem setar payment_method.
    // hasFutureExpiry suprime o paywall — user tem acesso vigente.
    mockUseUser.data = makeUser({
      is_trial_active: false,
      trial_ends_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      expires_at: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
    })

    const { container } = render(<TrialBanner />)
    expect(container.firstChild).toBeNull()
  })

  it('does not fire paywall_view when only trial countdown is showing', () => {
    const trialEnd = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
    mockUseUser.data = makeUser({
      is_trial_active: true,
      trial_ends_at: trialEnd,
      expires_at: trialEnd
    })

    render(<TrialBanner />)
    expect(mockTrackTrial).not.toHaveBeenCalled()
  })

  it('returns null on /app/renew (evita banner duplicado com o card da pagina)', () => {
    mockPathname = '/app/renew'
    const past = new Date(Date.now() - 1000).toISOString()
    mockUseUser.data = makeUser({
      is_trial_active: false,
      trial_ends_at: past,
      expires_at: past
    })

    const { container } = render(<TrialBanner />)
    expect(container.firstChild).toBeNull()
  })
})
