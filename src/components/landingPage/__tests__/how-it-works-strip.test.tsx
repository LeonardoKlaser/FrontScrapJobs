import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HowItWorksStrip } from '@/components/landingPage/how-it-works-strip'

describe('HowItWorksStrip', () => {
  it('renders the headline', () => {
    render(<HowItWorksStrip />)
    expect(screen.getByText('Do cadastro à entrevista em 4 passos')).toBeInTheDocument()
  })

  it('renders all 4 step titles from the dynamic t() wiring', () => {
    render(<HowItWorksStrip />)
    expect(screen.getByText('Cadastre seu CV')).toBeInTheDocument()
    expect(screen.getByText('Receba alertas das suas empresas')).toBeInTheDocument()
    expect(screen.getByText('A IA cruza vaga e currículo')).toBeInTheDocument()
    expect(screen.getByText('Aplique com o PDF otimizado')).toBeInTheDocument()
  })

  it('renders 4 numbered steps (01..04)', () => {
    render(<HowItWorksStrip />)
    expect(screen.getByText('01')).toBeInTheDocument()
    expect(screen.getByText('02')).toBeInTheDocument()
    expect(screen.getByText('03')).toBeInTheDocument()
    expect(screen.getByText('04')).toBeInTheDocument()
  })

  it('renders 4 step icons (one svg per step)', () => {
    const { container } = render(<HowItWorksStrip />)
    expect(container.querySelectorAll('svg')).toHaveLength(4)
  })
})
