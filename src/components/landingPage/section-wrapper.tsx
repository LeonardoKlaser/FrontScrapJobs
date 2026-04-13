import { cn } from '@/lib/utils'

interface SectionWrapperProps {
  children: React.ReactNode
  className?: string
  sidebarClassName?: string
  variant?: 'light' | 'dark'
  id?: string
}

export function SectionWrapper({
  children,
  className,
  sidebarClassName,
  variant = 'light',
  id,
}: SectionWrapperProps) {
  const isDark = variant === 'dark'
  const sidebarBase = isDark ? 'bg-stripes-dark' : 'bg-stripes'
  const contentBg = isDark ? 'bg-zinc-950' : 'bg-white'

  return (
    <section id={id} className="flex gap-[1px]">
      <div
        aria-hidden="true"
        className={cn(
          'hidden lg:block w-[72px] shrink-0',
          sidebarBase,
          sidebarClassName
        )}
      />
      <div className={cn('flex-1 min-w-0', contentBg, className)}>
        {children}
      </div>
      <div
        aria-hidden="true"
        className={cn(
          'hidden lg:block w-[72px] shrink-0',
          sidebarBase,
          sidebarClassName
        )}
      />
    </section>
  )
}
