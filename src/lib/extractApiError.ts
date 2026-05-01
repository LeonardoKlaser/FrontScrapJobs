import { isAxiosError } from 'axios'

/**
 * Extrai mensagem de erro útil de um axios error, propagando o `error` que o
 * backend retorna (4xx/5xx) em vez do genérico "Request failed with status N".
 * Retorna fallback quando o erro não é axios ou não tem resposta estruturada.
 */
export function extractApiError(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    const data = err.response?.data
    if (data && typeof data === 'object' && 'error' in data) {
      const e = (data as { error?: unknown }).error
      if (typeof e === 'string' && e.trim().length > 0) return e
    }
    if (err.message) return err.message
  }
  if (err instanceof Error && err.message) return err.message
  return fallback
}
