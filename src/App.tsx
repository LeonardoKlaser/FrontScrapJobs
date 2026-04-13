import { Suspense, useMemo } from 'react'
import { RouterProvider } from 'react-router'
import { ThemeProvider, useTheme } from './components/theme-provider'
import type { QueryClient } from '@tanstack/react-query'
import { createRouter } from './router/routes'
import { Toaster } from 'sonner'
import i18n from '@/i18n'
import { ErrorBoundary } from '@/components/common/error-boundary'
import { LoadingSection } from '@/components/common/loading-section'
import { TooltipProvider } from '@/components/tooltip'

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
