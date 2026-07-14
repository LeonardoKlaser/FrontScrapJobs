import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { Mock } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { SignupWizard } from './SignupWizard'
import { signupService } from '@/services/signupService'

// Steps stubbados: expõem botões que disparam os callbacks do wizard, isolando a
// lógica de tratamento de erro (C1, A3) sem react-hook-form/auto-submit.
vi.mock('./PhoneStep', () => ({
  PhoneStep: ({
    onSubmit,
    error
  }: {
    onSubmit: (n: string, p: string) => void
    error: string | null
  }) => (
    <div>
      <button onClick={() => onSubmit('Maria', '11999999999')}>do-phone</button>
      {error && <p data-testid="phone-error">{error}</p>}
    </div>
  )
}))
vi.mock('./VerifyCodeStep', () => ({
  VerifyCodeStep: ({
    onSubmit,
    error
  }: {
    onSubmit: (c: string) => void
    error: string | null
  }) => (
    <div>
      <button onClick={() => onSubmit('000000')}>do-verify</button>
      {error && <p data-testid="verify-error">{error}</p>}
    </div>
  )
}))
vi.mock('./InfoPaymentStep', () => ({
  InfoPaymentStep: ({ plan }: { plan: { id: number } }) => <p>payment-plan-{plan.id}</p>
}))

vi.mock('@/services/signupService', () => ({
  signupService: { init: vi.fn(), verifyPhone: vi.fn(), complete: vi.fn() }
}))

const navigateMock = vi.fn()
let searchParams = new URLSearchParams('plan=2')
vi.mock('react-router', () => ({
  useNavigate: () => navigateMock,
  useSearchParams: () => [searchParams, vi.fn()]
}))

vi.mock('@/hooks/usePlans', () => ({
  usePlans: () => ({
    data: [
      {
        id: 2,
        name: 'Profissional',
        price: 29.9,
        is_trial: false,
        features: [],
        max_sites: 5,
        max_ai_analyses: 10,
        max_pdf_extractions: 10,
        max_suggestion_applies: 10,
        max_pdf_generations: 10
      }
    ],
    isLoading: false
  })
}))

const toastInfo = vi.fn()
vi.mock('sonner', () => ({
  toast: { info: (...a: unknown[]) => toastInfo(...a), error: vi.fn() }
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, d?: string, o?: Record<string, unknown>) => {
      let s = typeof d === 'string' ? d : k
      if (o) Object.keys(o).forEach((key) => (s = s.replace(`{{${key}}}`, String(o[key]))))
      return s
    }
  })
}))

const initMock = signupService.init as Mock
const verifyMock = signupService.verifyPhone as Mock

beforeEach(() => {
  searchParams = new URLSearchParams('plan=2')
  navigateMock.mockReset()
  toastInfo.mockReset()
  initMock.mockReset()
  verifyMock.mockReset()
})
afterEach(cleanup)

describe('SignupWizard', () => {
  // C1: código errado chega como rejeição 400 — wizard deve mostrar attempts_remaining.
  it('mostra tentativas restantes quando o código é inválido (400 invalid_code)', async () => {
    initMock.mockResolvedValue({
      signup_session_id: 's1',
      phone_masked: '(**) *****-9999'
    })
    verifyMock.mockRejectedValue({
      response: { data: { error: 'invalid_code', attempts_remaining: 3 } }
    })

    render(<SignupWizard />)
    fireEvent.click(screen.getByText('do-phone'))
    fireEvent.click(await screen.findByText('do-verify'))

    const err = await screen.findByTestId('verify-error')
    expect(err).toHaveTextContent('3')
    expect(err).toHaveTextContent(/tentativas restantes/)
  })

  it('carrega a etapa de pagamento apenas para o plano comercial selecionado', async () => {
    initMock.mockResolvedValue({ signup_session_id: 's1', phone_masked: 'x' })
    verifyMock.mockResolvedValue({ verified: true })

    render(<SignupWizard />)
    fireEvent.click(screen.getByText('do-phone'))
    fireEvent.click(await screen.findByText('do-verify'))

    expect(await screen.findByText('payment-plan-2')).toBeInTheDocument()
    expect(initMock).toHaveBeenCalledWith(expect.objectContaining({ plan_id: 2 }))
  })

  it('bloqueia cadastro direto sem plano e direciona para a tabela de preços', () => {
    searchParams = new URLSearchParams('')

    render(<SignupWizard />)
    expect(screen.queryByText('do-phone')).not.toBeInTheDocument()
    fireEvent.click(screen.getByText('Ver planos'))

    expect(navigateMock).toHaveBeenCalledWith('/#pricing')
  })

  // A3: número já cadastrado (409) no init → toast + redireciona pro login (não retry).
  it('redireciona pro login quando o telefone já está cadastrado (409)', async () => {
    initMock.mockRejectedValue({
      response: {
        data: {
          error: 'phone_already_registered',
          message: 'Número já cadastrado.'
        }
      }
    })

    render(<SignupWizard />)
    fireEvent.click(screen.getByText('do-phone'))

    await waitFor(() =>
      expect(navigateMock).toHaveBeenCalledWith(expect.stringContaining('/login'))
    )
    expect(toastInfo).toHaveBeenCalled()
  })
})
