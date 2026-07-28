import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import { ThemeProvider, useForceSystemTheme } from '../theme-provider'

// matchMedia mock que permite disparar 'change' manualmente e espiar
// addEventListener/removeEventListener por instância.
function mockMatchMedia(matches: boolean) {
  const listeners = new Set<() => void>()
  const mql = {
    matches,
    media: '(prefers-color-scheme: dark)',
    addEventListener: vi.fn((_event: string, cb: () => void) => listeners.add(cb)),
    removeEventListener: vi.fn((_event: string, cb: () => void) => listeners.delete(cb)),
    dispatchChange: () => listeners.forEach((cb) => cb())
  }
  // jsdom não implementa matchMedia — define a propriedade em vez de vi.spyOn
  // (que exige uma função pré-existente pra espionar).
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockReturnValue(mql)
  })
  return mql
}

function ForceSystemThemeProbe() {
  useForceSystemTheme()
  return null
}

describe('useForceSystemTheme', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    localStorage.clear()
    document.documentElement.classList.remove('light', 'dark')
  })

  it('aplica a classe dark quando o SO prefere dark, mesmo com tema salvo light', () => {
    localStorage.setItem('vite-ui-theme', 'light')
    mockMatchMedia(true)

    render(<ForceSystemThemeProbe />)

    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.classList.contains('light')).toBe(false)
  })

  it('ao desmontar, dispara vite-ui-theme-restore pra devolver o tema escolhido', () => {
    mockMatchMedia(true)
    const onRestore = vi.fn()
    window.addEventListener('vite-ui-theme-restore', onRestore)

    const { unmount } = render(<ForceSystemThemeProbe />)
    unmount()

    expect(onRestore).toHaveBeenCalledTimes(1)
    window.removeEventListener('vite-ui-theme-restore', onRestore)
  })
})

describe('ThemeProvider + vite-ui-theme-restore', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    localStorage.clear()
    document.documentElement.classList.remove('light', 'dark')
  })

  it('reaplica o tema salvo do usuário quando vite-ui-theme-restore é disparado', () => {
    localStorage.setItem('vite-ui-theme', 'light')
    mockMatchMedia(true)

    render(
      <ThemeProvider>
        <div />
      </ThemeProvider>
    )

    expect(document.documentElement.classList.contains('light')).toBe(true)

    // Simula uma página pública forçando o tema do SO por cima (dark).
    document.documentElement.classList.remove('light')
    document.documentElement.classList.add('dark')

    window.dispatchEvent(new Event('vite-ui-theme-restore'))

    expect(document.documentElement.classList.contains('light')).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})

// Regressão do finding do code review: React commita efeitos de filho ANTES
// do pai. Quando o ThemeProvider e uma página pública montam no MESMO commit
// (o cenário abaixo, sem lazy()/Suspense de por meio), o efeito do
// useForceSystemTheme rodava primeiro forçando o tema do SO, e o efeito do
// provider rodava depois e sobrescrevia de volta com o tema salvo — o SO nunca
// vencia. O contador em nível de módulo em theme-provider.tsx corrige isso
// estruturalmente; estes testes cobrem exatamente o cenário composto que
// escapava dos testes isolados acima.
describe('ThemeProvider + useForceSystemTheme montados no mesmo commit', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    localStorage.clear()
    document.documentElement.classList.remove('light', 'dark')
  })

  it('SO vence mesmo com tema salvo light, quando provider e página pública montam juntos', () => {
    localStorage.setItem('vite-ui-theme', 'light')
    mockMatchMedia(true)

    render(
      <ThemeProvider>
        <ForceSystemThemeProbe />
      </ThemeProvider>
    )

    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.classList.contains('light')).toBe(false)
  })

  it('ao desmontar a página pública dentro do provider, o tema salvo volta', () => {
    localStorage.setItem('vite-ui-theme', 'light')
    mockMatchMedia(true)

    function Wrapper({ showPublicPage }: { showPublicPage: boolean }) {
      return <ThemeProvider>{showPublicPage && <ForceSystemThemeProbe />}</ThemeProvider>
    }

    const { rerender } = render(<Wrapper showPublicPage />)
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    rerender(<Wrapper showPublicPage={false} />)

    expect(document.documentElement.classList.contains('light')).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
