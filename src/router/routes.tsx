import { createBrowserRouter } from 'react-router'

import { MainLayout } from '@/layouts/MainLayout'
import { Home } from '@/pages/Home'
import { NotFound } from '@/pages/NotFound'
import Login from '@/pages/Login'
import { PublicLayout } from '@/layouts/PublicLayout'
import { Landing } from '@/pages/Landing'
import { authLoader } from './loaders/authLoader'
import { PATHS } from './paths'
import Register from '@/pages/Register'
import type { QueryClient } from '@tanstack/react-query'

const curriculumLazy = async () => {
  const { Curriculum } = await import('@/pages/Curriculum')

  return {
    element: <Curriculum />
    // loader: async () => ({
    //   user: fetch('/api/me').then(r => r.json())
    // })
  }
}

// export function CurriculumWrapper() {
//   const { user } = useLoaderData()
//   return (
//     <Suspense fallback={<InlineSkeleton />}>
//       <Await resolve={user}>{u => <Curriculum user={u} />}</Await>
//     </Suspense>
//   )
// }

export const createRouter = (queryClient: QueryClient) => createBrowserRouter([
  {
    path: PATHS.landing,
    element: <PublicLayout />,
    children: [
      { index: true, element: <Landing /> },
      { path: PATHS.login, element: <Login /> },
      { path: PATHS.register, element: <Register /> }
    ]
  },
  {
    path: PATHS.app.home,
    element: <MainLayout />,
    loader: authLoader(queryClient),
    shouldRevalidate: () => true,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: PATHS.app.curriculum,
        lazy: curriculumLazy
      }
    ]
  },
  { path: PATHS.notFound, element: <NotFound /> }
])
