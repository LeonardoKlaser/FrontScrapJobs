import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

interface SectionHeaderProps {
  title: string
  icon?: LucideIcon
  children?: ReactNode
}

export function SectionHeader({ title, icon: Icon, children }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4.5 w-4.5 text-primary" />}
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      </div>
      {children}
    </div>
  )
}
