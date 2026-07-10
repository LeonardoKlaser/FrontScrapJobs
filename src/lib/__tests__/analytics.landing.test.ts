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
})
