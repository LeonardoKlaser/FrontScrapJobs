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

const items = [
  { title: 'Início', href: PATHS.app.home },
  { title: 'Currículo', href: PATHS.app.curriculum },
  { title: 'Empresas', href: PATHS.app.listSites }
]

export function AppHeader() {
  const [open, setOpen] = useState(false)
  const { data: user, isLoading } = useUser()
  const { logout } = useAuth()

  return (
    <header
      className="sticky top-0 z-40 w-full border-b
      bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link to={PATHS.app.home} className="text-lg font-semibold">
          Scrap&nbsp;<span className="text-primary">Jobs</span>
        </Link>

        <NavigationMenu viewport={false} className="hidden md:block">
          <NavigationMenuList className="flex items-center gap-6">
            {items.map((item) => (
              <NavigationMenuItem key={item.href}>
                <NavigationMenuLink asChild>
                  <NavLink
                    to={item.href}
                    end={item.href === PATHS.app.home}
                    className={({ isActive }) =>
                      [
                        'text-sm font-medium transition-colors',
                        isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                      ].join(' ')
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
            <Button size="sm" variant="outline" onClick={() => logout()}>
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
        <nav className="md:hidden border-b bg-background px-4 pb-4 pt-2 shadow-sm">
          {items.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === PATHS.app.home}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                [
                  'block rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
                ].join(' ')
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
