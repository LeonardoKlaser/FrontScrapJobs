import React, { Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router'

import { MainLayout } from '@/layouts/MainLayout'
import { Home } from '@/pages/Home'
import { NotFound } from '@/pages/NotFound'
import Login from '@/pages/Login'
import { PublicLayout } from '@/layouts/PublicLayout'
import { Landing } from '@/pages/Landing'
import { authLoader } from './loaders/authLoader'
import { PATHS } from './paths'

import type { QueryClient } from '@tanstack/react-query'
import EmpresasPage from '@/pages/ListSites'
import AdicionarSitePage from '@/pages/addNewSite'
import AccountPage from '@/pages/accountPage'
import CheckoutPage from '@/pages/checkout'
import PaymentConfirmationPage from '@/pages/paymentConfirmation'
import { Spinner } from '@/components/ui/spinner'
import { useUser } from '@/hooks/useUser'

const AdminDashboard = React.lazy(() => import('@/pages/adminDashboard'))

const curriculumLazy = async () => {
  const { Curriculum } = await import('@/pages/Curriculum')

  return {
    element: <Curriculum />
  }
}

function AdminGuard({ children }: { children: React.ReactNode }) {
  const user = useUser()
  if (user.isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="size-8" />
      </div>
    )
  if (!user.data?.is_admin) return <Navigate to={PATHS.app.home} replace />
  return <>{children}</>
}

export const createRouter = (queryClient: QueryClient) =>
  createBrowserRouter([
    {
      path: PATHS.landing,
      element: <PublicLayout />,
      children: [
        { index: true, element: <Landing /> },
        { path: PATHS.login, element: <Login /> },
        {
          path: 'checkout/:planId',
          element: <CheckoutPage />
        }
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
        },
        {
          path: PATHS.app.listSites,
          element: <EmpresasPage />
        },
        {
          path: PATHS.app.adminDashboard,
          element: (
            <AdminGuard>
              <Suspense
                fallback={
                  <div className="flex items-center justify-center min-h-screen">
                    <Spinner className="size-8" />
                  </div>
                }
              >
                <AdminDashboard />
              </Suspense>
            </AdminGuard>
          )
        },
        {
          path: PATHS.app.addNewSite,
          element: (
            <AdminGuard>
              <AdicionarSitePage />
            </AdminGuard>
          )
        },
        {
          path: PATHS.app.accountPage,
          element: <AccountPage />
        },
        {
          path: 'payment-confirmation', // Nova rota
          element: <PaymentConfirmationPage />
        }
      ]
    },
    { path: PATHS.notFound, element: <NotFound /> }
  ])
