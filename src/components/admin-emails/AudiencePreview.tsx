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

export function AudiencePreview({ filter, debounceMs = 800 }: Props) {
  const { count, truncated, error, isLoading, refresh } = useDebouncedAudiencePreview(
    filter,
    normalizeFilter,
    debounceMs
  )

  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          {isLoading ? (
            <p className="text-muted-foreground">Calculando...</p>
          ) : error ? (
            <p className="text-destructive text-sm">{error}</p>
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
