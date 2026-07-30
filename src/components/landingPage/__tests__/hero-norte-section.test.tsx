import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { HeroNorteSection } from '@/components/landingPage/hero-norte-section'
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

function renderHero() {
  return render(
    <MemoryRouter>
      <HeroNorteSection />
    </MemoryRouter>
  )
}

describe('HeroNorteSection', () => {
  it('renders the Norte headline and the chat conversation', () => {
    renderHero()
    expect(screen.getByText(/No seu WhatsApp/)).toBeInTheDocument()
    expect(screen.getByText('online')).toBeInTheDocument()
    expect(screen.getByText(/92% match/)).toBeInTheDocument()
  })

  it('tracks section:hero and opens the WhatsApp modal on CTA click', () => {
    const track = vi.spyOn(analytics, 'trackLanding').mockImplementation(() => {})
    renderHero()
    fireEvent.click(screen.getByRole('button', { name: /Começar grátis/ }))
    expect(track).toHaveBeenCalledWith('lp_whatsapp_click', {
      section: 'hero',
      device: 'desktop',
      method: 'modal'
    })
    expect(screen.getByText('Fale com o Norte no seu WhatsApp')).toBeInTheDocument()
  })

  it('renders the area chips as decorative (non-interactive) text', () => {
    renderHero()
    expect(screen.getByText('Dev')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Dev' })).not.toBeInTheDocument()
  })
})
