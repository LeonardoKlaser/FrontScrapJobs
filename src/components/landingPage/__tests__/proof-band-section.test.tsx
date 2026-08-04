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
    expect(screen.getByText('empresas monitoradas')).toBeInTheDocument()
    expect(screen.getByText('vagas disponíveis')).toBeInTheDocument()
    // 142000 formatted by Intl for pt-BR is "142.000"; locale may vary in jsdom
    expect(screen.getByText(/142[.,]?000/)).toBeInTheDocument()
  })

  it('duplicates a single logo 4x for a seamless marquee', () => {
    const { container } = render(<ProofBandSection />)
    expect(container.querySelectorAll('img')).toHaveLength(4)
    expect(screen.getAllByAltText('Nubank')).toHaveLength(1)
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
    const { container } = render(<ProofBandSection />)
    expect(container.querySelectorAll('img')).toHaveLength(6)
    expect(screen.getAllByAltText('Nubank')).toHaveLength(1)
    expect(screen.getAllByAltText('iFood')).toHaveLength(1)
    expect(screen.getAllByAltText('Stone')).toHaveLength(1)
  })

  it('scales the marquee duration with the logo count (constant speed)', () => {
    render(<ProofBandSection />)
    // 1 logo duplicado 4x → metade da faixa = 2 logos × 3.5s = 7s
    const track = screen.getByAltText('Nubank').parentElement as HTMLElement
    expect(track.style.animationDuration).toBe('7s')
  })

  it('renders nothing when there are no stats and no logos', () => {
    usePublicStats.mockReturnValue({ data: undefined, error: null })
    usePublicSiteLogos.mockReturnValue({ data: undefined, error: null })
    const { container } = render(<ProofBandSection />)
    expect(container).toBeEmptyDOMElement()
  })
})
