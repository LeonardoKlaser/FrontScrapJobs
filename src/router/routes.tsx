import React, { Suspense, lazy } from 'react'
import type { ComponentType } from 'react'
import { createBrowserRouter, Navigate, Outlet } from 'react-router'

import { MainLayout } from '@/layouts/MainLayout'
import { PublicLayout } from '@/layouts/PublicLayout'
import { authLoader } from './loaders/authLoader'
import { guestLoader } from './loaders/guestLoader'
import { PATHS } from './paths'
import i18n from '@/i18n'

import type { QueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useUser } from '@/hooks/useUser'
import { LoadingSection } from '@/components/common/loading-section'

// Apos um deploy, o index.html cacheado pelo browser ainda referencia chunks
// antigos cujos arquivos sumiram do CDN, e o lazy() quebra com "Failed to fetch
// dynamically imported module". Em vez de mostrar o ErrorBoundary, recarrega
// a pagina uma vez pra puxar o index.html novo (com os novos hashes). A flag
// em sessionStorage evita loop caso o erro persista por outro motivo.
const CHUNK_RELOAD_KEY = 'chunk-reload-attempted'
const CHUNK_ERROR_PATTERNS = [
  'Failed to fetch dynamically imported module',
  'Importing a module script failed',
  'error loading dynamically imported module'
]

function isChunkLoadError(err: unknown): boolean {
  if (!(err instanceof Error)) return false
  return CHUNK_ERROR_PATTERNS.some((pattern) => err.message.includes(pattern))
}

// relativeTo strips o prefixo do parent path pra derivar o segmento relativo
// que React Router espera em rotas filhas. Mantém routes.tsx em sync com PATHS
// sem hardcode de strings duplicadas. Se child não começa com parent, retorna
// child intocado (caller fica visível em teste de unidade ou inspeção).
function relativeTo(parent: string, child: string): string {
  return child.startsWith(parent + '/') ? child.slice(parent.length + 1) : child
}

function lazyWithRetry<T extends ComponentType<unknown>>(factory: () => Promise<{ default: T }>) {
  return lazy(async () => {
    try {
      const mod = await factory()
      sessionStorage.removeItem(CHUNK_RELOAD_KEY)
      return mod
    } catch (err) {
      if (isChunkLoadError(err) && sessionStorage.getItem(CHUNK_RELOAD_KEY) !== 'true') {
        sessionStorage.setItem(CHUNK_RELOAD_KEY, 'true')
        window.location.reload()
        return new Promise<{ default: T }>(() => {})
      }
      throw err
    }
  })
}

const Landing = lazyWithRetry(() => import('@/pages/Landing').then((m) => ({ default: m.Landing })))
const Login = lazyWithRetry(() => import('@/pages/Login'))
const Signup = lazyWithRetry(() => import('@/pages/Signup'))
const Home = lazyWithRetry(() => import('@/pages/Home').then((m) => ({ default: m.Home })))
const NotFound = lazyWithRetry(() =>
  import('@/pages/NotFound').then((m) => ({ default: m.NotFound }))
)
const EmpresasPage = lazyWithRetry(() => import('@/pages/ListSites'))
const AdicionarSitePage = lazyWithRetry(() => import('@/pages/addNewSite'))
const AdminSitesListPage = lazyWithRetry(() => import('@/pages/adminSitesList'))
const AdminLeadsPage = lazyWithRetry(() => import('@/pages/adminLeads'))
const EditSitePage = lazyWithRetry(() => import('@/pages/editSite'))
const AccountPage = lazyWithRetry(() => import('@/pages/accountPage'))
const ForgotPassword = lazyWithRetry(() => import('@/pages/ForgotPassword'))
const ResetPassword = lazyWithRetry(() => import('@/pages/ResetPassword'))
const CheckoutPage = lazyWithRetry(() => import('@/pages/checkout'))
const PaymentConfirmationPage = lazyWithRetry(() => import('@/pages/paymentConfirmation'))
const Feedback = lazyWithRetry(() => import('@/pages/Feedback'))
const RenewSubscription = lazyWithRetry(() => import('@/pages/RenewSubscription'))
const AdminDashboard = lazyWithRetry(() => import('@/pages/adminDashboard'))
const TermsOfService = lazyWithRetry(() => import('@/pages/TermsOfService'))
const PrivacyPolicy = lazyWithRetry(() => import('@/pages/PrivacyPolicy'))
const Applications = lazyWithRetry(() => import('@/pages/Applications'))
const AdminEmailsHub = lazyWithRetry(() => import('@/pages/adminEmails/Hub'))
const AdminEmailsTemplatesList = lazyWithRetry(() => import('@/pages/adminEmails/TemplatesList'))
const AdminEmailsTemplateEditor = lazyWithRetry(() => import('@/pages/adminEmails/TemplateEditor'))
const AdminEmailsEvents = lazyWithRetry(() => import('@/pages/adminEmails/EventsPage'))
const AdminEmailsLifecycleList = lazyWithRetry(() => import('@/pages/adminEmails/LifecycleList'))
const AdminEmailsLifecycleEditor = lazyWithRetry(
  () => import('@/pages/adminEmails/LifecycleEditor')
)
const AdminEmailsLogs = lazyWithRetry(() => import('@/pages/adminEmails/LogsViewer'))
const AdminEmailsCampaignsList = lazyWithRetry(() => import('@/pages/adminEmails/CampaignsList'))
const AdminEmailsCampaignEditor = lazyWithRetry(() => import('@/pages/adminEmails/CampaignEditor'))

const CurriculumPage = lazyWithRetry(() =>
  import('@/pages/Curriculum').then((m) => ({ default: m.Curriculum }))
)

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation('common')
  const user = useUser()
  if (user.isLoading) return <LoadingSection variant="full" label={t('loadingPermissions')} />
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
        { path: PATHS.signup, element: <Signup />, loader: guestLoader(queryClient) },
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
        },
        {
          path: 'feedback',
          element: <Feedback />
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
                fallback={<LoadingSection variant="section" label={i18n.t('loadingPanel')} />}
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
          path: PATHS.app.adminSites,
          element: (
            <AdminGuard>
              <Suspense
                fallback={<LoadingSection variant="section" label={i18n.t('loadingPanel')} />}
              >
                <AdminSitesListPage />
              </Suspense>
            </AdminGuard>
          )
        },
        {
          path: PATHS.app.adminLeads,
          element: (
            <AdminGuard>
              <Suspense
                fallback={<LoadingSection variant="section" label={i18n.t('loadingPanel')} />}
              >
                <AdminLeadsPage />
              </Suspense>
            </AdminGuard>
          )
        },
        {
          path: PATHS.app.editSitePath,
          element: (
            <AdminGuard>
              <Suspense
                fallback={<LoadingSection variant="section" label={i18n.t('loadingPanel')} />}
              >
                <EditSitePage />
              </Suspense>
            </AdminGuard>
          )
        },
        {
          // relativeTo deriva o segmento relativo de cada path em PATHS pra
          // que rename/move em paths.ts atualize o router automaticamente. Sem
          // isso, strings hardcoded ('templates'/'events'/...) divergiriam silenciosamente.
          path: relativeTo(PATHS.app.home, PATHS.app.adminEmails.hub),
          element: (
            <AdminGuard>
              <Suspense
                fallback={<LoadingSection variant="section" label={i18n.t('loadingPanel')} />}
              >
                <Outlet />
              </Suspense>
            </AdminGuard>
          ),
          children: [
            { index: true, element: <AdminEmailsHub /> },
            {
              path: relativeTo(PATHS.app.adminEmails.hub, PATHS.app.adminEmails.templates),
              element: <AdminEmailsTemplatesList />
            },
            {
              path: relativeTo(PATHS.app.adminEmails.hub, PATHS.app.adminEmails.templateNew),
              element: <AdminEmailsTemplateEditor />
            },
            {
              path: relativeTo(
                PATHS.app.adminEmails.hub,
                PATHS.app.adminEmails.templateEdit(':id')
              ),
              element: <AdminEmailsTemplateEditor />
            },
            {
              path: relativeTo(PATHS.app.adminEmails.hub, PATHS.app.adminEmails.events),
              element: <AdminEmailsEvents />
            },
            {
              path: relativeTo(PATHS.app.adminEmails.hub, PATHS.app.adminEmails.lifecycle),
              element: <AdminEmailsLifecycleList />
            },
            {
              path: relativeTo(PATHS.app.adminEmails.hub, PATHS.app.adminEmails.lifecycleNew),
              element: <AdminEmailsLifecycleEditor />
            },
            {
              path: relativeTo(
                PATHS.app.adminEmails.hub,
                PATHS.app.adminEmails.lifecycleEdit(':id')
              ),
              element: <AdminEmailsLifecycleEditor />
            },
            {
              path: relativeTo(PATHS.app.adminEmails.hub, PATHS.app.adminEmails.campaigns),
              element: <AdminEmailsCampaignsList />
            },
            {
              path: relativeTo(PATHS.app.adminEmails.hub, PATHS.app.adminEmails.campaignNew),
              element: <AdminEmailsCampaignEditor />
            },
            {
              path: relativeTo(
                PATHS.app.adminEmails.hub,
                PATHS.app.adminEmails.campaignEdit(':id')
              ),
              element: <AdminEmailsCampaignEditor />
            },
            {
              path: relativeTo(PATHS.app.adminEmails.hub, PATHS.app.adminEmails.logs),
              element: <AdminEmailsLogs />
            }
          ]
        },
        {
          path: PATHS.app.applications,
          element: (
            <Suspense
              fallback={<LoadingSection variant="section" label={i18n.t('loadingApplications')} />}
            >
              <Applications />
            </Suspense>
          )
        },
        {
          path: PATHS.app.account,
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
