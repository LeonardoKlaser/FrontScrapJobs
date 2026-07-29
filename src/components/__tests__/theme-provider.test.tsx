import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, cleanup, screen, waitFor } from '@testing-library/react'
import { ThemeProvider, useForceLightTheme, useAppliedTheme } from '../theme-provider'

// matchMedia mock que permite disparar 'change' manualmente e espiar
// addEventListener/removeEventListener por instância. Ainda necessário pro
// ThemeProvider resolver o tema 'system'.
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

function ForceLightThemeProbe() {
  useForceLightTheme()
  return null
}

describe('useForceLightTheme', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    localStorage.clear()
    document.documentElement.classList.remove('light', 'dark')
  })

  it('aplica a classe light mesmo com tema salvo dark e SO em dark', () => {
    localStorage.setItem('vite-ui-theme', 'dark')
    mockMatchMedia(true)

    render(<ForceLightThemeProbe />)

    expect(document.documentElement.classList.contains('light')).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('ao desmontar, dispara vite-ui-theme-restore pra devolver o tema escolhido', () => {
    mockMatchMedia(true)
    const onRestore = vi.fn()
    window.addEventListener('vite-ui-theme-restore', onRestore)

    const { unmount } = render(<ForceLightThemeProbe />)
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
    localStorage.setItem('vite-ui-theme', 'dark')
    mockMatchMedia(false)

    render(
      <ThemeProvider>
        <div />
      </ThemeProvider>
    )

    expect(document.documentElement.classList.contains('dark')).toBe(true)

    // Simula uma página pública forçando light por cima.
    document.documentElement.classList.remove('dark')
    document.documentElement.classList.add('light')

    window.dispatchEvent(new Event('vite-ui-theme-restore'))

    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.classList.contains('light')).toBe(false)
  })
})

// Regressão do finding do code review: React commita efeitos de filho ANTES
// do pai. Quando o ThemeProvider e uma página pública montam no MESMO commit
// (o cenário abaixo, sem lazy()/Suspense de por meio), o efeito do
// useForceLightTheme rodava primeiro forçando light, e o efeito do provider
// rodava depois e sobrescrevia de volta com o tema salvo — o light nunca
// vencia. O contador em nível de módulo em theme-provider.tsx corrige isso
// estruturalmente; estes testes cobrem exatamente o cenário composto que
// escapava dos testes isolados acima.
describe('ThemeProvider + useForceLightTheme montados no mesmo commit', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    localStorage.clear()
    document.documentElement.classList.remove('light', 'dark')
  })

  it('light vence mesmo com tema salvo dark, quando provider e página pública montam juntos', () => {
    localStorage.setItem('vite-ui-theme', 'dark')
    mockMatchMedia(true)

    render(
      <ThemeProvider>
        <ForceLightThemeProbe />
      </ThemeProvider>
    )

    expect(document.documentElement.classList.contains('light')).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('ao desmontar a página pública dentro do provider, o tema salvo volta', () => {
    localStorage.setItem('vite-ui-theme', 'dark')
    mockMatchMedia(true)

    function Wrapper({ showPublicPage }: { showPublicPage: boolean }) {
      return <ThemeProvider>{showPublicPage && <ForceLightThemeProbe />}</ThemeProvider>
    }

    const { rerender } = render(<Wrapper showPublicPage />)
    expect(document.documentElement.classList.contains('light')).toBe(true)

    rerender(<Wrapper showPublicPage={false} />)

    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.classList.contains('light')).toBe(false)
  })
})

function AppliedThemeProbe() {
  const applied = useAppliedTheme()
  return <span data-testid="applied-theme">{applied}</span>
}

// useAppliedTheme existe pro ThemedToaster global (App.tsx) seguir o tema REAL
// de <html>, nao o tema salvo no provider — necessario porque paginas publicas
// forcam light por cima do tema salvo (useForceLightTheme) enquanto montadas,
// e nesse momento os dois divergem.
describe('useAppliedTheme', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    localStorage.clear()
    document.documentElement.classList.remove('light', 'dark')
  })

  it('reflete a classe ja aplicada em <html> no mount', () => {
    document.documentElement.classList.add('dark')

    render(<AppliedThemeProbe />)

    expect(screen.getByTestId('applied-theme')).toHaveTextContent('dark')
  })

  it('segue o force de light (useForceLightTheme), nao o tema salvo do provider', async () => {
    localStorage.setItem('vite-ui-theme', 'dark')
    mockMatchMedia(true)

    render(
      <ThemeProvider>
        <ForceLightThemeProbe />
        <AppliedThemeProbe />
      </ThemeProvider>
    )

    // Tema salvo e' 'dark', mas a pagina publica forca a classe 'light' —
    // useAppliedTheme deve reportar 'light', batendo com o que esta na tela.
    await waitFor(() => {
      expect(screen.getByTestId('applied-theme')).toHaveTextContent('light')
    })
  })

  it('atualiza quando a classe de <html> muda depois do mount', async () => {
    render(<AppliedThemeProbe />)

    expect(screen.getByTestId('applied-theme')).toHaveTextContent('light')

    document.documentElement.classList.add('dark')
    document.documentElement.classList.remove('light')

    await waitFor(() => {
      expect(screen.getByTestId('applied-theme')).toHaveTextContent('dark')
    })
  })
})
