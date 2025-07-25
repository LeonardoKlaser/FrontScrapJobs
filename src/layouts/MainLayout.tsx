import { AppHeader } from '@/components/common/app-header'
import { Outlet } from 'react-router'

export function MainLayout() {
  return (
    <div>
      <AppHeader />

      <main className="px-6 py-6">
        <Outlet />
      </main>
    </div>
  )
}
