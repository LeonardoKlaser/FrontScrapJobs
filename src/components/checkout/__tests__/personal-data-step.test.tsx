import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
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

function renderStep(formData: Partial<PersonalFormData> = {}) {
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
      const link = screen.getByRole('link', { name: /faça login|sign in/i })
      expect(link).toHaveAttribute('href', expect.stringContaining('from=%2Fcheckout%2F2'))
    })
  })
})
