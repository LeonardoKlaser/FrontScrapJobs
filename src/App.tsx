import { Suspense, useMemo } from 'react'
import { RouterProvider } from 'react-router'
import { ThemeProvider, useAppliedTheme } from './components/theme-provider'
import type { QueryClient } from '@tanstack/react-query'
import { createRouter } from './router/routes'
import { Toaster } from 'sonner'
import i18n from '@/i18n'
import { ErrorBoundary } from '@/components/common/error-boundary'
import { LoadingSection } from '@/components/common/loading-section'
import { TooltipProvider } from '@/components/ui/tooltip'

// Segue o tema REAL aplicado em <html> (useAppliedTheme), nao o tema salvo do
// provider. Paginas publicas forcam o tema do SO por cima do tema salvo
// (useForceSystemTheme em PublicLayout) — se o toaster lesse useTheme() aqui,
// ele mostraria toasts no tema salvo (ex.: 'dark' default) mesmo com a pagina
// publica renderizando light pro SO do usuario, quebrando o contraste do toast.
function ThemedToaster() {
  const resolvedTheme = useAppliedTheme()

  return (
    <Toaster
      theme={resolvedTheme}
      position="bottom-right"
      duration={4000}
      toastOptions={{
        classNames: {
          toast: 'bg-card border-border/50 text-card-foreground',
          title: 'text-card-foreground',
          description: 'text-muted-foreground'
        }
      }}
    />
  )
}

interface AppProps {
  queryClient: QueryClient
}

export function App({ queryClient }: AppProps) {
  const router = useMemo(() => createRouter(queryClient), [queryClient])

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TooltipProvider>
        <ErrorBoundary>
          <Suspense fallback={<LoadingSection variant="full" label={i18n.t('loading')} />}>
            <RouterProvider router={router} />
          </Suspense>
        </ErrorBoundary>
        <ThemedToaster />
      </TooltipProvider>
    </ThemeProvider>
  )
}
