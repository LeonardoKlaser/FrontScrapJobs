import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// Inicializa i18n (registra resources pt-BR/en-US) — sem isso, useTranslation
// retorna a key crua, e os getByLabelText/getByRole falham.
import '@/i18n'

const mockValidate = vi.fn()

vi.mock('@/hooks/useValidateCheckout', () => ({
  useValidateCheckout: () => ({ mutateAsync: mockValidate })
}))

import { PersonalDataStep, type PersonalFormData } from '../personal-data-step'
import type { Plan } from '@/models/plan'

const mockPlan: Plan = {
  id: 2,
  name: 'Pro',
  price: 29.9,
  max_sites: 3,
  max_ai_analyses: 10,
  max_pdf_extractions: 10,
  max_suggestion_applies: 10,
  max_pdf_generations: 10,
  is_trial: false,
  features: [],
  quarterly_price_cents: 7490
}

interface RenderOptions {
  formData?: Partial<PersonalFormData>
  isAuthenticated?: boolean
  paymentMethod?: 'pix' | 'card'
  pixMonths?: 1 | 3
}

function renderStep(opts: RenderOptions = {}) {
  const { formData = {}, isAuthenticated = false, paymentMethod = 'card', pixMonths = 1 } = opts
  const data: PersonalFormData = {
    name: 'Marcia',
    email: 'marcia@test.com',
    password: 'senha12345',
    phone: '(11) 99999-9999',
    ...formData
  }
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const setFormData = vi.fn()
  const onNext = vi.fn()
  const onPaymentMethodChange = vi.fn()
  const onPixMonthsChange = vi.fn()
  render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <PersonalDataStep
          formData={data}
          setFormData={setFormData}
          isLoading={false}
          planId={2}
          isAuthenticated={isAuthenticated}
          onNext={onNext}
          paymentMethod={paymentMethod}
          onPaymentMethodChange={onPaymentMethodChange}
          pixMonths={pixMonths}
          onPixMonthsChange={onPixMonthsChange}
          plan={mockPlan}
        />
      </MemoryRouter>
    </QueryClientProvider>
  )
  return { setFormData, onNext, onPaymentMethodChange, onPixMonthsChange }
}

describe('PersonalDataStep', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does NOT disable Next button when email_exists=true', async () => {
    mockValidate.mockResolvedValue({ email_exists: true, tax_exists: false })

    renderStep()

    const emailInput = screen.getByLabelText(/e-?mail/i)
    fireEvent.blur(emailInput)

    // Aguarda a mensagem informativa aparecer (debounce de 300ms + resolucao do mock)
    await waitFor(() => {
      expect(screen.getByText(/já tem conta/i)).toBeInTheDocument()
    })

    const nextButton = screen.getByRole('button', { name: /próximo|next/i })
    expect(nextButton).not.toBeDisabled()
  })

  it('login link includes from=/checkout/<planId>', async () => {
    mockValidate.mockResolvedValue({ email_exists: true, tax_exists: false })

    renderStep()
    fireEvent.blur(screen.getByLabelText(/e-?mail/i))

    await waitFor(() => {
      const link = screen.getByRole('link', {
        name: /fazer login pra continuar|log in to continue/i
      })
      expect(link).toHaveAttribute('href', expect.stringContaining('from=%2Fcheckout%2F2'))
    })
  })

  it('bloqueia onNext quando anônimo + email já cadastrado', async () => {
    mockValidate.mockResolvedValue({ email_exists: true, tax_exists: false })

    const user = userEvent.setup()
    const { onNext } = renderStep({ isAuthenticated: false })

    const emailInput = screen.getByLabelText(/e-?mail/i)
    // Dispara blur via tab pra rodar o debounce + validate
    emailInput.focus()
    await user.tab()

    // Aguarda o estado emailExistsOnServer ser setado (mensagem aparece)
    await waitFor(() => {
      expect(screen.getByText(/já tem conta/i)).toBeInTheDocument()
    })

    // Clica em Próximo — não deve chamar onNext porque o derived emailBlocked
    // (anônimo + emailExistsOnServer) bloqueia o handleNext
    const nextButton = screen.getByRole('button', { name: /próximo|next/i })
    await user.click(nextButton)

    expect(onNext).not.toHaveBeenCalled()

    // Link de login deve estar visível com href apontando pra /login
    const link = screen.getByRole('link', {
      name: /fazer login pra continuar|log in to continue/i
    })
    expect(link.getAttribute('href')).toContain('/login')
  })

  it('NÃO bloqueia onNext quando autenticado + email já cadastrado', async () => {
    mockValidate.mockResolvedValue({ email_exists: true, tax_exists: false })

    const user = userEvent.setup()
    const { onNext } = renderStep({ isAuthenticated: true })

    const emailInput = screen.getByLabelText(/e-?mail/i)
    emailInput.focus()
    await user.tab()

    // Espera o validate resolver pra garantir que o estado foi atualizado
    await waitFor(() => {
      expect(mockValidate).toHaveBeenCalled()
    })

    const nextButton = screen.getByRole('button', { name: /próximo|next/i })
    await user.click(nextButton)

    // User autenticado com o próprio email não é bloqueado
    expect(onNext).toHaveBeenCalled()
  })

  it('NAO renderiza campo password quando isAuthenticated=true', () => {
    renderStep({ isAuthenticated: true })
    // Verifica via id do input — Label /senha|password/i tambem matchearia o
    // aria-label do eye toggle button.
    expect(document.getElementById('password')).toBeNull()
  })

  it('renderiza campo password quando isAuthenticated=false', () => {
    renderStep({ isAuthenticated: false })
    expect(document.getElementById('password')).toBeInTheDocument()
  })
})

describe('PersonalDataStep — payment method selection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockValidate.mockResolvedValue({ email_exists: false, tax_exists: false })
  })

  it('renderiza ambos PIX e Cartão como opções', () => {
    renderStep()
    // Strict: PIX option button must contain text "PIX" (matches existing i18n)
    expect(screen.getByText(/^PIX$/)).toBeInTheDocument()
    expect(screen.getByText(/Cartão de Crédito|Credit Card/)).toBeInTheDocument()
  })

  it('chama onPaymentMethodChange ao clicar em PIX', async () => {
    const user = userEvent.setup()
    const { onPaymentMethodChange } = renderStep({ paymentMethod: 'card' })

    await user.click(screen.getByText(/^PIX$/))
    expect(onPaymentMethodChange).toHaveBeenCalledWith('pix')
  })

  it('mostra seletor de período quando PIX é selecionado e plano tem trimestral', () => {
    renderStep({ paymentMethod: 'pix' })
    expect(screen.getByText(/Mensal/)).toBeInTheDocument()
    expect(screen.getByText(/Trimestral/)).toBeInTheDocument()
  })

  it('esconde seletor de período quando Cartão é selecionado', () => {
    renderStep({ paymentMethod: 'card' })
    expect(screen.queryByText(/Trimestral/)).not.toBeInTheDocument()
  })

  it('mostra "Gerar QR Code PIX" como label do botão quando PIX selecionado', () => {
    renderStep({ paymentMethod: 'pix' })
    expect(
      screen.getByRole('button', { name: /Gerar QR Code PIX|Generate PIX QR Code/ })
    ).toBeInTheDocument()
  })

  it('mostra "Próximo" como label quando Cartão selecionado', () => {
    renderStep({ paymentMethod: 'card' })
    expect(screen.getByRole('button', { name: /Próximo|Next/ })).toBeInTheDocument()
  })

  it('mostra campo CPF quando PIX selecionado', () => {
    renderStep({ paymentMethod: 'pix' })
    // Label CPF/CNPJ existe no fluxo PIX
    expect(screen.getByLabelText(/CPF/)).toBeInTheDocument()
  })

  it('NÃO mostra campo CPF quando Cartão selecionado', () => {
    renderStep({ paymentMethod: 'card' })
    expect(screen.queryByLabelText(/CPF/)).not.toBeInTheDocument()
  })

  it('bloqueia onNext em PIX se CPF inválido', async () => {
    const user = userEvent.setup()
    const { onNext } = renderStep({
      paymentMethod: 'pix',
      formData: { tax: '123' } // CPF muito curto
    })

    const submitBtn = screen.getByRole('button', { name: /Gerar QR Code PIX|Generate PIX QR Code/ })
    await user.click(submitBtn)

    expect(onNext).not.toHaveBeenCalled()
    expect(screen.getByText(/CPF inválido|Invalid Tax ID/)).toBeInTheDocument()
  })

  it('chama onNext em PIX se CPF válido (11 dígitos)', async () => {
    const user = userEvent.setup()
    const { onNext } = renderStep({
      paymentMethod: 'pix',
      formData: { tax: '529.982.247-25' } // CPF valido mascarado
    })

    const submitBtn = screen.getByRole('button', { name: /Gerar QR Code PIX|Generate PIX QR Code/ })
    await user.click(submitBtn)

    expect(onNext).toHaveBeenCalled()
  })

  it('chama onPixMonthsChange ao clicar em Trimestral', async () => {
    const user = userEvent.setup()
    const { onPixMonthsChange } = renderStep({ paymentMethod: 'pix', pixMonths: 1 })

    await user.click(screen.getByText(/Trimestral/))
    expect(onPixMonthsChange).toHaveBeenCalledWith(3)
  })
})
