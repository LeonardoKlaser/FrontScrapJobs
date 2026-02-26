import { render, screen } from '@testing-library/react'
import { PageHeader } from '@/components/common/page-header'

describe('PageHeader', () => {
  it('renders title', () => {
    render(<PageHeader title="Meu Painel" />)
    expect(screen.getByText('Meu Painel')).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(<PageHeader title="Painel" description="Gerencie suas vagas" />)
    expect(screen.getByText('Gerencie suas vagas')).toBeInTheDocument()
  })

  it('does not render description when not provided', () => {
    const { container } = render(<PageHeader title="Painel" />)
    expect(container.querySelector('p')).toBeNull()
  })

  it('applies gradient class by default', () => {
    render(<PageHeader title="Painel" />)
    const heading = screen.getByText('Painel')
    expect(heading.className).toContain('text-gradient-primary')
  })

  it('does not apply gradient class when gradient is false', () => {
    render(<PageHeader title="Painel" gradient={false} />)
    const heading = screen.getByText('Painel')
    expect(heading.className).not.toContain('text-gradient-primary')
    expect(heading.className).toContain('text-foreground')
  })

  it('renders children', () => {
    render(
      <PageHeader title="Painel">
        <button>Ação</button>
      </PageHeader>
    )
    expect(screen.getByText('Ação')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<PageHeader title="Painel" className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
