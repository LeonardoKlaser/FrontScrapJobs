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

function renderStep(formData: Partial<PersonalFormData> = {}, isAuthenticated = false) {
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
        />
      </MemoryRouter>
    </QueryClientProvider>
  )
  return { setFormData, onNext }
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
    const { onNext } = renderStep({}, false)

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
    const { onNext } = renderStep({}, true)

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
})
