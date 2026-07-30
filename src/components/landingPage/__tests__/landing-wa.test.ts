import { describe, it, expect, vi, afterEach } from 'vitest'
import { buildWaLink, isMobileDevice } from '@/components/landingPage/landing-wa'

afterEach(() => vi.unstubAllEnvs())

describe('buildWaLink', () => {
  it('monta o link com número da env e sufixo por origem', () => {
    vi.stubEnv('VITE_NORTE_WA_NUMBER', '5551999990000')
    const link = buildWaLink('qr')
    expect(link).toContain('https://wa.me/5551999990000?text=')
    expect(decodeURIComponent(link)).toContain('#lpq')
  })
  it('sufixos: mobile #lp, web #lpw', () => {
    vi.stubEnv('VITE_NORTE_WA_NUMBER', '5551999990000')
    expect(decodeURIComponent(buildWaLink('mobile'))).toContain('#lp')
    expect(decodeURIComponent(buildWaLink('web'))).toContain('#lpw')
  })
})

describe('isMobileDevice', () => {
  it('detecta iPhone via userAgent', () => {
    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)' })
    expect(isMobileDevice()).toBe(true)
  })
})
