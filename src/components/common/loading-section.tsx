import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSectionProps {
  variant?: 'full' | 'section' | 'inline'
  label?: string
}

export function LoadingSection({ variant = 'section', label }: LoadingSectionProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3',
        variant === 'full' && 'min-h-screen',
        variant === 'section' && 'h-64',
        variant === 'inline' && 'py-8'
      )}
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      {label && <p className="text-sm text-muted-foreground animate-fade-in">{label}</p>}
    </div>
  )
}
