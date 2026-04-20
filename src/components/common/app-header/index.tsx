import { useState } from 'react'
import { Link, NavLink } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList
} from '@/components/ui/navigation-menu'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/common/mode-toggle'
import { Logo } from '@/components/common/logo'
import { PATHS } from '@/router/paths'
import { useUser } from '@/hooks/useUser'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

export function AppHeader() {
  const [open, setOpen] = useState(false)
  const { data: user, isLoading } = useUser()
  const { logout } = useAuth()
  const { t } = useTranslation('common')

  const baseItems = [
    { title: t('nav.home'), href: PATHS.app.home },
    { title: t('nav.curriculum'), href: PATHS.app.curriculum },
    { title: t('nav.companies'), href: PATHS.app.listSites },
    { title: t('nav.applications'), href: PATHS.app.applications },
    { title: t('nav.myAccount'), href: PATHS.app.account }
  ]

  const adminItems = [
    { title: t('nav.admin'), href: PATHS.app.adminDashboard },
    { title: t('nav.manageSites'), href: PATHS.app.adminSites }
  ]

  const items = user?.is_admin ? [...baseItems, ...adminItems] : baseItems

  const handleLogout = async () => {
    await logout()
  }

  return (
    <header
      className="sticky top-0 z-40 w-full border-b border-border/40
      bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60"
    >
      <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4">
        <Link to={PATHS.app.home} prefetch="intent" className="flex items-center">
          <Logo size={24} showText textClassName="text-lg" />
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
              {t('nav.logout')}
            </Button>
          )}

          <Button
            size="icon"
            variant="ghost"
            className="md:hidden"
            onClick={() => setOpen((p) => !p)}
            aria-label={t('nav.openMenu')}
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
