import { Suspense } from 'react'
import { RouterProvider } from 'react-router'
import { ThemeProvider } from './components/theme-provider'
import type { QueryClient } from '@tanstack/react-query'
import { createRouter } from './router/routes'

interface AppProps {
  queryClient: QueryClient
}

export function App({ queryClient }: AppProps) {
  const router = createRouter(queryClient)

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Suspense fallback={<p>Loading...</p>}>
        <RouterProvider router={router} />
      </Suspense>
    </ThemeProvider>
  )
}
