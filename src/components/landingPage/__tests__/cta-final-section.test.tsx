import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CtaFinalSection } from '@/components/landingPage/cta-final-section'
import * as analytics from '@/lib/analytics'

vi.mock('qrcode', () => ({
  default: { toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,AAAA') }
}))

beforeEach(() => vi.restoreAllMocks())

describe('CtaFinalSection', () => {
  it('renders the final CTA copy', () => {
    render(<CtaFinalSection />)
    expect(screen.getByText('Começar grátis')).toBeInTheDocument()
  })

  it('tracks section:final and opens the WhatsApp modal on click', () => {
    const track = vi.spyOn(analytics, 'trackLanding').mockImplementation(() => {})
    render(<CtaFinalSection />)
    fireEvent.click(screen.getByRole('button', { name: /Começar grátis/ }))
    expect(track).toHaveBeenCalledWith('lp_whatsapp_click', {
      section: 'final',
      device: 'desktop',
      method: 'modal'
    })
    expect(screen.getByText('Fale com o Norte no seu WhatsApp')).toBeInTheDocument()
  })
})
