import { cn } from '@/lib/utils'

interface RegionChipProps {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}

export function RegionChip({ active, onClick, children }: RegionChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-3 py-1 rounded-full text-xs border transition-colors',
        active
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-muted hover:bg-muted/80 border-border'
      )}
    >
      {children}
    </button>
  )
}
