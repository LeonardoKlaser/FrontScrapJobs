import { Suspense, useMemo } from 'react'
import { RouterProvider } from 'react-router'
import { ThemeProvider } from './components/theme-provider'
import type { QueryClient } from '@tanstack/react-query'
import { createRouter } from './router/routes'
import { Spinner } from '@/components/ui/spinner'
import { ErrorBoundary } from '@/components/common/error-boundary'

interface AppProps {
  queryClient: QueryClient
}

export function App({ queryClient }: AppProps) {
  const router = useMemo(() => createRouter(queryClient), [queryClient])

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <ErrorBoundary>
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen">
              <Spinner className="size-8" />
            </div>
          }
        >
          <RouterProvider router={router} />
        </Suspense>
      </ErrorBoundary>
    </ThemeProvider>
  )
}
