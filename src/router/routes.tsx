import { createBrowserRouter } from 'react-router'

import { MainLayout } from '@/layouts/MainLayout'
import { Home } from '@/pages/Home'
import { NotFound } from '@/pages/NotFound'
import Login from '@/pages/Login'
import { PublicLayout } from '@/layouts/PublicLayout'
import { Landing } from '@/pages/Landing'
import { authLoader } from './loaders/authLoader'
import { PATHS } from './paths'

const aboutLazy = async () => {
  const { About } = await import('@/pages/About')

  return {
    element: <About />
    // loader: async () => ({
    //   user: fetch('/api/me').then(r => r.json())
    // })
  }
}

// export function AboutWrapper() {
//   const { user } = useLoaderData()
//   return (
//     <Suspense fallback={<InlineSkeleton />}>
//       <Await resolve={user}>{u => <About user={u} />}</Await>
//     </Suspense>
//   )
// }

export const router = createBrowserRouter([
  {
    path: PATHS.landing,
    element: <PublicLayout />,
    children: [
      { index: true, element: <Landing /> },
      { path: PATHS.login, element: <Login /> }
    ]
  },
  {
    path: PATHS.app.home,
    element: <MainLayout />,
    loader: authLoader,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: PATHS.app.about,
        lazy: aboutLazy
      }
    ]
  },
  { path: PATHS.notFound, element: <NotFound /> }
])
