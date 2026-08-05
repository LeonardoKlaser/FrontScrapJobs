import {
  cleanCompanyName,
  companyInitial,
  postedAgoKey,
  FALLBACK_JOBS
} from '@/components/landingPage/ui-snippets/live-jobs-helpers'

describe('cleanCompanyName', () => {
  it('removes the trailing careers suffix', () => {
    expect(cleanCompanyName('QuintoAndar Carreiras')).toBe('QuintoAndar')
    expect(cleanCompanyName('TOTVS Careers')).toBe('TOTVS')
    expect(cleanCompanyName('Globo Vagas')).toBe('Globo')
  })

  it('keeps names without a suffix untouched', () => {
    expect(cleanCompanyName('Nubank')).toBe('Nubank')
  })

  it('only strips the suffix at the end, never inside the name', () => {
    expect(cleanCompanyName('Carreiras do Sul')).toBe('Carreiras do Sul')
    expect(cleanCompanyName('Grupo Carreiras Brasil')).toBe('Grupo Carreiras Brasil')
  })
})

describe('postedAgoKey', () => {
  it('treats zero and negative hours as "now"', () => {
    expect(postedAgoKey(0)).toEqual({ key: 'hero.panel.now', count: 0 })
    expect(postedAgoKey(-3)).toEqual({ key: 'hero.panel.now', count: 0 })
  })

  it('reports hours below a day', () => {
    expect(postedAgoKey(1)).toEqual({ key: 'hero.panel.hoursAgo', count: 1 })
    expect(postedAgoKey(23)).toEqual({ key: 'hero.panel.hoursAgo', count: 23 })
  })

  it('rolls over to days at 24h', () => {
    expect(postedAgoKey(24)).toEqual({ key: 'hero.panel.daysAgo', count: 1 })
    expect(postedAgoKey(49)).toEqual({ key: 'hero.panel.daysAgo', count: 2 })
  })
})

describe('companyInitial', () => {
  it('returns the first letter uppercased', () => {
    expect(companyInitial('nubank')).toBe('N')
  })

  it('survives an empty name', () => {
    expect(companyInitial('')).toBe('?')
  })
})

describe('FALLBACK_JOBS', () => {
  // 4 e não 3: o painel precisa da mesma altura em loading, live e fallback.
  it('has exactly four entries', () => {
    expect(FALLBACK_JOBS).toHaveLength(4)
  })
})
