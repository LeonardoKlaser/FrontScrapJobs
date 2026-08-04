import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { IncludedFeaturesSection } from '@/components/landingPage/included-features-section'

describe('IncludedFeaturesSection', () => {
  it('apresenta cinco recursos, duas interfaces e a limitação do prompt', () => {
    render(<IncludedFeaturesSection />)

    expect(screen.getByRole('heading', { name: 'Da descoberta à candidatura' })).toBeInTheDocument()
    expect(screen.getByText('Radar de vagas')).toBeInTheDocument()
    expect(screen.getByText('Seleção personalizada')).toBeInTheDocument()
    expect(screen.getByText('Alertas de vagas')).toBeInTheDocument()
    expect(screen.getByText('Análise de compatibilidade')).toBeInTheDocument()
    expect(screen.getByText('Prompt de otimização')).toBeInTheDocument()
    expect(screen.getByText('Norte no WhatsApp')).toBeInTheDocument()
    expect(screen.getByText('Painel ScrapJobs')).toBeInTheDocument()
    expect(screen.getByText(/não reescreve nem gera um novo currículo/i)).toBeInTheDocument()
    expect(screen.getAllByTestId('journey-feature')).toHaveLength(5)
  })
})
