import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactElement } from 'react'
import type { Plan } from '@/models/plan'
import type { User } from '@/models/user'
// Inicializa i18n (registra resources pt-BR/en-US) — sem isso, useTranslation
// retorna a key crua, e os getByLabelText falham.
import '@/i18n'

const mockUseUser = {
  data: undefined as User | undefined,
  isLoading: false
}

const subscribeCardMutation = {
  mutateAsync: vi.fn(),
  isPending: false
}
const pixMonthlyMutation = {
  mutateAsync: vi.fn(),
  isPending: false,
  reset: vi.fn()
}
const toastSuccess = vi.fn()

vi.mock('@/hooks/useUser', () => ({
  useUser: () => mockUseUser
}))

vi.mock('@/hooks/useAbacatePay', () => ({
  useAbacatePaySubscribeCard: () => subscribeCardMutation,
  useAbacatePayPixMonthly: () => pixMonthlyMutation
}))

vi.mock('sonner', () => ({
  toast: { success: (...args: unknown[]) => toastSuccess(...args), info: vi.fn(), error: vi.fn() }
}))

// useSaveLead aciona um POST — mock pra evitar que o saveLead tente network
// dentro do PersonalDataStep onNext (que nao roda nos testes mas o hook eh
// invocado no render).
vi.mock('@/hooks/useSaveLead', () => ({
  useSaveLead: () => ({ mutate: vi.fn() })
}))

// useValidateCheckout — mock pra evitar network quando email blur dispara.
vi.mock('@/hooks/useValidateCheckout', () => ({
  useValidateCheckout: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ email_exists: false, tax_exists: false })
  })
}))

import { PaymentForm } from '../payment-form'

const mockPlan: Plan = {
  id: 2,
  name: 'Profissional',
  price: 19.9,
  max_sites: 15,
  max_ai_analyses: 30,
  max_pdf_extractions: 8,
  max_suggestion_applies: 15,
  max_pdf_generations: 5,
  is_trial: false,
  features: ['feat1']
}

function renderWithProviders(ui: ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  )
}

describe('PaymentForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseUser.data = undefined
    mockUseUser.isLoading = false
  })

  it('starts at step 2 when user is logged in', () => {
    mockUseUser.data = {
      user_name: 'Marcia',
      email: 'marcia@test.com',
      cellphone: '11999999999',
      tax: '39053344705',
      is_admin: false,
      plan: undefined
    }

    renderWithProviders(<PaymentForm plan={mockPlan} />)

    // Step 1 ('Seus Dados') NAO renderiza — campos exclusivos dele (nome
    // completo, senha) nao aparecem. Evita depender do label de step 2 (CEP),
    // que poderia mudar a copy.
    expect(screen.queryByLabelText(/nome completo/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/^senha/i)).not.toBeInTheDocument()
  })

  it('starts at step 1 when user is anonymous', () => {
    mockUseUser.data = undefined

    renderWithProviders(<PaymentForm plan={mockPlan} />)

    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument()
  })

  it('shows spinner while user query is loading', () => {
    mockUseUser.data = undefined
    mockUseUser.isLoading = true

    renderWithProviders(<PaymentForm plan={mockPlan} />)

    expect(screen.queryByLabelText(/nome completo/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/^senha/i)).not.toBeInTheDocument()
  })

  it('handles a scheduled card plan change without opening a second checkout', async () => {
    mockUseUser.data = {
      user_name: 'Billing Fixture',
      email: 'billing-fixture@example.test',
      cellphone: '11900000000',
      tax: '00000000000',
      is_admin: false,
      plan: { ...mockPlan, id: 6, name: 'Ultra' },
      payment_method: 'card',
      subscription_status: 'active'
    }
    subscribeCardMutation.mutateAsync.mockResolvedValue({ plan_change_scheduled: true })

    renderWithProviders(<PaymentForm plan={mockPlan} />)
    await userEvent.click(screen.getByRole('button', { name: /ir para pagamento/i }))

    await waitFor(() => {
      expect(subscribeCardMutation.mutateAsync).toHaveBeenCalledWith({
        planId: 2,
        data: expect.objectContaining({ email: 'billing-fixture@example.test' })
      })
      expect(toastSuccess).toHaveBeenCalledWith(
        'Troca de plano agendada para o próximo ciclo de cobrança.'
      )
    })
  })
})
