import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NorteCapabilitiesSection } from '@/components/landingPage/norte-capabilities-section'

describe('NorteCapabilitiesSection', () => {
  it('renders the three capabilities with their chats', () => {
    render(<NorteCapabilitiesSection />)
    expect(screen.getByText('Avisa das vagas antes de todo mundo')).toBeInTheDocument()
    expect(screen.getByText('Mostra por que seu CV é descartado')).toBeInTheDocument()
    expect(screen.getByText('Reescreve seu CV pra cada vaga')).toBeInTheDocument()
    // mini-chat content
    expect(screen.getByText(/CV_Nubank\.pdf/)).toBeInTheDocument()
  })
})
