import type { ComponentType } from 'react'
import { Link, NavLink, useMatch } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  Home,
  FileText,
  Building2,
  ClipboardCheck,
  Settings,
  LayoutDashboard,
  Boxes,
  Users,
  Mail,
  LogOut
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar
} from '@/components/ui/sidebar'
import { Logo } from '@/components/common/logo'
import { ModeToggle } from '@/components/common/mode-toggle'
import { PATHS } from '@/router/paths'
import { useUser } from '@/hooks/useUser'
import { useAuth } from '@/hooks/useAuth'

type Item = { titleKey: string; href: string; icon: ComponentType<{ className?: string }> }

const baseItems: Item[] = [
  { titleKey: 'nav.home', href: PATHS.app.home, icon: Home },
  { titleKey: 'nav.curriculum', href: PATHS.app.curriculum, icon: FileText },
  { titleKey: 'nav.companies', href: PATHS.app.listSites, icon: Building2 },
  { titleKey: 'nav.applications', href: PATHS.app.applications, icon: ClipboardCheck },
  { titleKey: 'nav.myAccount', href: PATHS.app.account, icon: Settings }
]

const adminItems: Item[] = [
  { titleKey: 'nav.admin', href: PATHS.app.adminDashboard, icon: LayoutDashboard },
  { titleKey: 'nav.manageSites', href: PATHS.app.adminSites, icon: Boxes },
  { titleKey: 'nav.leads', href: PATHS.app.adminLeads, icon: Users },
  { titleKey: 'nav.adminEmails', href: PATHS.app.adminEmails.hub, icon: Mail }
]

function NavItem({ item, onNavigate }: { item: Item; onNavigate: () => void }) {
  const { t } = useTranslation('common')
  const end = item.href === PATHS.app.home
  const match = useMatch({ path: item.href, end })
  const isActive = match !== null

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip={t(item.titleKey)}>
        <NavLink to={item.href} end={end} prefetch="intent" onClick={onNavigate}>
          <item.icon />
          <span>{t(item.titleKey)}</span>
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export function AppSidebar() {
  const { t } = useTranslation('common')
  const { data: user } = useUser()
  const { logout } = useAuth()
  const { setOpenMobile } = useSidebar()
  const closeMobile = () => setOpenMobile(false)
  const handleLogout = () => {
    void logout()
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center justify-between gap-2 px-2">
          <Link to={PATHS.app.home} prefetch="intent" onClick={closeMobile}>
            <Logo size={24} showText textClassName="text-base" />
          </Link>
          <SidebarTrigger className="hidden md:inline-flex" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('nav.section.main')}</SidebarGroupLabel>
          <SidebarMenu>
            {baseItems.map((item) => (
              <NavItem key={item.href} item={item} onNavigate={closeMobile} />
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {user?.is_admin && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>{t('nav.section.admin')}</SidebarGroupLabel>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <NavItem key={item.href} item={item} onNavigate={closeMobile} />
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <ModeToggle />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} tooltip={t('nav.logout')}>
              <LogOut />
              <span>{t('nav.logout')}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {user && (
            <SidebarMenuItem>
              <SidebarMenuButton tooltip={user.user_name ?? user.email}>
                <span className="truncate">{user.user_name ?? user.email}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
