import { Suspense } from 'react'
import { RouterProvider } from 'react-router'
import { router } from './router/routes'

export function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <RouterProvider router={router} />
    </Suspense>
  )
}
