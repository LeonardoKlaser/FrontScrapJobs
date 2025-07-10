import { createBrowserRouter } from 'react-router'

import { MainLayout } from '@/layouts/MainLayout'
import { Home } from '@/pages/Home'
import { NotFound } from '@/pages/NotFound'

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
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', lazy: aboutLazy }
    ]
  },
  { path: '*', element: <NotFound /> }
])
