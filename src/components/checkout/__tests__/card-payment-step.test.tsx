import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// Inicializa i18n (registra resources pt-BR/en-US) — sem isso, useTranslation
// retorna a key crua, e os getByLabelText falham.
import '@/i18n'

const mockValidate = vi.fn()

vi.mock('@/hooks/useValidateCheckout', () => ({
  useValidateCheckout: () => ({ mutateAsync: mockValidate })
}))

import { CardPaymentStep } from '../card-payment-step'
import type { CardData } from '@/services/paymentService'
import type { DocumentData } from '../card-payment-step'

interface BaseProps {
  isLoading: boolean
  error: string
  userName: string
  userEmail: string
  userTax?: string
  isAuthenticated: boolean
  planId: number
  onSubmit: (cardData: CardData, docData: DocumentData) => void
}

const makeBaseProps = (): BaseProps => ({
  isLoading: false,
  error: '',
  userName: 'Fulano de Tal',
  userEmail: 'fulano@test.com',
  isAuthenticated: false,
  planId: 2,
  onSubmit: vi.fn()
})

function renderCard(overrides: Partial<BaseProps> = {}) {
  const props = { ...makeBaseProps(), ...overrides }
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <CardPaymentStep {...props} />
      </MemoryRouter>
    </QueryClientProvider>
  )
  return props
}

describe('CardPaymentStep', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockValidate.mockResolvedValue({ email_exists: false, tax_exists: false })
  })

  it('renderiza input de CPF quando userTax é vazio', () => {
    renderCard({ userTax: '' })
    expect(screen.getByLabelText(/CPF/i)).toBeInTheDocument()
  })

  it('omite input de CPF quando userTax populado', () => {
    renderCard({ userTax: '52998224725', isAuthenticated: true })
    // Não deve ter input de CPF — o campo só aparece quando userTax é vazio
    expect(screen.queryByLabelText(/CPF/i)).not.toBeInTheDocument()
  })

  it('submete com cpfCnpj=userTax quando populado', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderCard({ userTax: '52998224725', isAuthenticated: true, onSubmit })

    // holderName já vem preenchido pelo userName (UPPERCASE)
    const cardNumber = screen.getByLabelText(/número do cartão/i)
    const expDate = screen.getByLabelText(/validade/i)
    const cvv = screen.getByLabelText(/cvv/i)

    await user.type(cardNumber, '4111111111111111')
    await user.type(expDate, '1230')
    await user.type(cvv, '123')

    const submit = screen.getByRole('button', { name: /finalizar/i })
    await user.click(submit)

    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    const docArg = vi.mocked(onSubmit).mock.calls[0][1]
    expect(docArg.cpfCnpj).toBe('52998224725')
  })

  it('bloqueia submit quando anônimo + cpf_exists', async () => {
    mockValidate.mockResolvedValue({ email_exists: false, tax_exists: true })
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderCard({ userTax: '', isAuthenticated: false, onSubmit })

    const cpfInput = screen.getByLabelText(/CPF/i)
    await user.type(cpfInput, '52998224725')
    // Tab dispara o blur que aciona o validate (debounce 300ms)
    await user.tab()

    // Aguarda o validate ser chamado e o estado cpfExistsOnServer ser setado
    await waitFor(() => {
      expect(mockValidate).toHaveBeenCalled()
    })

    // Aguarda a mensagem de bloqueio renderizar (link "Faça login")
    await waitFor(() => {
      const link = screen.getByRole('link', { name: /faça login|sign in/i })
      expect(link.getAttribute('href')).toContain('/login')
    })

    // Preenche o resto do form (mesmo bloqueado, queremos garantir que o
    // bloqueio é por causa do CPF e não de outro campo inválido)
    const cardNumber = screen.getByLabelText(/número do cartão/i)
    const expDate = screen.getByLabelText(/validade/i)
    const cvv = screen.getByLabelText(/cvv/i)

    await user.type(cardNumber, '4111111111111111')
    await user.type(expDate, '1230')
    await user.type(cvv, '123')

    const submit = screen.getByRole('button', { name: /finalizar/i })
    await user.click(submit)

    // validateForm retorna false → onSubmit NÃO deve ser chamado
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
