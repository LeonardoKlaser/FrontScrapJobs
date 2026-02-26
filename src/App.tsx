import { Suspense, useMemo } from 'react'
import { RouterProvider } from 'react-router'
import { ThemeProvider, useTheme } from './components/theme-provider'
import type { QueryClient } from '@tanstack/react-query'
import { createRouter } from './router/routes'
import { Toaster } from 'sonner'
import { ErrorBoundary } from '@/components/common/error-boundary'
import { LoadingSection } from '@/components/common/loading-section'

function ThemedToaster() {
  const { theme } = useTheme()
  const resolvedTheme =
    theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : theme

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
      <ErrorBoundary>
        <Suspense fallback={<LoadingSection variant="full" label="Carregando..." />}>
          <RouterProvider router={router} />
        </Suspense>
      </ErrorBoundary>
      <ThemedToaster />
    </ThemeProvider>
  )
}
