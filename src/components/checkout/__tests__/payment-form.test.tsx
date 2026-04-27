import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
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

vi.mock('@/hooks/useUser', () => ({
  useUser: () => mockUseUser
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
      is_admin: false,
      plan: undefined
    }

    renderWithProviders(<PaymentForm plan={mockPlan} isLoading={false} setIsLoading={vi.fn()} />)

    // Step 1 ('Seus Dados') NAO renderiza — campos exclusivos dele (nome
    // completo, senha) nao aparecem. Evita depender do label de step 2 (CEP),
    // que poderia mudar a copy.
    expect(screen.queryByLabelText(/nome completo/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/^senha/i)).not.toBeInTheDocument()
  })

  it('starts at step 1 when user is anonymous', () => {
    mockUseUser.data = undefined

    renderWithProviders(<PaymentForm plan={mockPlan} isLoading={false} setIsLoading={vi.fn()} />)

    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument()
  })

  it('shows spinner while user query is loading', () => {
    mockUseUser.data = undefined
    mockUseUser.isLoading = true

    renderWithProviders(<PaymentForm plan={mockPlan} isLoading={false} setIsLoading={vi.fn()} />)

    expect(screen.queryByLabelText(/nome completo/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/^senha/i)).not.toBeInTheDocument()
  })
})
