import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
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
  it('renderiza a proposta principal e um digest real', () => {
    renderHero()
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Receba as vagas mais recentes no seu WhatsApp.'
      })
    ).toBeInTheDocument()
    expect(screen.getByText('Vagas em áreas como')).toBeInTheDocument()
    expect(screen.getByText('Tecnologia')).toBeInTheDocument()
    expect(screen.getByText('Finanças')).toBeInTheDocument()
    expect(screen.getByText(/8 vagas novas hoje/)).toBeInTheDocument()
    expect(screen.getByText('demonstração')).toBeInTheDocument()
    expect(screen.queryByText(/CV_Nubank\.pdf|CV otimizado|92% match/i)).not.toBeInTheDocument()
    expect(screen.queryByText('online')).not.toBeInTheDocument()
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

  it('renders area chips as accessible examples, not controls', () => {
    renderHero()
    const areas = screen.getByRole('list')
    expect(areas).toBeInTheDocument()
    expect(within(areas).getByText('Tecnologia')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Tecnologia' })).not.toBeInTheDocument()
  })
})
