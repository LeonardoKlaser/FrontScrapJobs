import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CtaFinalSection } from '@/components/landingPage/cta-final-section'
import * as analytics from '@/lib/analytics'

vi.mock('qrcode', () => ({
  default: { toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,AAAA') }
}))

beforeEach(() => {
  vi.restoreAllMocks()
  // buildWaLink('web') é avaliado no JSX do WhatsAppCtaButton mesmo com o
  // Dialog fechado — sem stub, o console.warn de env ausente dispara em
  // todo teste que renderiza o CTA (ver landing-wa.test.ts pro caso do warn
  // em si).
  vi.stubEnv('VITE_NORTE_WA_NUMBER', '5551999990000')
})

afterEach(() => vi.unstubAllEnvs())

describe('CtaFinalSection', () => {
  it('renders the final CTA copy', () => {
    render(<CtaFinalSection />)
    expect(screen.getByText('Pare de procurar vaga todos os dias.')).toBeInTheDocument()
    expect(
      screen.getByText('Comece com 3 perguntas e veja o resultado antes de escolher um plano.')
    ).toBeInTheDocument()
    expect(screen.getByText('Receber vagas no WhatsApp')).toBeInTheDocument()
  })

  it('tracks section:final and opens the WhatsApp modal on click', () => {
    const track = vi.spyOn(analytics, 'trackLanding').mockImplementation(() => {})
    render(<CtaFinalSection />)
    fireEvent.click(screen.getByRole('button', { name: /Receber vagas no WhatsApp/ }))
    expect(track).toHaveBeenCalledWith('lp_whatsapp_click', {
      section: 'final',
      device: 'desktop',
      method: 'modal'
    })
    expect(screen.getByText('Fale com o Norte no seu WhatsApp')).toBeInTheDocument()
  })
})
