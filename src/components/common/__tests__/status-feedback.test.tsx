import { render, screen } from '@testing-library/react'
import { StatusFeedback } from '@/components/common/status-feedback'

describe('StatusFeedback', () => {
  it('renders success variant with message', () => {
    const { container } = render(<StatusFeedback variant="success" message="Salvo com sucesso!" />)
    expect(screen.getByText('Salvo com sucesso!')).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('bg-primary/5')
    expect(container.firstChild).toHaveClass('text-primary')
  })

  it('renders error variant with message', () => {
    const { container } = render(<StatusFeedback variant="error" message="Algo deu errado" />)
    expect(screen.getByText('Algo deu errado')).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('bg-destructive/10')
    expect(container.firstChild).toHaveClass('text-destructive')
  })

  it('renders icon for each variant', () => {
    const { container: successContainer } = render(
      <StatusFeedback variant="success" message="OK" />
    )
    expect(successContainer.querySelector('svg')).toBeInTheDocument()

    const { container: errorContainer } = render(<StatusFeedback variant="error" message="Erro" />)
    expect(errorContainer.querySelector('svg')).toBeInTheDocument()
  })
})
