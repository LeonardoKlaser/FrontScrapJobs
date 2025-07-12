import { PATHS } from '@/router/paths'
import { Outlet, useNavigate } from 'react-router'

export function MainLayout() {
  const navigate = useNavigate()

  return (
    <div>
      <header style={{ padding: 16 }}>
        <nav style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => navigate(PATHS.app.home)}>Home</button>
          <button onClick={() => navigate(PATHS.app.about)}>Sobre</button>
        </nav>
      </header>

      <main style={{ padding: 24 }}>
        <Outlet />
      </main>
    </div>
  )
}
