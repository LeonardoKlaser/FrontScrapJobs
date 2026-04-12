import { AppHeader } from '@/components/common/app-header'
import { AppFooter } from '@/components/common/app-footer'
import { Outlet } from 'react-router'
import { ScrollToTop } from '@/components/common/scroll-to-top'

export function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <ScrollToTop />
      <AppHeader />

      <main className="flex-1 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full">
        <Outlet />
      </main>

      <AppFooter />
    </div>
  )
}
