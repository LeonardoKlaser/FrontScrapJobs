import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FaqSection } from '@/components/landingPage/faq-section'
import * as analytics from '@/lib/analytics'

describe('FaqSection', () => {
  it('renders the FAQ eyebrow and section title', () => {
    render(<FaqSection />)
    expect(screen.getByText('FAQ')).toBeInTheDocument()
    expect(screen.getByText('Perguntas frequentes')).toBeInTheDocument()
  })

  it('renders the six approved questions', () => {
    render(<FaqSection />)
    expect(screen.getAllByRole('button')).toHaveLength(6)
    expect(screen.getByText('De onde vêm as vagas?')).toBeInTheDocument()
    expect(screen.getByText('A conversa inicial é gratuita?')).toBeInTheDocument()
    expect(screen.getByText('O ScrapJobs modifica meu currículo?')).toBeInTheDocument()
    expect(screen.getByText('Posso cancelar quando quiser?')).toBeInTheDocument()
  })

  it('tracks an opening with a stable key and one-based position', () => {
    const track = vi.spyOn(analytics, 'trackLanding').mockImplementation(() => {})
    render(<FaqSection />)
    fireEvent.click(screen.getByRole('button', { name: 'De onde vêm as vagas?' }))
    expect(track).toHaveBeenCalledTimes(1)
    expect(track).toHaveBeenCalledWith('lp_faq_open', { item_key: 'origin', position: 1 })
  })

  it('forwards the #faq anchor id to the section', () => {
    const { container } = render(<FaqSection />)
    expect(container.querySelector('section#faq')).not.toBeNull()
  })
})
