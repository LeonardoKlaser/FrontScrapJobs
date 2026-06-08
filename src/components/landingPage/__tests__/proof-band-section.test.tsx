import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProofBandSection } from '@/components/landingPage/proof-band-section'

const usePublicStats = vi.fn()
const usePublicSiteLogos = vi.fn()

vi.mock('@/hooks/usePublicStats', () => ({
  usePublicStats: () => usePublicStats(),
  usePublicSiteLogos: () => usePublicSiteLogos()
}))
vi.mock('@/hooks/useCountUp', () => ({ useCountUp: ({ target }: { target: number }) => target }))

beforeEach(() => {
  usePublicStats.mockReturnValue({
    data: { monitored_sites: 87, total_jobs: 142000 },
    error: null
  })
  usePublicSiteLogos.mockReturnValue({
    data: [{ site_name: 'Nubank', logo_url: 'x' }],
    error: null
  })
})

describe('ProofBandSection', () => {
  it('renders the stats line (number + label live in sibling nodes)', () => {
    render(<ProofBandSection />)
    expect(screen.getByText('87')).toBeInTheDocument()
    expect(screen.getByText('sites monitorados')).toBeInTheDocument()
    expect(screen.getByText('vagas abertas agora')).toBeInTheDocument()
    // 142000 formatted by Intl for pt-BR is "142.000"; locale may vary in jsdom
    expect(screen.getByText(/142[.,]?000/)).toBeInTheDocument()
  })

  it('duplicates a single logo 4x for a seamless marquee', () => {
    render(<ProofBandSection />)
    expect(screen.getAllByAltText('Nubank')).toHaveLength(4)
  })

  it('duplicates 3+ logos only 2x', () => {
    usePublicSiteLogos.mockReturnValue({
      data: [
        { site_name: 'Nubank', logo_url: 'a' },
        { site_name: 'iFood', logo_url: 'b' },
        { site_name: 'Stone', logo_url: 'c' }
      ],
      error: null
    })
    render(<ProofBandSection />)
    expect(screen.getAllByAltText('Nubank')).toHaveLength(2)
    expect(screen.getAllByAltText('iFood')).toHaveLength(2)
    expect(screen.getAllByAltText('Stone')).toHaveLength(2)
  })

  it('renders nothing when there are no stats and no logos', () => {
    usePublicStats.mockReturnValue({ data: undefined, error: null })
    usePublicSiteLogos.mockReturnValue({ data: undefined, error: null })
    const { container } = render(<ProofBandSection />)
    expect(container).toBeEmptyDOMElement()
  })
})
