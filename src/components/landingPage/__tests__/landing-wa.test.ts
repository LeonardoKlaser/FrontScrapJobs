import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  buildWaLink,
  getWaNumber,
  hasWaNumber,
  isMobileDevice
} from '@/components/landingPage/landing-wa'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('buildWaLink', () => {
  it('monta o link com número da env e sufixo por origem', () => {
    vi.stubEnv('VITE_NORTE_WA_NUMBER', '5551999990000')
    const link = buildWaLink('qr')
    expect(link).toContain('https://wa.me/5551999990000?text=')
    // Contrato exato com o backend (wa_leads.source) — âncora no fim da
    // string pra não deixar #lpq passar como se fosse #lp.
    expect(decodeURIComponent(link || '')).toMatch(/#lpq$/)
  })
  it('sufixos: mobile #lp, web #lpw', () => {
    vi.stubEnv('VITE_NORTE_WA_NUMBER', '5551999990000')
    expect(decodeURIComponent(buildWaLink('mobile') || '')).toMatch(/#lp$/)
    expect(decodeURIComponent(buildWaLink('web') || '')).toMatch(/#lpw$/)
  })
  it('retorna null quando VITE_NORTE_WA_NUMBER falta', () => {
    vi.stubEnv('VITE_NORTE_WA_NUMBER', '')
    expect(getWaNumber()).toBe('')
    expect(hasWaNumber()).toBe(false)
    expect(buildWaLink('mobile')).toBeNull()
  })
})

describe('isMobileDevice', () => {
  it('detecta iPhone via userAgent', () => {
    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)' })
    expect(isMobileDevice()).toBe(true)
  })
})
