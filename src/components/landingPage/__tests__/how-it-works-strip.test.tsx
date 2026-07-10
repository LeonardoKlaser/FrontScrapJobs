import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HowItWorksStrip } from '@/components/landingPage/how-it-works-strip'

describe('HowItWorksStrip', () => {
  it('renders the 4-step WhatsApp flow', () => {
    render(<HowItWorksStrip />)
    expect(screen.getByText(/à vaga certa, em 4 passos/)).toBeInTheDocument()
    expect(screen.getByText('Crie a conta e conecte o WhatsApp')).toBeInTheDocument()
    expect(screen.getByText('Peça análise e CV otimizado no chat')).toBeInTheDocument()
  })

  it('keeps the howItWorks anchor id', () => {
    const { container } = render(<HowItWorksStrip />)
    expect(container.querySelector('#howItWorks')).not.toBeNull()
  })
})
