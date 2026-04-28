import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SignupForm } from '@/components/forms/Signup'
import { MemoryRouter } from 'react-router'

const mockSignup = vi.fn()
const mockUseAuth = {
  signup: mockSignup,
  loading: false,
  error: null as string | null
}

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth
}))

const validateMock = vi.fn().mockResolvedValue({ email_exists: false, tax_exists: false })
vi.mock('@/hooks/useValidateCheckout', () => ({
  useValidateCheckout: () => ({ mutateAsync: validateMock })
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key
  }),
  Trans: ({ defaults }: { defaults: string }) => <>{defaults}</>
}))

const renderForm = () =>
  render(
    <MemoryRouter>
      <SignupForm />
    </MemoryRouter>
  )

describe('SignupForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.signup = mockSignup
    mockUseAuth.loading = false
    mockUseAuth.error = null
    validateMock.mockResolvedValue({ email_exists: false, tax_exists: false })
  })

  it('renderiza 5 campos: nome, email, telefone, CPF, senha', () => {
    renderForm()
    expect(screen.getByLabelText('Nome completo')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument()
    expect(screen.getByLabelText('Celular')).toBeInTheDocument()
    expect(screen.getByLabelText('CPF')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Mínimo 8 caracteres')).toBeInTheDocument()
    expect(screen.queryByPlaceholderText('Repita a senha')).not.toBeInTheDocument()
  })

  it('chama signup com payload completo no submit', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.type(screen.getByLabelText('Nome completo'), 'Fulano')
    await user.type(screen.getByPlaceholderText('seu@email.com'), 'a@b.com')
    await user.type(screen.getByLabelText('Celular'), '11912345678')
    await user.type(screen.getByLabelText('CPF'), '52998224725')
    await user.type(screen.getByPlaceholderText('Mínimo 8 caracteres'), '12345678')

    await user.click(screen.getByRole('button', { name: /Criar conta grátis/i }))

    await waitFor(() =>
      expect(mockSignup).toHaveBeenCalledWith({
        name: 'Fulano',
        email: 'a@b.com',
        phone: '(11) 91234-5678',
        tax: '529.982.247-25',
        password: '12345678'
      })
    )
  })

  it('bloqueia submit quando email_exists = true', async () => {
    validateMock.mockResolvedValue({ email_exists: true, tax_exists: false })
    const user = userEvent.setup()
    renderForm()

    await user.type(screen.getByPlaceholderText('seu@email.com'), 'taken@b.com')
    await user.tab()

    await waitFor(() => {
      expect(screen.getByText(/Este e-mail já tem conta/)).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /Criar conta grátis/i })).toBeDisabled()
  })

  it('bloqueia submit quando tax_exists = true', async () => {
    validateMock.mockResolvedValue({ email_exists: false, tax_exists: true })
    const user = userEvent.setup()
    renderForm()

    await user.type(screen.getByLabelText('CPF'), '52998224725')
    await user.tab()

    await waitFor(() => {
      expect(screen.getByText(/Este CPF já tem conta/)).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /Criar conta grátis/i })).toBeDisabled()
  })

  it('mostra erro de validação pra CPF inválido', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.type(screen.getByLabelText('CPF'), '11111111111')
    await user.tab()

    await waitFor(() => {
      expect(screen.getByText(/CPF inválido/i)).toBeInTheDocument()
    })
  })

  it('mostra erro de validação pra celular inválido', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.type(screen.getByLabelText('Celular'), '1112345678')
    await user.tab()

    await waitFor(() => {
      expect(screen.getByText(/Celular inválido/i)).toBeInTheDocument()
    })
  })

  it('exibe erro do useAuth', () => {
    mockUseAuth.error = 'Erro do servidor'
    renderForm()
    expect(screen.getByText('Erro do servidor')).toBeInTheDocument()
  })
})
