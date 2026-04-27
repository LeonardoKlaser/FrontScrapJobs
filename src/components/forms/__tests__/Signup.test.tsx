import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignupForm } from '@/components/forms/Signup'

const mockSignup = vi.fn()
const mockUseAuth = {
  signup: mockSignup,
  loading: false,
  error: null as string | null
}

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    // Retorna o fallback (segundo arg) — facilita assertions sem montar i18n
    t: (_key: string, fallback?: string) => fallback ?? _key
  })
}))

describe('SignupForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.signup = mockSignup
    mockUseAuth.loading = false
    mockUseAuth.error = null
  })

  it('renders email, password and confirmPassword fields', () => {
    render(<SignupForm />)
    expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Mínimo 8 caracteres')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Repita a senha')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Criar conta grátis/i })).toBeInTheDocument()
  })

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup()
    render(<SignupForm />)

    await user.type(screen.getByPlaceholderText('seu@email.com'), 'not-an-email')
    await user.type(screen.getByPlaceholderText('Mínimo 8 caracteres'), '12345678')
    fireEvent.submit(screen.getByRole('button', { name: /Criar conta grátis/i }))

    await waitFor(() => {
      expect(screen.getByText(/E-mail inválido/i)).toBeInTheDocument()
    })
    expect(mockSignup).not.toHaveBeenCalled()
  })

  it('shows validation error for short password', async () => {
    const user = userEvent.setup()
    render(<SignupForm />)

    await user.type(screen.getByPlaceholderText('seu@email.com'), 'a@b.com')
    await user.type(screen.getByPlaceholderText('Mínimo 8 caracteres'), 'short')
    fireEvent.submit(screen.getByRole('button', { name: /Criar conta grátis/i }))

    await waitFor(() => {
      expect(screen.getByText(/Mínimo 8 caracteres/i)).toBeInTheDocument()
    })
    expect(mockSignup).not.toHaveBeenCalled()
  })

  it('shows validation error when passwords do not match', async () => {
    const user = userEvent.setup()
    render(<SignupForm />)

    await user.type(screen.getByPlaceholderText('seu@email.com'), 'a@b.com')
    await user.type(screen.getByPlaceholderText('Mínimo 8 caracteres'), '12345678')
    await user.type(screen.getByPlaceholderText('Repita a senha'), 'different')
    fireEvent.submit(screen.getByRole('button', { name: /Criar conta grátis/i }))

    await waitFor(() => {
      expect(screen.getByText(/As senhas não coincidem/i)).toBeInTheDocument()
    })
    expect(mockSignup).not.toHaveBeenCalled()
  })

  it('calls signup with form data when valid', async () => {
    const user = userEvent.setup()
    render(<SignupForm />)

    await user.type(screen.getByPlaceholderText('seu@email.com'), 'valid@test.com')
    await user.type(screen.getByPlaceholderText('Mínimo 8 caracteres'), '12345678')
    await user.type(screen.getByPlaceholderText('Repita a senha'), '12345678')
    fireEvent.submit(screen.getByRole('button', { name: /Criar conta grátis/i }))

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith({
        email: 'valid@test.com',
        password: '12345678',
        confirmPassword: '12345678'
      })
    })
  })

  it('shows API error message when present', () => {
    mockUseAuth.error = 'Este e-mail já está cadastrado.'
    render(<SignupForm />)
    expect(screen.getByText('Este e-mail já está cadastrado.')).toBeInTheDocument()
  })

  it('shows spinner when loading', () => {
    mockUseAuth.loading = true
    const { container } = render(<SignupForm />)
    // Loader2Icon renderiza um SVG animado em vez do CTA text.
    // O submit button e o ultimo (button[type=submit]); os outros sao toggles do password.
    const submitButton = container.querySelector('button[type="submit"]')
    expect(submitButton).toBeDisabled()
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })
})
