import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAudiencePreview } from '@/hooks/useEmailSegment'
import { normalizeFilter } from './FilterBuilder'
import { extractApiError } from '@/lib/extractApiError'
import type { SegmentFilter } from '@/models/email'

interface Props {
  filter: SegmentFilter
  // debounce ms; if 0, manual refresh only
  debounceMs?: number
}

export function AudiencePreview({ filter, debounceMs = 800 }: Props) {
  const previewMut = useAudiencePreview()
  const [count, setCount] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  // filterKey memoiza o JSON do filtro pra que o useEffect não dispare em cada
  // render (anteriormente JSON.stringify rodava per-render mesmo sem mudança
  // semântica). previewMut é estável (useMutation), não precisa em deps.
  const filterKey = useMemo(() => JSON.stringify(filter), [filter])

  useEffect(() => {
    if (!debounceMs) return
    const handle = setTimeout(() => {
      const normalized = normalizeFilter(filter)
      if (!normalized) {
        setCount(null)
        setError('Filtro vazio')
        return
      }
      previewMut.mutate(normalized, {
        onSuccess: (data) => {
          setCount(data.count)
          setError(null)
        },
        onError: (err: unknown) => {
          setCount(null)
          setError(extractApiError(err, 'Erro ao avaliar filtro'))
        }
      })
    }, debounceMs)
    return () => clearTimeout(handle)
    // filterKey é o gatilho semântico (filter mudou); previewMut é estável e
    // adicioná-lo dispararia loop infinito quando mutate atualiza state do hook.
  }, [filterKey, debounceMs])

  const handleRefresh = () => {
    const normalized = normalizeFilter(filter)
    if (!normalized) {
      setError('Filtro vazio')
      return
    }
    previewMut.mutate(normalized, {
      onSuccess: (data) => {
        setCount(data.count)
        setError(null)
      },
      onError: (err: unknown) => {
        setError(extractApiError(err, 'Erro ao avaliar filtro'))
      }
    })
  }

  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          {previewMut.isPending ? (
            <p className="text-muted-foreground">Calculando...</p>
          ) : error ? (
            <p className="text-destructive text-sm">{error}</p>
          ) : count !== null ? (
            <p className="text-2xl font-semibold">
              {count} {count === 1 ? 'usuário casaria' : 'usuários casariam'}
            </p>
          ) : (
            <p className="text-muted-foreground text-sm">Aguardando filtro...</p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          Atualizar
        </Button>
      </CardContent>
    </Card>
  )
}
