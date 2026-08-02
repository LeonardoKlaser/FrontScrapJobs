import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WhatsAppCtaButton } from '@/components/landingPage/whatsapp-cta-button'
import * as analytics from '@/lib/analytics'

vi.mock('qrcode', () => ({
  default: { toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,AAAA') }
}))

beforeEach(() => {
  vi.restoreAllMocks()
  vi.stubEnv('VITE_NORTE_WA_NUMBER', '5551999990000')
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('WhatsAppCtaButton', () => {
  it('desktop: clique abre o modal com QR e hint', async () => {
    const track = vi.spyOn(analytics, 'trackLanding').mockImplementation(() => {})
    render(<WhatsAppCtaButton section="hero">Começar grátis</WhatsAppCtaButton>)

    fireEvent.click(screen.getByRole('button', { name: 'Começar grátis' }))

    expect(track).toHaveBeenCalledWith('lp_whatsapp_click', {
      section: 'hero',
      device: 'desktop',
      method: 'modal'
    })
    expect(screen.getByText('Fale com o Norte no seu WhatsApp')).toBeInTheDocument()
    expect(await screen.findByAltText('QR code para abrir o WhatsApp do Norte')).toHaveAttribute(
      'src',
      'data:image/png;base64,AAAA'
    )
    expect(screen.getByText(/Aponte a câmera do celular/)).toBeInTheDocument()
  })

  it('mobile: navega pro wa.me direto (um tick depois) e nao abre o modal', () => {
    vi.useFakeTimers()
    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)' })
    const originalLocation = window.location
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
      configurable: true
    })
    const track = vi.spyOn(analytics, 'trackLanding').mockImplementation(() => {})

    render(<WhatsAppCtaButton section="hero">Começar grátis</WhatsAppCtaButton>)
    fireEvent.click(screen.getByRole('button', { name: 'Começar grátis' }))

    expect(track).toHaveBeenCalledWith('lp_whatsapp_click', {
      section: 'hero',
      device: 'mobile',
      method: 'direct'
    })
    // A navegação é adiada um tick (setTimeout 0) pra não abortar o beacon
    // assíncrono do GTM dentro do dataLayer.push síncrono acima — por isso
    // ainda não aconteceu na mesma volta do evento de clique.
    expect(window.location.href).toBe('')

    vi.runAllTimers()

    expect(window.location.href).toContain('https://wa.me/5551999990000?text=')
    expect(decodeURIComponent(window.location.href)).toMatch(/#lp$/)
    expect(screen.queryByText('Fale com o Norte no seu WhatsApp')).not.toBeInTheDocument()

    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true
    })
  })

  it('clique no link "Ou abrir no WhatsApp Web" dispara evento method: web', async () => {
    const track = vi.spyOn(analytics, 'trackLanding').mockImplementation(() => {})
    render(<WhatsAppCtaButton section="final">Começar grátis</WhatsAppCtaButton>)

    fireEvent.click(screen.getByRole('button', { name: 'Começar grátis' }))
    const webLink = await screen.findByRole('link', { name: 'Ou abrir no WhatsApp Web' })
    fireEvent.click(webLink)

    expect(track).toHaveBeenLastCalledWith('lp_whatsapp_click', {
      section: 'final',
      device: 'desktop',
      method: 'web'
    })
  })
})
