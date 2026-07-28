import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ProfileSection } from '../profile-section'
import type { User } from '@/models/user'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() }
}))

const mockMutate = vi.fn()
vi.mock('@/hooks/useUpdateProfile', () => ({
  useUpdateProfile: () => ({ mutate: mockMutate })
}))
vi.mock('@/hooks/useButtonState', () => ({
  useButtonState: () => ({
    buttonState: 'idle',
    setLoading: vi.fn(),
    setSuccess: vi.fn(),
    setError: vi.fn(),
    isDisabled: false
  })
}))

const user = {
  user_name: 'Erick Schaedler',
  email: 'erick@example.test',
  cellphone: '',
  tax: '04873364027'
} as unknown as User

describe('ProfileSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exibe o CPF vindo da API (dígitos crus) com máscara', () => {
    render(<ProfileSection user={user} />)
    expect(screen.getByLabelText('profile.cpfLabel')).toHaveValue('048.733.640-27')
  })

  it('mascara enquanto digita mas salva só os dígitos', () => {
    render(<ProfileSection user={user} />)
    const input = screen.getByLabelText('profile.cpfLabel')

    fireEvent.change(input, { target: { value: '123.456.789-09' } })
    expect(input).toHaveValue('123.456.789-09')

    fireEvent.click(screen.getByRole('button', { name: 'profile.saveButton' }))
    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({ tax: '12345678909' }),
      expect.anything()
    )
  })
})
