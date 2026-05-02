import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { CampaignProgressBar } from '../CampaignProgressBar'

describe('CampaignProgressBar', () => {
  it('mostra "Aguardando início" quando recipient é null', () => {
    render(<CampaignProgressBar sent={0} failed={0} recipient={null} />)
    expect(screen.getByText(/Aguardando início/)).toBeInTheDocument()
  })

  it('mostra 0% no começo (sent=0, failed=0, recipient=100)', () => {
    render(<CampaignProgressBar sent={0} failed={0} recipient={100} />)
    expect(screen.getByText(/0 \/ 100 \(0%\)/)).toBeInTheDocument()
  })

  it('mostra percentual parcial (sent=42 / 100 = 42%)', () => {
    render(<CampaignProgressBar sent={42} failed={0} recipient={100} />)
    expect(screen.getByText(/42 \/ 100 \(42%\)/)).toBeInTheDocument()
    expect(screen.queryByText(/falharam/)).not.toBeInTheDocument()
  })

  it('mostra "X falharam" quando failed > 0', () => {
    render(<CampaignProgressBar sent={80} failed={15} recipient={100} />)
    expect(screen.getByText(/15 falharam/)).toBeInTheDocument()
    expect(screen.getByText(/95 \/ 100 \(95%\)/)).toBeInTheDocument()
  })

  it('mostra 100% quando completo (sent=100, failed=0, recipient=100)', () => {
    render(<CampaignProgressBar sent={100} failed={0} recipient={100} />)
    expect(screen.getByText(/100 \/ 100 \(100%\)/)).toBeInTheDocument()
  })
})
