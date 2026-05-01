import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { emailSegmentService } from '@/services/emailSegmentService'
import type { SegmentFilter } from '@/models/email'
import { extractApiError } from '@/lib/extractApiError'

export const useSegmentSchema = (scope: 'users' | 'event_payload', eventName?: string) =>
  useQuery({
    queryKey: ['emailSegmentSchema', scope, eventName ?? null],
    queryFn: () => emailSegmentService.getSchema(scope, eventName),
    staleTime: 5 * 60 * 1000
  })

// useAudiencePreview é interno do hook composto abaixo. Não exportado pra evitar
// duplicação de mutations no provider de query.
const useAudiencePreview = () =>
  useMutation({
    mutationFn: (filter: SegmentFilter) => emailSegmentService.previewCount(filter)
  })

interface DebouncedAudiencePreviewState {
  count: number | null
  truncated: boolean
  error: string | null
  isLoading: boolean
  refresh: () => void
}

/**
 * useDebouncedAudiencePreview encapsula o pattern: dado um filtro semantico,
 * dispara previewCount após debounce e expõe count/truncated/error/refresh.
 *
 * normalize é uma função que valida + transforma o filter (ex: dropa grupos
 * vazios). debounceMs=0 desabilita debounce (auto-fetch off, só refresh manual).
 *
 * Race control: cada chamada incrementa um seq ref. Se a callback (success/error)
 * de uma mutation chega depois que o filtro mudou (seq stale), descartamos —
 * evita display de count antigo mesmo após o user já ter editado o filtro.
 *
 * Unmount: isMounted ref bloqueia setState pós-unmount caso a mutation resolve
 * depois do componente sumir. TanStack Query v5 não cancela mutations em
 * unmount automaticamente, então o guard é necessário.
 */
export const useDebouncedAudiencePreview = (
  filter: SegmentFilter,
  normalize: (f: SegmentFilter) => SegmentFilter | null,
  debounceMs: number = 500
): DebouncedAudiencePreviewState => {
  const previewMut = useAudiencePreview()
  const [count, setCount] = useState<number | null>(null)
  const [truncated, setTruncated] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const seqRef = useRef(0)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const filterKey = useMemo(() => JSON.stringify(filter), [filter])

  const run = () => {
    const normalized = normalize(filter)
    if (!normalized) {
      if (!isMountedRef.current) return
      setCount(null)
      setError('Filtro vazio')
      return
    }
    seqRef.current += 1
    const seq = seqRef.current
    previewMut.mutate(normalized, {
      onSuccess: (data) => {
        if (!isMountedRef.current || seq !== seqRef.current) return
        setCount(data.count)
        setTruncated(Boolean(data.truncated))
        setError(null)
      },
      onError: (err: unknown) => {
        if (!isMountedRef.current || seq !== seqRef.current) return
        setCount(null)
        setTruncated(false)
        setError(extractApiError(err, 'Erro ao avaliar filtro'))
      }
    })
  }

  useEffect(() => {
    if (!debounceMs) return
    const handle = setTimeout(run, debounceMs)
    return () => clearTimeout(handle)
    // filterKey é o gatilho semântico (filter mudou); previewMut.mutate é
    // estável (TanStack Query v5) e adicionar `run` geraria loop quando
    // mutate atualiza isPending → re-render.
  }, [filterKey, debounceMs])

  return {
    count,
    truncated,
    error,
    isLoading: previewMut.isPending,
    refresh: run
  }
}
