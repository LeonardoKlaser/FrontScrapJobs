import { Suspense } from 'react'
import { RouterProvider } from 'react-router'
import { router } from './router/routes'
import { ThemeProvider } from './components/theme-provider'

export function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Suspense fallback={<p>Loading...</p>}>
        <RouterProvider router={router} />
      </Suspense>
    </ThemeProvider>
  )
}
