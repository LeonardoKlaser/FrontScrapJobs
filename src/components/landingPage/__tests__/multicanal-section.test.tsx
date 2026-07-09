import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MulticanalSection } from '@/components/landingPage/multicanal-section'

describe('MulticanalSection', () => {
  it('renders the three channels', () => {
    render(<MulticanalSection />)
    expect(screen.getByText('No canal que você preferir')).toBeInTheDocument()
    expect(screen.getByText('WhatsApp')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Painel web')).toBeInTheDocument()
  })
})
