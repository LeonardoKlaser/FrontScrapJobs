import { Outlet } from 'react-router'
import { ScrollToTop } from '@/components/common/scroll-to-top'
import { useForceLightTheme } from '@/components/theme-provider'

export function PublicLayout() {
  useForceLightTheme()

  return (
    <main className="min-h-screen bg-background">
      <ScrollToTop />
      <Outlet />
    </main>
  )
}
