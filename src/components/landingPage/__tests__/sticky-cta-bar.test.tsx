import { render, screen, fireEvent } from '@testing-library/react'
import { StickyCtaBar } from '@/components/landingPage/sticky-cta-bar'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'pt-BR' }
  })
}))

describe('StickyCtaBar', () => {
  it('does not render content when visible is false', () => {
    render(<StickyCtaBar visible={false} />)
    expect(screen.queryByText('stickyBar.message')).not.toBeInTheDocument()
    expect(screen.queryByText('stickyBar.cta')).not.toBeInTheDocument()
  })

  it('renders message and CTA when visible', () => {
    render(<StickyCtaBar visible={true} />)
    expect(screen.getByText('stickyBar.message')).toBeInTheDocument()
    expect(screen.getByText('stickyBar.cta')).toBeInTheDocument()
  })

  it('scrolls to pricing section when CTA clicked', () => {
    const scrollIntoView = vi.fn()
    const pricingEl = document.createElement('section')
    pricingEl.id = 'pricing'
    pricingEl.scrollIntoView = scrollIntoView
    document.body.appendChild(pricingEl)

    render(<StickyCtaBar visible={true} />)
    fireEvent.click(screen.getByText('stickyBar.cta'))

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })

    document.body.removeChild(pricingEl)
  })

  it('safely no-ops when pricing section is missing', () => {
    render(<StickyCtaBar visible={true} />)
    expect(() => fireEvent.click(screen.getByText('stickyBar.cta'))).not.toThrow()
  })
})
