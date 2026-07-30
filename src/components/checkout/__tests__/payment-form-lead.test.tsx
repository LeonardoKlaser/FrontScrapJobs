import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router'
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
const toastError = vi.fn()
const toastInfo = vi.fn()
const saveLeadMutate = vi.fn()

const mockGetLeadCheckout = vi.fn()
const mockCompleteLeadCheckout = vi.fn()

vi.mock('@/services/leadCheckoutService', () => ({
  getLeadCheckout: (...args: unknown[]) => mockGetLeadCheckout(...args),
  completeLeadCheckout: (...args: unknown[]) => mockCompleteLeadCheckout(...args)
}))

vi.mock('@/hooks/useUser', () => ({
  useUser: () => mockUseUser
}))

vi.mock('@/hooks/useAbacatePay', () => ({
  useAbacatePaySubscribeCard: () => subscribeCardMutation,
  useAbacatePayPixMonthly: () => pixMonthlyMutation
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    info: (...args: unknown[]) => toastInfo(...args),
    error: (...args: unknown[]) => toastError(...args)
  }
}))

// Modo lead nunca deve chamar saveLead — dedicated fixture pra asserir
// explicitamente que o mutate NAO foi acionado (ver teste "não chama saveLead").
vi.mock('@/hooks/useSaveLead', () => ({
  useSaveLead: () => ({ mutate: saveLeadMutate })
}))

// useValidateCheckout — mock pra evitar network quando email blur dispara.
vi.mock('@/hooks/useValidateCheckout', () => ({
  useValidateCheckout: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ email_exists: false, tax_exists: false })
  })
}))

vi.mock('@/components/checkout/pix-payment-step', () => ({
  PixPaymentStep: ({ pixResult }: { pixResult: { checkout_id?: string; qr_code: string } }) => (
    <p>pix-checkout:{pixResult.checkout_id ?? 'legacy-email-fallback'}</p>
  )
}))

import { PaymentForm } from '../payment-form'

const mockPlan: Plan = {
  id: 2,
  name: 'Profissional',
  price: 19.9,
  max_sites: 15,
  max_ai_analyses: 30,
  is_trial: false,
  features: ['feat1']
}

// Sonda de rota: MemoryRouter não re-renderiza nada visível quando
// navigate() é chamado (não há <Routes> nesta árvore), então observamos o
// location.pathname/search direto pra confirmar redirects (ex.: 409 → login).
function LocationProbe() {
  const location = useLocation()
  return (
    <p data-testid="location-probe">
      {location.pathname}
      {location.search}
    </p>
  )
}

function renderWithProviders(ui: ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        {ui}
        <LocationProbe />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('PaymentForm — modo lead (checkout mágico via lead_token)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseUser.data = undefined
    mockUseUser.isLoading = false
    sessionStorage.clear()
  })

  it('pré-preenche nome e telefone travado/verificado ao carregar com lead_token válido', async () => {
    mockGetLeadCheckout.mockResolvedValue({
      name: 'Erick',
      phone_masked: '+55 (51) 9****-0000',
      plan: { id: 2, name: 'Profissional', price: 19.9 }
    })

    renderWithProviders(<PaymentForm plan={mockPlan} leadToken="lead-token-abc" />)

    await waitFor(() => {
      expect(mockGetLeadCheckout).toHaveBeenCalledWith('lead-token-abc')
    })

    const nameInput = await screen.findByLabelText(/nome completo/i)
    await waitFor(() => {
      expect(nameInput).toHaveValue('Erick')
    })
    expect(nameInput).not.toBeDisabled()

    const phoneInput = screen.getByLabelText(/telefone/i)
    expect(phoneInput).toHaveValue('+55 (51) 9****-0000')
    expect(phoneInput).toBeDisabled()

    expect(screen.getByText(/verificado via whatsapp/i)).toBeInTheDocument()

    expect(screen.getByLabelText(/cpf/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^senha/i)).toBeInTheDocument()
  })

  it('completa o checkout do lead (não chama saveLead) e avança pro passo 2', async () => {
    mockGetLeadCheckout.mockResolvedValue({
      name: 'Erick',
      phone_masked: '+55 (51) 9****-0000',
      plan: { id: 2, name: 'Profissional', price: 19.9 }
    })
    mockCompleteLeadCheckout.mockResolvedValue({ action: 'payment_required', pending_id: 'abc' })

    const user = userEvent.setup()
    renderWithProviders(<PaymentForm plan={mockPlan} leadToken="lead-token-abc" />)

    await waitFor(() => {
      expect(screen.getByLabelText(/nome completo/i)).toHaveValue('Erick')
    })

    await user.type(screen.getByLabelText(/e-?mail/i), 'erick@teste.com')
    await user.type(screen.getByLabelText(/^senha/i), 'senha12345')
    await user.type(screen.getByLabelText(/cpf/i), '52998224725')

    await user.click(screen.getByRole('button', { name: /próximo/i }))

    await waitFor(() => {
      expect(mockCompleteLeadCheckout).toHaveBeenCalledWith('lead-token-abc', {
        name: 'Erick',
        email: 'erick@teste.com',
        password: 'senha12345',
        tax: '52998224725'
      })
    })

    expect(await screen.findByText(/como você prefere pagar/i)).toBeInTheDocument()
    expect(saveLeadMutate).not.toHaveBeenCalled()
    // O polling do PIX (pix-payment-step) lê o e-mail daqui — sem isso o
    // passo 2 no modo lead não sabe qual pagamento está aguardando.
    expect(sessionStorage.getItem('pending_checkout_email')).toBe('erick@teste.com')
  })

  it('erro 409 no complete mostra a mensagem do backend (não sempre "e-mail/CPF") e manda pro login', async () => {
    mockGetLeadCheckout.mockResolvedValue({
      name: 'Erick',
      phone_masked: '+55 (51) 9****-0000',
      plan: { id: 2, name: 'Profissional', price: 19.9 }
    })
    // phone_already_registered — distinto de email_ou_cpf_ja_cadastrado —
    // vem com "message" pronta do backend; o componente deve exibi-la, não
    // uma mensagem genérica de e-mail/CPF duplicado.
    mockCompleteLeadCheckout.mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 409,
        data: { error: 'phone_already_registered', message: 'Numero ja cadastrado. Faca login.' }
      }
    })

    const user = userEvent.setup()
    renderWithProviders(<PaymentForm plan={mockPlan} leadToken="lead-token-abc" />)

    await waitFor(() => {
      expect(screen.getByLabelText(/nome completo/i)).toHaveValue('Erick')
    })

    await user.type(screen.getByLabelText(/e-?mail/i), 'erick@teste.com')
    await user.type(screen.getByLabelText(/^senha/i), 'senha12345')
    await user.type(screen.getByLabelText(/cpf/i), '52998224725')
    await user.click(screen.getByRole('button', { name: /próximo/i }))

    await waitFor(() => {
      expect(toastInfo).toHaveBeenCalledWith('Numero ja cadastrado. Faca login.')
    })
    await waitFor(() => {
      expect(screen.getByTestId('location-probe')).toHaveTextContent('/login?from=%2Fcheckout%2F2')
    })
  })

  it('usuário autenticado com lead_token: não entra em modo lead (sem GET, telefone intocado)', async () => {
    mockUseUser.data = {
      user_name: 'Marcia',
      email: 'marcia@test.com',
      cellphone: '11999999999',
      tax: '39053344705',
      is_admin: false,
      plan: undefined
    }

    renderWithProviders(<PaymentForm plan={mockPlan} leadToken="lead-token-abc" />)

    // Auto-avança pro passo 2 via o efeito de currentUser — PersonalDataStep
    // nem chega a renderizar, então não há campo de telefone pra travar ou
    // vazar o phone_masked pro payload de pagamento anônimo.
    await waitFor(() => {
      expect(screen.queryByLabelText(/nome completo/i)).not.toBeInTheDocument()
    })

    expect(mockGetLeadCheckout).not.toHaveBeenCalled()
    expect(mockCompleteLeadCheckout).not.toHaveBeenCalled()
  })

  it('link expirado (404) cai no fluxo anônimo normal, com campos vazios e editáveis', async () => {
    mockGetLeadCheckout.mockRejectedValue(new Error('not found'))

    renderWithProviders(<PaymentForm plan={mockPlan} leadToken="lead-token-expirado" />)

    await waitFor(() => {
      expect(toastError).toHaveBeenCalled()
    })

    const nameInput = screen.getByLabelText(/nome completo/i)
    expect(nameInput).toHaveValue('')
    expect(nameInput).not.toBeDisabled()

    const phoneInput = screen.getByLabelText(/telefone/i)
    expect(phoneInput).toHaveValue('')
    expect(phoneInput).not.toBeDisabled()

    expect(screen.queryByText(/verificado via whatsapp/i)).not.toBeInTheDocument()
  })
})
