import { render, screen } from '@testing-library/react'
import { LoadingSection } from '@/components/common/loading-section'

describe('LoadingSection', () => {
  it('renders with section variant by default', () => {
    const { container } = render(<LoadingSection />)
    expect(container.firstChild).toHaveClass('h-64')
  })

  it('renders full variant with min-h-screen', () => {
    const { container } = render(<LoadingSection variant="full" />)
    expect(container.firstChild).toHaveClass('min-h-screen')
  })

  it('renders inline variant with py-8', () => {
    const { container } = render(<LoadingSection variant="inline" />)
    expect(container.firstChild).toHaveClass('py-8')
  })

  it('renders spinner icon', () => {
    const { container } = render(<LoadingSection />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveClass('animate-spin')
  })

  it('renders label when provided', () => {
    render(<LoadingSection label="Carregando dados..." />)
    expect(screen.getByText('Carregando dados...')).toBeInTheDocument()
  })

  it('does not render label when not provided', () => {
    const { container } = render(<LoadingSection />)
    expect(container.querySelector('p')).toBeNull()
  })
})
