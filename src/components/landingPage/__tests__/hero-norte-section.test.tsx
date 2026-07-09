import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { HeroNorteSection } from '@/components/landingPage/hero-norte-section'
import * as analytics from '@/lib/analytics'
import * as landingCta from '@/components/landingPage/landing-cta'

beforeEach(() => vi.restoreAllMocks())

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

  it('tracks section:hero and scrolls to pricing on CTA click', () => {
    const track = vi.spyOn(analytics, 'trackLanding').mockImplementation(() => {})
    const scroll = vi.spyOn(landingCta, 'scrollToPricing').mockImplementation(() => {})
    renderHero()
    fireEvent.click(screen.getByRole('button', { name: /Começar grátis/ }))
    expect(track).toHaveBeenCalledWith('lp_cta_click', { section: 'hero' })
    expect(scroll).toHaveBeenCalled()
  })

  it('renders the area chips as decorative (non-interactive) text', () => {
    renderHero()
    expect(screen.getByText('Dev')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Dev' })).not.toBeInTheDocument()
  })
})
