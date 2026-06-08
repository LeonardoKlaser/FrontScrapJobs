import { describe, it, expect, beforeEach } from 'vitest'
import { trackLanding } from '@/lib/analytics'

beforeEach(() => {
  window.dataLayer = []
})

describe('trackLanding', () => {
  it('pushes a cta click event with section', () => {
    trackLanding('lp_cta_click', { section: 'hero' })
    expect(window.dataLayer).toEqual([{ section: 'hero', event: 'lp_cta_click' }])
  })

  it('pushes an area chip event', () => {
    trackLanding('lp_area_chip', { area: 'dev' })
    expect(window.dataLayer?.[0]).toMatchObject({ area: 'dev', event: 'lp_area_chip' })
  })
})
