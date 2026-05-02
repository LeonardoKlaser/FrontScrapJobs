import { useMemo } from 'react'
import { parseExpression } from 'cron-parser'
import { Input } from '@/components/ui/input'

interface Props {
  value: string
  onChange: (next: string) => void
  timezone?: string
  label?: string
}

interface CronParseResult {
  next5: Date[]
  parseError: string | null
}

export function CronExpressionInput({
  value,
  onChange,
  timezone = 'America/Sao_Paulo',
  label
}: Props) {
  const { next5, parseError } = useMemo<CronParseResult>(() => {
    if (!value) return { next5: [], parseError: null }
    try {
      const it = parseExpression(value, { tz: timezone })
      return {
        next5: Array.from({ length: 5 }, () => it.next().toDate()),
        parseError: null
      }
    } catch (e) {
      // Capturar a mensagem do parser (ex: "Constraint error, got value 99
      // expected range 0-59") em vez de só "Cron inválido" — sem isso o admin
      // só vê borda vermelha e não sabe o que ajustar.
      const msg = e instanceof Error ? e.message : String(e)
      return { next5: [], parseError: msg }
    }
  }, [value, timezone])

  const isInvalid = parseError !== null

  return (
    <div className="space-y-1">
      {label && <label className="text-sm font-medium">{label}</label>}
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0 9 * * *"
        className={isInvalid ? 'border-destructive' : ''}
        aria-invalid={isInvalid}
      />
      {isInvalid && <p className="text-xs text-destructive">Cron inválido: {parseError}</p>}
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
