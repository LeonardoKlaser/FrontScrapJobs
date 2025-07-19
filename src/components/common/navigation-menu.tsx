import { Link } from 'react-router'

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList
} from '@/components/ui/navigation-menu'
import { PATHS } from '@/router/paths'

const items = [
  { title: 'Início', href: PATHS.app.home },
  { title: 'Sobre', href: PATHS.app.about }
]

export function AppNavigation() {
  return (
    <NavigationMenu viewport={false}>
      <NavigationMenuList>
        {items.map((item) => (
          <NavigationMenuItem key={item.href}>
            <NavigationMenuLink asChild>
              <Link to={item.href}>{item.title}</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
