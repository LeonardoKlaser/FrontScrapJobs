import { render, screen } from '@testing-library/react'
import { EmptyState } from '@/components/common/empty-state'
import { Search } from 'lucide-react'

describe('EmptyState', () => {
  it('renders icon', () => {
    const { container } = render(<EmptyState icon={Search} title="Nenhum resultado" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders title', () => {
    render(<EmptyState icon={Search} title="Nenhum resultado" />)
    expect(screen.getByText('Nenhum resultado')).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(
      <EmptyState icon={Search} title="Nenhum resultado" description="Tente buscar novamente" />
    )
    expect(screen.getByText('Tente buscar novamente')).toBeInTheDocument()
  })

  it('does not render description when not provided', () => {
    const { container } = render(<EmptyState icon={Search} title="Nenhum resultado" />)
    const paragraphs = container.querySelectorAll('p')
    expect(paragraphs.length).toBe(1) // only the title
  })

  it('renders action when provided', () => {
    render(
      <EmptyState icon={Search} title="Nenhum resultado" action={<button>Criar novo</button>} />
    )
    expect(screen.getByText('Criar novo')).toBeInTheDocument()
  })

  it('does not render action wrapper when not provided', () => {
    const { container } = render(<EmptyState icon={Search} title="Vazio" />)
    expect(container.querySelector('.mt-1')).toBeNull()
  })
})
