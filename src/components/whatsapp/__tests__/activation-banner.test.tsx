import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { ActivationBanner } from '../activation-banner'
import type { User } from '@/models/user'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

const mockUseUser = vi.fn()
vi.mock('@/hooks/useUser', () => ({
  useUser: () => mockUseUser()
}))

// O modal é testado à parte; aqui mockamos pra isolar a lógica de exibição do
// banner (e evitar dependências de router/query no render).
vi.mock('../optin-modal', () => ({
  OptInModal: () => null
}))

function userWith(optedIn: boolean, enabled = true): User {
  return {
    user_name: 'Fulano',
    email: 'a@b.com',
    is_admin: false,
    plan: undefined,
    whatsapp_opted_in: optedIn,
    whatsapp_enabled: enabled
  }
}

describe('ActivationBanner', () => {
  beforeEach(() => {
    localStorage.clear()
    mockUseUser.mockReset()
  })
  afterEach(cleanup)

  it('renderiza quando whatsapp_opted_in é false', () => {
    mockUseUser.mockReturnValue({ data: userWith(false) })
    render(<ActivationBanner />)
    expect(screen.getByText('banner.title')).toBeInTheDocument()
    expect(screen.getByText('banner.cta')).toBeInTheDocument()
  })

  it('fica escondido quando fora do beta (whatsapp_enabled false)', () => {
    mockUseUser.mockReturnValue({ data: userWith(false, false) })
    const { container } = render(<ActivationBanner />)
    expect(container).toBeEmptyDOMElement()
  })

  it('fica escondido quando ja fez opt-in', () => {
    mockUseUser.mockReturnValue({ data: userWith(true) })
    const { container } = render(<ActivationBanner />)
    expect(container).toBeEmptyDOMElement()
  })

  it('fica escondido quando nao ha user', () => {
    mockUseUser.mockReturnValue({ data: undefined })
    const { container } = render(<ActivationBanner />)
    expect(container).toBeEmptyDOMElement()
  })

  it('fica escondido quando dispensado previamente (localStorage)', () => {
    localStorage.setItem('sj_whatsapp_banner_dismissed_v1', '1')
    mockUseUser.mockReturnValue({ data: userWith(false) })
    const { container } = render(<ActivationBanner />)
    expect(container).toBeEmptyDOMElement()
  })
})
