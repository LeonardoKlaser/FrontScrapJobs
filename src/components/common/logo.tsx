import { cn } from '@/lib/utils'

interface LogoProps {
  size?: number
  showText?: boolean
  className?: string
  textClassName?: string
}

export function Logo({ size = 32, showText = false, className, textClassName }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <LogoMark size={size} />
      {showText && (
        <span
          className={cn('font-display font-bold tracking-tight text-foreground', textClassName)}
          style={{ fontSize: size * 0.65 }}
        >
          Scrap<span className="text-primary">Jobs</span>
        </span>
      )}
    </div>
  )
}

export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  const r = size * 0.25

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
    >
      <defs>
        <linearGradient id="sj-bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx={r} fill="url(#sj-bg)" />
      {/* Lightning bolt / S shape */}
      <path
        d="M28 6L14 26h7l-4 16 14-18h-7l4-18z"
        fill="white"
        fillOpacity="0.95"
      />
    </svg>
  )
}
