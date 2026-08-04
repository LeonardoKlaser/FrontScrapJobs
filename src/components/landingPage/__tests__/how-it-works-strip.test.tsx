import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HowItWorksStrip } from '@/components/landingPage/how-it-works-strip'

describe('HowItWorksStrip', () => {
  it('explica as três perguntas, o resultado e a assinatura', () => {
    render(<HowItWorksStrip />)
    expect(screen.getByText('Comece pelo WhatsApp')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Veja suas oportunidades em 3 perguntas' })
    ).toBeInTheDocument()
    expect(screen.getByText('Conte o que você procura')).toBeInTheDocument()
    expect(screen.getByText('Veja o resultado')).toBeInTheDocument()
    expect(screen.getByText('Escolha seu plano')).toBeInTheDocument()
    expect(screen.getByText(/consulta inicial são gratuitas/i)).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })

  it('keeps the howItWorks anchor id', () => {
    const { container } = render(<HowItWorksStrip />)
    expect(container.querySelector('#howItWorks')).not.toBeNull()
  })
})
