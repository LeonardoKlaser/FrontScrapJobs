import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FaqSection } from '@/components/landingPage/faq-section'

describe('FaqSection', () => {
  it('keeps the labels.faq eyebrow and the section title', () => {
    render(<FaqSection />)
    expect(screen.getByText('Perguntas frequentes')).toBeInTheDocument()
  })

  it('renders all 7 questions from the faq.items array', () => {
    render(<FaqSection />)
    expect(screen.getByText('As vagas são reais? De onde vêm?')).toBeInTheDocument()
    expect(screen.getByText('O ScrapJobs é pra mim?')).toBeInTheDocument()
    expect(screen.getByText('Qual a diferença pro LinkedIn e agregadores?')).toBeInTheDocument()
    expect(screen.getByText('Como a IA analisa meu currículo?')).toBeInTheDocument()
    expect(screen.getByText('Meus dados estão seguros?')).toBeInTheDocument()
    expect(screen.getByText('Posso cancelar quando quiser?')).toBeInTheDocument()
    expect(screen.getByText('Quantas empresas posso monitorar?')).toBeInTheDocument()
  })

  it('renders 7 accordion triggers (one per item)', () => {
    render(<FaqSection />)
    expect(screen.getAllByRole('button')).toHaveLength(7)
  })

  it('forwards the #faq anchor id to the section', () => {
    const { container } = render(<FaqSection />)
    expect(container.querySelector('section#faq')).not.toBeNull()
  })
})
