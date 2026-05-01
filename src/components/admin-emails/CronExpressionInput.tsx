import { useMemo } from 'react'
import { parseExpression } from 'cron-parser'
import { Input } from '@/components/ui/input'

interface Props {
  value: string
  onChange: (next: string) => void
  timezone?: string
  label?: string
}

export function CronExpressionInput({
  value,
  onChange,
  timezone = 'America/Sao_Paulo',
  label
}: Props) {
  const next5 = useMemo(() => {
    if (!value) return [] as Date[]
    try {
      const it = parseExpression(value, { tz: timezone })
      return Array.from({ length: 5 }, () => it.next().toDate())
    } catch {
      return []
    }
  }, [value, timezone])

  const isInvalid = value !== '' && next5.length === 0

  return (
    <div className="space-y-1">
      {label && <label className="text-sm font-medium">{label}</label>}
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0 9 * * *"
        className={isInvalid ? 'border-destructive' : ''}
      />
      {isInvalid && <p className="text-xs text-destructive">Cron inválido</p>}
      {next5.length > 0 && (
        <div className="text-xs text-muted-foreground">
          <p className="font-medium mb-1">Próximas 5 execuções ({timezone}):</p>
          <ul className="space-y-0.5">
            {next5.map((d, i) => (
              <li key={i}>• {d.toLocaleString('pt-BR')}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
