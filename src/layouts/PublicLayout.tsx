import { Outlet } from 'react-router'
import { ScrollToTop } from '@/components/common/scroll-to-top'

export function PublicLayout() {
  return (
    <main className="min-h-screen bg-background">
      <ScrollToTop />
      <Outlet />
    </main>
  )
}
