import { Suspense } from 'react'
import { RouterProvider } from 'react-router'
import { ThemeProvider } from './components/theme-provider'
import { QueryClient } from '@tanstack/react-query'
import { createRouter } from './router/routes'

const queryClient = new QueryClient()
const router = createRouter(queryClient)

export function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Suspense fallback={<p>Loading...</p>}>
        <RouterProvider router={router} />
      </Suspense>
    </ThemeProvider>
  )
}
