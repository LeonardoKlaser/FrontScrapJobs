import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { LandingNavbar } from '@/components/landingPage/navbar'
import * as analytics from '@/lib/analytics'
import * as landingCta from '@/components/landingPage/landing-cta'

vi.mock('qrcode', () => ({
  default: { toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,AAAA') }
}))

function renderNavbar() {
  return render(
    <MemoryRouter>
      <LandingNavbar />
    </MemoryRouter>
  )
}

beforeEach(() => vi.restoreAllMocks())

describe('LandingNavbar', () => {
  it('renders desktop anchors, the Entrar link and the CTA', () => {
    renderNavbar()
    expect(screen.getByRole('button', { name: 'Como funciona' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Planos' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'FAQ' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Entrar' })).toHaveAttribute('href', '/login')
    expect(screen.getByRole('button', { name: 'Começar agora' })).toBeInTheDocument()
  })

  it('scrolls to the matching section when an anchor is clicked', () => {
    const spy = vi.spyOn(landingCta, 'scrollToId').mockImplementation(() => {})
    renderNavbar()
    fireEvent.click(screen.getByRole('button', { name: 'Como funciona' }))
    expect(spy).toHaveBeenCalledWith('howItWorks')
    fireEvent.click(screen.getByRole('button', { name: 'Planos' }))
    expect(spy).toHaveBeenCalledWith('pricing')
    fireEvent.click(screen.getByRole('button', { name: 'FAQ' }))
    expect(spy).toHaveBeenCalledWith('faq')
  })

  it('tracks the CTA click and opens the WhatsApp modal on desktop', () => {
    const track = vi.spyOn(analytics, 'trackLanding').mockImplementation(() => {})
    renderNavbar()
    fireEvent.click(screen.getByRole('button', { name: 'Começar agora' }))
    expect(track).toHaveBeenCalledWith('lp_whatsapp_click', {
      section: 'navbar',
      device: 'desktop',
      method: 'modal'
    })
    expect(screen.getByText('Fale com o Norte no seu WhatsApp')).toBeInTheDocument()
  })
})
