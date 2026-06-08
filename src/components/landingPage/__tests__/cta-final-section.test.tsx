import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CtaFinalSection } from '@/components/landingPage/cta-final-section'
import * as analytics from '@/lib/analytics'
import * as landingCta from '@/components/landingPage/landing-cta'

beforeEach(() => vi.restoreAllMocks())

describe('CtaFinalSection', () => {
  it('renders the final CTA copy', () => {
    render(<CtaFinalSection />)
    expect(screen.getByText('Começar agora')).toBeInTheDocument()
  })

  it('tracks section:final on click and scrolls to pricing', () => {
    const track = vi.spyOn(analytics, 'trackLanding').mockImplementation(() => {})
    const scroll = vi.spyOn(landingCta, 'scrollToId').mockImplementation(() => {})
    render(<CtaFinalSection />)
    fireEvent.click(screen.getByRole('button', { name: /Começar agora/ }))
    expect(track).toHaveBeenCalledWith('lp_cta_click', { section: 'final' })
    expect(scroll).toHaveBeenCalledWith('pricing')
  })
})
