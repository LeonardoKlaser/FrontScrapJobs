import { describe, it, expect, vi, afterEach } from 'vitest'
import { buildWaLink, isMobileDevice } from '@/components/landingPage/landing-wa'

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
    expect(decodeURIComponent(link)).toMatch(/#lpq$/)
  })
  it('sufixos: mobile #lp, web #lpw', () => {
    vi.stubEnv('VITE_NORTE_WA_NUMBER', '5551999990000')
    expect(decodeURIComponent(buildWaLink('mobile'))).toMatch(/#lp$/)
    expect(decodeURIComponent(buildWaLink('web'))).toMatch(/#lpw$/)
  })
  it('avisa no console e ainda retorna o link sem número quando VITE_NORTE_WA_NUMBER falta', () => {
    // stubEnv explícito pra '' — o .env.example manda o dev criar um
    // .env com VITE_NORTE_WA_NUMBER preenchida, então este caso não pode
    // depender da ausência ambiental da variável (replica o build de
    // produção sem ela plumbada — Dockerfile antes do fix, ver Task 9, fix
    // round 2). O link não pode quebrar a página, mas a falha não pode
    // mais ser silenciosa.
    vi.stubEnv('VITE_NORTE_WA_NUMBER', '')
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const link = buildWaLink('mobile')
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('VITE_NORTE_WA_NUMBER'))
    expect(link).toBe('https://wa.me/?text=Oi%20Norte!%20Quero%20ver%20vagas%20pra%20mim%20%23lp')
  })
})

describe('isMobileDevice', () => {
  it('detecta iPhone via userAgent', () => {
    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)' })
    expect(isMobileDevice()).toBe(true)
  })
})
