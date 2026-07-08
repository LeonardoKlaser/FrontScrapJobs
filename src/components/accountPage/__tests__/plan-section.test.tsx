import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { PlanSection } from '../plan-section'
import type { User } from '@/models/user'
import type { Plan } from '@/models/plan'

const changePlanMutate = vi.fn()

vi.mock('@/hooks/usePlans', () => ({
  usePlans: () => ({ data: mockPlans })
}))

vi.mock('@/hooks/useChangePlan', () => ({
  useChangePlan: () => ({ mutate: changePlanMutate, isPending: false })
}))

vi.mock('@/services/paymentService', () => ({
  cancelSubscription: vi.fn()
}))

vi.mock('@/services/userService', () => ({
  userService: { updatePreferences: vi.fn() }
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() }
}))

let mockPlans: Plan[] = []

function basePlan(overrides: Partial<Plan> = {}): Plan {
  return {
    id: 1,
    name: 'Profissional',
    price: 29.9,
    max_sites: 10,
    max_ai_analyses: 10,
    max_pdf_extractions: 10,
    max_suggestion_applies: 10,
    max_pdf_generations: 10,
    is_trial: false,
    features: [],
    ...overrides
  }
}

function baseUser(overrides: Partial<User> = {}): User {
  return {
    user_name: 'Fulano',
    email: 'a@b.com',
    is_admin: false,
    plan: basePlan(),
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    ...overrides
  }
}

function wrap(ui: ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{ui}</QueryClientProvider>
}

describe('PlanSection — downgrade Ultra', () => {
  beforeEach(() => {
    changePlanMutate.mockReset()
  })
  afterEach(cleanup)

  it('abre o modal de confirmação ao trocar de Ultra para Profissional', async () => {
    const ultraPlan = basePlan({ id: 1, name: 'Ultra', is_ultra: true })
    const profissionalPlan = basePlan({ id: 2, name: 'Profissional', is_ultra: false })
    mockPlans = [ultraPlan, profissionalPlan]

    const user = userEvent.setup()
    render(wrap(<PlanSection user={baseUser({ plan: ultraPlan })} />))

    const switchButtons = screen.getAllByRole('button', { name: /trocar para este plano/i })
    await user.click(switchButtons[0])

    expect(screen.getByText('Sair do Ultra?')).toBeInTheDocument()
    expect(changePlanMutate).not.toHaveBeenCalled()
  })

  it('não abre o modal ao trocar de Profissional para Ultra', async () => {
    const ultraPlan = basePlan({ id: 1, name: 'Ultra', is_ultra: true })
    const profissionalPlan = basePlan({ id: 2, name: 'Profissional', is_ultra: false })
    mockPlans = [ultraPlan, profissionalPlan]

    const user = userEvent.setup()
    render(wrap(<PlanSection user={baseUser({ plan: profissionalPlan })} />))

    const switchButtons = screen.getAllByRole('button', { name: /trocar para este plano/i })
    await user.click(switchButtons[0])

    expect(screen.queryByText('Sair do Ultra?')).not.toBeInTheDocument()
    expect(changePlanMutate).toHaveBeenCalledWith(ultraPlan.id, expect.anything())
  })

  it('confirmar no modal dispara a troca de plano pendente', async () => {
    const ultraPlan = basePlan({ id: 1, name: 'Ultra', is_ultra: true })
    const profissionalPlan = basePlan({ id: 2, name: 'Profissional', is_ultra: false })
    mockPlans = [ultraPlan, profissionalPlan]

    const user = userEvent.setup()
    render(wrap(<PlanSection user={baseUser({ plan: ultraPlan })} />))

    await user.click(screen.getAllByRole('button', { name: /trocar para este plano/i })[0])
    await user.click(screen.getByText(/confirmar downgrade/i))

    expect(changePlanMutate).toHaveBeenCalledWith(profissionalPlan.id, expect.anything())
    expect(screen.queryByText('Sair do Ultra?')).not.toBeInTheDocument()
  })

  it('cancelar no modal não dispara a troca de plano', async () => {
    const ultraPlan = basePlan({ id: 1, name: 'Ultra', is_ultra: true })
    const profissionalPlan = basePlan({ id: 2, name: 'Profissional', is_ultra: false })
    mockPlans = [ultraPlan, profissionalPlan]

    const user = userEvent.setup()
    render(wrap(<PlanSection user={baseUser({ plan: ultraPlan })} />))

    await user.click(screen.getAllByRole('button', { name: /trocar para este plano/i })[0])
    await user.click(screen.getByRole('button', { name: /^cancelar$/i }))

    expect(changePlanMutate).not.toHaveBeenCalled()
    expect(screen.queryByText('Sair do Ultra?')).not.toBeInTheDocument()
  })
})
