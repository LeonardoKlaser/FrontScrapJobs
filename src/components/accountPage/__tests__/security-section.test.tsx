import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { SecuritySection } from '@/components/accountPage/security-section'

const mocks = vi.hoisted(() => ({
  changePasswordMutate: vi.fn(),
  logout: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn()
}))

vi.mock('@/hooks/useChangePassword', () => ({
  useChangePassword: () => ({
    mutate: mocks.changePasswordMutate
  })
}))

vi.mock('@/services/authService', () => ({
  authService: {
    logout: mocks.logout,
    deleteAccount: vi.fn()
  }
}))

vi.mock('sonner', () => ({
  toast: {
    success: mocks.toastSuccess,
    error: mocks.toastError
  }
}))

describe('SecuritySection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.logout.mockResolvedValue(undefined)
    mocks.changePasswordMutate.mockImplementation(
      (_input: unknown, options: { onSuccess: (result: { session_revoked: boolean }) => void }) => {
        options.onSuccess({ session_revoked: true })
      }
    )
  })

  it('clears local auth state and redirects when password change revokes the session', async () => {
    const queryClient = new QueryClient()
    queryClient.setQueryData(['user'], { id: 99 })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/account']}>
          <Routes>
            <Route path="/account" element={<SecuritySection />} />
            <Route path="/login" element={<p>login destination</p>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    await userEvent.type(screen.getByLabelText(/senha atual/i), 'old-password')
    await userEvent.type(screen.getByLabelText(/^nova senha$/i), 'new-password')
    await userEvent.type(screen.getByLabelText(/confirmar nova senha/i), 'new-password')
    await userEvent.click(screen.getByRole('button', { name: /alterar senha/i }))

    await waitFor(() => expect(mocks.logout).toHaveBeenCalledTimes(1))
    expect(queryClient.getQueryData(['user'])).toBeUndefined()
    expect(screen.getByText('login destination')).toBeInTheDocument()
    expect(mocks.toastSuccess).not.toHaveBeenCalled()
  })
})
