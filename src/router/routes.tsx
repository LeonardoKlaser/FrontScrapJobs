import React, { Suspense, lazy } from 'react'
import { createBrowserRouter, Navigate } from 'react-router'

import { MainLayout } from '@/layouts/MainLayout'
import { PublicLayout } from '@/layouts/PublicLayout'
import { authLoader } from './loaders/authLoader'
import { guestLoader } from './loaders/guestLoader'
import { PATHS } from './paths'

import type { QueryClient } from '@tanstack/react-query'
import { useUser } from '@/hooks/useUser'
import { LoadingSection } from '@/components/common/loading-section'

const Landing = lazy(() => import('@/pages/Landing').then((m) => ({ default: m.Landing })))
const Login = lazy(() => import('@/pages/Login'))
const Home = lazy(() => import('@/pages/Home').then((m) => ({ default: m.Home })))
const NotFound = lazy(() => import('@/pages/NotFound').then((m) => ({ default: m.NotFound })))
const EmpresasPage = lazy(() => import('@/pages/ListSites'))
const AdicionarSitePage = lazy(() => import('@/pages/addNewSite'))
const AccountPage = lazy(() => import('@/pages/accountPage'))
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'))
const ResetPassword = lazy(() => import('@/pages/ResetPassword'))
const CheckoutPage = lazy(() => import('@/pages/checkout'))
const PaymentConfirmationPage = lazy(() => import('@/pages/paymentConfirmation'))
const RenewSubscription = lazy(() => import('@/pages/RenewSubscription'))
const AdminDashboard = lazy(() => import('@/pages/adminDashboard'))
const TermsOfService = lazy(() => import('@/pages/TermsOfService'))
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy'))
const Applications = lazy(() => import('@/pages/Applications'))

const CurriculumPage = lazy(() =>
  import('@/pages/Curriculum').then((m) => ({ default: m.Curriculum }))
)

function AdminGuard({ children }: { children: React.ReactNode }) {
  const user = useUser()
  if (user.isLoading) return <LoadingSection variant="full" label="Verificando permissões..." />
  if (user.isError || !user.data?.is_admin) return <Navigate to={PATHS.app.home} replace />
  return <>{children}</>
}

export const createRouter = (queryClient: QueryClient) =>
  createBrowserRouter([
    {
      path: PATHS.landing,
      element: <PublicLayout />,
      children: [
        { index: true, element: <Landing /> },
        { path: PATHS.login, element: <Login />, loader: guestLoader(queryClient) },
        { path: 'forgot-password', element: <ForgotPassword />, loader: guestLoader(queryClient) },
        { path: 'reset-password', element: <ResetPassword />, loader: guestLoader(queryClient) },
        { path: 'terms', element: <TermsOfService /> },
        { path: 'privacy', element: <PrivacyPolicy /> },
        {
          path: 'checkout/:planId',
          element: <CheckoutPage />
        },
        {
          path: 'payment-confirmation',
          element: <PaymentConfirmationPage />
        }
      ]
    },
    {
      path: PATHS.app.home,
      element: <MainLayout />,
      loader: authLoader(queryClient),
      shouldRevalidate: ({ nextUrl, currentUrl }) => nextUrl.pathname !== currentUrl.pathname,
      children: [
        {
          index: true,
          element: <Home />
        },
        {
          path: PATHS.app.curriculum,
          element: <CurriculumPage />
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
                fallback={<LoadingSection variant="section" label="Carregando painel..." />}
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
          path: PATHS.app.applications,
          element: (
            <Suspense
              fallback={<LoadingSection variant="section" label="Carregando candidaturas..." />}
            >
              <Applications />
            </Suspense>
          )
        },
        {
          path: PATHS.app.accountPage,
          element: <AccountPage />
        },
        {
          path: 'renew',
          element: <RenewSubscription />
        }
      ]
    },
    { path: PATHS.notFound, element: <NotFound /> }
  ])
