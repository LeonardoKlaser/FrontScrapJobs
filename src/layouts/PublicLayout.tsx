import { Outlet } from 'react-router'
import { ScrollToTop } from '@/components/common/scroll-to-top'
import { useForceSystemTheme } from '@/components/theme-provider'

export function PublicLayout() {
  useForceSystemTheme()

  return (
    <main className="min-h-screen bg-background">
      <ScrollToTop />
      <Outlet />
    </main>
  )
}
