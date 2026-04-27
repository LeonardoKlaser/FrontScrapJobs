import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TrialBanner } from '@/components/app/trial-banner'
import type { User } from '@/models/user'

const mockNavigate = vi.fn()
const mockUseUser = { data: undefined as User | undefined }
const mockTrackTrial = vi.fn()

vi.mock('@/hooks/useUser', () => ({
  useUser: () => mockUseUser
}))

vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate
}))

vi.mock('@/router/paths', () => ({
  PATHS: { app: { renew: '/app/renew' } }
}))

vi.mock('@/lib/analytics', () => ({
  trackTrial: () => mockTrackTrial()
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
    const trialEnd = new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString() // ~1 day
    mockUseUser.data = makeUser({
      is_trial_active: true,
      trial_ends_at: trialEnd,
      expires_at: trialEnd
    })

    render(<TrialBanner />)
    expect(screen.getByText(/1 dia restante/)).toBeInTheDocument()
    expect(screen.queryByText(/dias restantes/)).not.toBeInTheDocument()
  })

  it('shows paywall banner when trial expired (no payment_method, expires_at past)', () => {
    mockUseUser.data = makeUser({
      is_trial_active: false,
      expires_at: new Date(Date.now() - 1000).toISOString() // 1s no passado
    })

    render(<TrialBanner />)
    expect(screen.getByText(/Seu trial acabou/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Assinar agora/i })).toBeInTheDocument()
  })

  it('navigates to /app/renew when "Assinar agora" clicked', async () => {
    mockUseUser.data = makeUser({
      is_trial_active: false,
      expires_at: new Date(Date.now() - 1000).toISOString()
    })

    const user = userEvent.setup()
    render(<TrialBanner />)
    await user.click(screen.getByRole('button', { name: /Assinar agora/i }))

    expect(mockNavigate).toHaveBeenCalledWith('/app/renew')
  })

  it('fires paywall_view trackTrial event once when paywall appears', () => {
    mockUseUser.data = makeUser({
      is_trial_active: false,
      expires_at: new Date(Date.now() - 1000).toISOString()
    })

    render(<TrialBanner />)
    expect(mockTrackTrial).toHaveBeenCalledTimes(1)
  })

  it('does NOT fire paywall_view a second time within same session (sessionStorage flag)', () => {
    mockUseUser.data = makeUser({
      is_trial_active: false,
      expires_at: new Date(Date.now() - 1000).toISOString()
    })

    const { unmount } = render(<TrialBanner />)
    expect(mockTrackTrial).toHaveBeenCalledTimes(1)
    unmount()

    // Re-mount na mesma sessao — sessionStorage flag impede segundo fire
    render(<TrialBanner />)
    expect(mockTrackTrial).toHaveBeenCalledTimes(1)
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
})
