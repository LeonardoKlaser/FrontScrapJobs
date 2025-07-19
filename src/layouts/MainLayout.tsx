import { ModeToggle } from '@/components/common/mode-toggle'
import { AppNavigation } from '@/components/common/navigation-menu'
import { Outlet, useNavigate } from 'react-router'

export function MainLayout() {
  return (
    <div>
      <AppNavigation />
      <ModeToggle />

      <main style={{ padding: 24 }}>
        <Outlet />
      </main>
    </div>
  )
}
