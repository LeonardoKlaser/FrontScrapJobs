import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FaqSection } from '@/components/landingPage/faq-section'

describe('FaqSection', () => {
  it('keeps the labels.faq eyebrow and the section title', () => {
    render(<FaqSection />)
    expect(screen.getByText('Perguntas frequentes')).toBeInTheDocument()
  })

  it('renders all 5 questions from the faq.items array', () => {
    render(<FaqSection />)
    expect(screen.getByText('O Norte é um robô?')).toBeInTheDocument()
    expect(screen.getByText('Vocês têm meu número? É seguro?')).toBeInTheDocument()
    expect(screen.getByText('E se eu não usar WhatsApp?')).toBeInTheDocument()
    expect(screen.getByText('As vagas são reais? De onde vêm?')).toBeInTheDocument()
    expect(screen.getByText('Posso cancelar quando quiser?')).toBeInTheDocument()
  })

  it('renders 5 accordion triggers (one per item)', () => {
    render(<FaqSection />)
    expect(screen.getAllByRole('button')).toHaveLength(5)
  })

  it('forwards the #faq anchor id to the section', () => {
    const { container } = render(<FaqSection />)
    expect(container.querySelector('section#faq')).not.toBeNull()
  })
})
