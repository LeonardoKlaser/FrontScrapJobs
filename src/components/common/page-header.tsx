import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  gradient?: boolean
  children?: ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  gradient = true,
  children,
  className
}: PageHeaderProps) {
  return (
    <div className={cn('animate-fade-in-up', className)}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1
            className={cn(
              'text-2xl md:text-3xl font-bold tracking-tight',
              gradient ? 'text-gradient-primary' : 'text-foreground'
            )}
          >
            {title}
          </h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {children}
      </div>
    </div>
  )
}
