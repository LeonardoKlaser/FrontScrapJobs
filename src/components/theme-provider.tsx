import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

// Contador em nível de módulo de quantos useForceSystemTheme estão montados
// agora. Existe por causa da ordem de commit dos efeitos do React: efeitos de
// componentes filhos rodam ANTES dos efeitos do pai. Se o ThemeProvider e uma
// página pública montarem no mesmo commit (ex: import eager em vez de lazy(),
// ou o Suspense que hoje as isola sumir), o efeito do useForceSystemTheme
// (filho) roda primeiro forçando o tema do SO, e o efeito do provider (pai)
// roda depois e sobrescreve de volta com o tema salvo — silenciosamente
// quebrando o force nas páginas públicas sem nenhum teste acusar. Em prod isso
// não acontece hoje só porque cada página é lazy() e o provider já commitou
// antes; nada além desse contador garante isso estruturalmente.
let forceSystemThemeCount = 0

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'vite-ui-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement

    const applyTheme = () => {
      // Uma página pública está forçando o tema do SO agora — não sobrescreve
      // com o tema salvo enquanto isso (ver comentário do contador acima).
      if (forceSystemThemeCount > 0) return

      root.classList.remove('light', 'dark')

      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        root.classList.add(systemTheme)
      } else {
        root.classList.add(theme)
      }
    }

    applyTheme()

    // Páginas públicas forçam o tema do SO enquanto montadas (useForceSystemTheme)
    // e, ao desmontar, disparam esse evento pra devolver o tema escolhido do app.
    window.addEventListener('vite-ui-theme-restore', applyTheme)

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => applyTheme()
      mediaQuery.addEventListener('change', handler)
      return () => {
        mediaQuery.removeEventListener('change', handler)
        window.removeEventListener('vite-ui-theme-restore', applyTheme)
      }
    }

    return () => window.removeEventListener('vite-ui-theme-restore', applyTheme)
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    }
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider')

  return context
}

// Força o tema do SO enquanto o componente estiver montado (páginas públicas).
// Não toca no localStorage — o tema escolhido do app volta ao desmontar.
export function useForceSystemTheme() {
  useEffect(() => {
    forceSystemThemeCount++
    const root = window.document.documentElement
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      root.classList.remove('light', 'dark')
      root.classList.add(mq.matches ? 'dark' : 'light')
    }
    apply()
    mq.addEventListener('change', apply)
    return () => {
      mq.removeEventListener('change', apply)
      forceSystemThemeCount--
      window.dispatchEvent(new Event('vite-ui-theme-restore'))
    }
  }, [])
}

function readAppliedTheme(): 'light' | 'dark' {
  return window.document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

// Le o tema de FATO aplicado em <html> (a classe 'dark'/'light' real), em vez
// do tema escolhido guardado no provider. useTheme() sozinho nao serve pro
// toaster global (ThemedToaster em App.tsx): paginas publicas sobrescrevem a
// classe via useForceSystemTheme enquanto montadas, e nesse momento o tema
// salvo do provider diverge do que esta de fato na tela. Observa a classe de
// <html> diretamente via MutationObserver — funciona tanto pro force do SO
// quanto pras trocas normais de tema (inclusive 'system' reagindo a mudanca de
// preferencia do SO), sem duplicar a logica de matchMedia que ja vive no
// provider e no useForceSystemTheme.
export function useAppliedTheme(): 'light' | 'dark' {
  const [applied, setApplied] = useState<'light' | 'dark'>(() =>
    typeof window === 'undefined' ? 'dark' : readAppliedTheme()
  )

  useEffect(() => {
    const root = window.document.documentElement
    const update = () => setApplied(readAppliedTheme())
    update()

    const observer = new MutationObserver(update)
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  return applied
}
