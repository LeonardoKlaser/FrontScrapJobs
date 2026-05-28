import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { WhatsAppSection } from '../whatsapp-section'
import type { User } from '@/models/user'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

const setChannelMutate = vi.fn()
vi.mock('@/hooks/useWhatsApp', () => ({
  useWhatsApp: () => ({
    requestOptIn: { mutate: vi.fn(), isPending: false },
    confirmOptIn: { mutate: vi.fn(), isPending: false },
    setChannel: { mutate: setChannelMutate, isPending: false }
  })
}))

vi.mock('@/components/whatsapp/optin-modal', () => ({
  OptInModal: () => null
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() }
}))

function baseUser(overrides: Partial<User> = {}): User {
  return {
    user_name: 'Fulano',
    email: 'a@b.com',
    is_admin: false,
    plan: undefined,
    preferred_channel: 'email',
    whatsapp_opted_in: false,
    ...overrides
  }
}

describe('WhatsAppSection', () => {
  beforeEach(() => {
    setChannelMutate.mockReset()
  })
  afterEach(cleanup)

  it('desabilita a opção WhatsApp quando nao fez opt-in', () => {
    render(<WhatsAppSection user={baseUser({ whatsapp_opted_in: false })} />)
    const whatsappRadio = screen.getByRole('radio', { name: 'section.channelWhatsApp' })
    expect(whatsappRadio).toBeDisabled()
  })

  it('mostra hint de opt-in quando nao fez opt-in', () => {
    render(<WhatsAppSection user={baseUser({ whatsapp_opted_in: false })} />)
    expect(screen.getByText('section.notOptedInHint')).toBeInTheDocument()
  })

  it('habilita WhatsApp e chama setChannel ao trocar canal quando opted-in', () => {
    render(
      <WhatsAppSection user={baseUser({ whatsapp_opted_in: true, preferred_channel: 'email' })} />
    )
    const whatsappRadio = screen.getByRole('radio', { name: 'section.channelWhatsApp' })
    expect(whatsappRadio).not.toBeDisabled()
    fireEvent.click(whatsappRadio)
    expect(setChannelMutate).toHaveBeenCalledWith('whatsapp', expect.anything())
  })

  it('nao chama setChannel ao clicar no canal ja ativo', () => {
    render(
      <WhatsAppSection user={baseUser({ whatsapp_opted_in: true, preferred_channel: 'email' })} />
    )
    fireEvent.click(screen.getByRole('radio', { name: 'section.channelEmail' }))
    expect(setChannelMutate).not.toHaveBeenCalled()
  })
})
