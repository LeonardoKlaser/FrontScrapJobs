import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useDebouncedAudiencePreview } from '@/hooks/useEmailSegment'
import { normalizeFilter } from './FilterBuilder'
import type { SegmentFilter } from '@/models/email'

interface Props {
  filter: SegmentFilter
  // debounce ms; if 0, manual refresh only
  debounceMs?: number
}

function formatRelative(ts: number): string {
  const sec = Math.floor((Date.now() - ts) / 1000)
  if (sec < 5) return 'agora'
  if (sec < 60) return `${sec}s atrás`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}min atrás`
  return `${Math.floor(min / 60)}h atrás`
}

export function AudiencePreview({ filter, debounceMs = 500 }: Props) {
  const { count, truncated, error, isLoading, refresh, lastSuccessAt } =
    useDebouncedAudiencePreview(filter, normalizeFilter, debounceMs)

  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          {isLoading ? (
            <p className="text-muted-foreground">Calculando...</p>
          ) : error ? (
            <div>
              <p className="text-destructive text-sm">{error}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Preview falhou — corrija o filtro ou clique em Atualizar.
              </p>
            </div>
          ) : count !== null ? (
            <div>
              <p className="text-2xl font-semibold">
                {count} {count === 1 ? 'usuário casaria' : 'usuários casariam'}
              </p>
              {truncated && (
                <p className="text-xs text-muted-foreground">
                  ⚠️ Resultado truncado — segmento ≥ 100k users. Quebre o filtro pra ver o total.
                </p>
              )}
              {lastSuccessAt && (
                <p className="text-xs text-muted-foreground mt-1">
                  Atualizado {formatRelative(lastSuccessAt)}
                </p>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Aguardando filtro...</p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={refresh}>
          Atualizar
        </Button>
      </CardContent>
    </Card>
  )
}
