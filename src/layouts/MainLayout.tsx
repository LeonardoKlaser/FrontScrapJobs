import { AppHeader } from '@/components/common/app-header'
import { Outlet } from 'react-router'

export function MainLayout() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}
