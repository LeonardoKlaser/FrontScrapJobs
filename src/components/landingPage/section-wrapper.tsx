import { cn } from '@/lib/utils'

interface SectionWrapperProps {
  children: React.ReactNode
  className?: string
  id?: string
}

export function SectionWrapper({ children, className, id }: SectionWrapperProps) {
  return (
    <section id={id}>
      <div className={cn('flex-1 min-w-0 bg-white', className)}>{children}</div>
    </section>
  )
}
