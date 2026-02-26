import { render, screen } from '@testing-library/react'
import { SectionHeader } from '@/components/common/section-header'
import { Settings } from 'lucide-react'

describe('SectionHeader', () => {
  it('renders title', () => {
    render(<SectionHeader title="Configurações" />)
    expect(screen.getByText('Configurações')).toBeInTheDocument()
  })

  it('renders icon when provided', () => {
    const { container } = render(<SectionHeader title="Config" icon={Settings} />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveClass('text-primary')
  })

  it('does not render icon when not provided', () => {
    const { container } = render(<SectionHeader title="Config" />)
    const svg = container.querySelector('svg')
    expect(svg).toBeNull()
  })

  it('renders children', () => {
    render(
      <SectionHeader title="Config">
        <button>Editar</button>
      </SectionHeader>
    )
    expect(screen.getByText('Editar')).toBeInTheDocument()
  })
})
