import { useEffect, useState, useRef } from 'react'

export interface ViaCepResponse {
  cep: string
  logradouro: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

export type CepLookupError = 'not_found' | 'network' | null

export interface CepLookupResult {
  data: ViaCepResponse | null
  isLoading: boolean
  error: CepLookupError
}

const VIACEP_TIMEOUT_MS = 3000

interface PendingRequest {
  controller: AbortController
  timeoutId: ReturnType<typeof setTimeout>
}

const IDLE_STATE: CepLookupResult = { data: null, isLoading: false, error: null }

function isViaCepBody(body: unknown): body is ViaCepResponse {
  return typeof body === 'object' && body !== null && !Array.isArray(body) && 'cep' in body
}

export function useCepLookup(cep: string, debounceMs = 300): CepLookupResult {
  const [state, setState] = useState<CepLookupResult>(IDLE_STATE)
  const pendingRef = useRef<PendingRequest | null>(null)

  function cancelPending() {
    if (pendingRef.current) {
      clearTimeout(pendingRef.current.timeoutId)
      pendingRef.current.controller.abort()
      pendingRef.current = null
    }
  }

  useEffect(() => {
    const digits = cep.replace(/\D/g, '')

    if (digits.length !== 8) {
      cancelPending()
      // Skip setState se já está em estado idle pra evitar render extra
      setState((prev) =>
        prev.data === null && !prev.isLoading && prev.error === null ? prev : IDLE_STATE
      )
      return
    }

    const debounceHandle = setTimeout(() => {
      cancelPending()
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), VIACEP_TIMEOUT_MS)
      pendingRef.current = { controller, timeoutId }

      setState({ data: null, isLoading: true, error: null })

      fetch(`https://viacep.com.br/ws/${digits}/json/`, { signal: controller.signal })
        .then((res) => {
          if (!res.ok) throw new Error(`viacep_http_${res.status}`)
          return res.json() as Promise<unknown>
        })
        .then((body) => {
          clearTimeout(timeoutId)
          if (controller.signal.aborted) return
          if (!isViaCepBody(body)) {
            setState({ data: null, isLoading: false, error: 'not_found' })
            return
          }
          if (body.erro || !body.cep) {
            setState({ data: null, isLoading: false, error: 'not_found' })
            return
          }
          setState({ data: body, isLoading: false, error: null })
        })
        .catch((err) => {
          clearTimeout(timeoutId)
          // Abort = cancelamento intencional (debounce/unmount), não é erro.
          if (controller.signal.aborted || err?.name === 'AbortError') return
          console.error('cep lookup failed', err)
          setState({ data: null, isLoading: false, error: 'network' })
        })
    }, debounceMs)

    return () => {
      clearTimeout(debounceHandle)
    }
  }, [cep, debounceMs])

  useEffect(() => {
    return () => cancelPending()
  }, [])

  return state
}
