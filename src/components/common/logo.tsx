import { cn } from '@/lib/utils'
import faviconSrc from '@/assets/favicon.jpeg'

interface LogoProps {
  size?: number
  showText?: boolean
  className?: string
  textClassName?: string
  // Texto branco (Scrap + Jobs) pra usar sobre fundos escuros/verdes (ex.: navbar
  // com scroll). Mantem a mesma geometria do logo padrao — so muda a cor.
  inverted?: boolean
}

export function Logo({
  size = 32,
  showText = false,
  className,
  textClassName,
  inverted = false
}: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <LogoMark size={size} />
      {showText && (
        <span
          className={cn(
            'font-display font-bold tracking-tight',
            inverted ? 'text-white' : 'text-foreground',
            textClassName
          )}
          style={{ fontSize: size * 0.65 }}
        >
          Scrap<span className={inverted ? 'text-white' : 'text-primary'}>Jobs</span>
        </span>
      )}
    </div>
  )
}

export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <img
      src={faviconSrc}
      alt="ScrapJobs"
      width={size}
      height={size}
      className={cn('shrink-0 rounded', className)}
    />
  )
}
