import { useState } from 'react'
import { Link, NavLink } from 'react-router'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList
} from '@/components/ui/navigation-menu'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/common/mode-toggle'
import { PATHS } from '@/router/paths'
import { useUser } from '@/hooks/useUser'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

const baseItems = [
  { title: 'Início', href: PATHS.app.home },
  { title: 'Currículo', href: PATHS.app.curriculum },
  { title: 'Empresas', href: PATHS.app.listSites },
  { title: 'Minha Conta', href: PATHS.app.accountPage }
]

const adminItems = [
  { title: 'Admin', href: PATHS.app.adminDashboard },
  { title: 'Adicionar Site', href: PATHS.app.addNewSite }
]

export function AppHeader() {
  const [open, setOpen] = useState(false)
  const { data: user, isLoading } = useUser()
  const { logout } = useAuth()

  const items = user?.is_admin ? [...baseItems, ...adminItems] : baseItems

  const handleLogout = async () => {
    await logout()
  }

  return (
    <header
      className="sticky top-0 z-40 w-full border-b border-border/40
      bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60"
    >
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4">
        <Link
          to={PATHS.app.home}
          prefetch="intent"
          className="flex items-center gap-2 text-lg font-semibold"
        >
          Scrap<span className="text-primary">Jobs</span>
        </Link>

        <NavigationMenu viewport={false} className="hidden md:block">
          <NavigationMenuList className="flex items-center gap-1">
            {items.map((item) => (
              <NavigationMenuItem key={item.href}>
                <NavigationMenuLink asChild>
                  <NavLink
                    to={item.href}
                    end={item.href === PATHS.app.home}
                    prefetch="intent"
                    className={({ isActive }) =>
                      cn(
                        'relative px-3 py-1.5 rounded-md text-sm font-medium transition-colors after:absolute after:bottom-0 after:left-3 after:right-3 after:h-px after:transition-colors',
                        isActive
                          ? 'text-foreground after:bg-primary'
                          : 'text-muted-foreground hover:text-foreground after:bg-transparent'
                      )
                    }
                  >
                    {item.title}
                  </NavLink>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-2">
          <ModeToggle />

          {!isLoading && user && (
            <Button
              size="sm"
              variant="ghost"
              className="text-muted-foreground"
              onClick={handleLogout}
            >
              Sair
            </Button>
          )}

          <Button
            size="icon"
            variant="ghost"
            className="md:hidden"
            onClick={() => setOpen((p) => !p)}
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {open && (
        <nav className="md:hidden border-b border-border/40 bg-background/95 backdrop-blur-md px-4 pb-4 pt-2">
          {items.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === PATHS.app.home}
              prefetch="intent"
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  'block rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
                )
              }
            >
              {item.title}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}
