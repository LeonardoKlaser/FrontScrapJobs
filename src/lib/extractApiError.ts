import { isAxiosError } from 'axios'

// Padrões de mensagens axios cruas que não devem ser mostradas ao usuário —
// quando o backend não retornou body estruturado ou a falha é de rede/CORS,
// preferimos o fallback localizado.
const GENERIC_AXIOS_PATTERNS = [
  /^Request failed with status code \d+$/,
  /^Network Error$/,
  /^timeout of \d+ms exceeded$/i,
  /^Request aborted$/
]

/**
 * Extrai mensagem de erro útil de um axios error, propagando o `error` que o
 * backend retorna (4xx/5xx) em vez do genérico "Request failed with status N".
 * Em 5xx ou network/CORS, prefere fallback localizado a vazar a mensagem axios.
 */
export function extractApiError(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    const data = err.response?.data
    if (data && typeof data === 'object' && 'error' in data) {
      const e = (data as { error?: unknown }).error
      if (typeof e === 'string' && e.trim().length > 0) return e
    }
    const status = err.response?.status ?? 0
    // 5xx ou ausência de response (network/CORS) → fallback. Backend body já
    // foi tentado acima; se chegou aqui, não há mensagem estruturada útil.
    if (status >= 500 || !err.response) return fallback
    // 4xx sem body estruturado: preferir fallback se a mensagem do axios for
    // genérica (sem signal pro usuário), senão deixar passar.
    if (err.message && !GENERIC_AXIOS_PATTERNS.some((re) => re.test(err.message))) {
      return err.message
    }
    return fallback
  }
  if (err instanceof Error && err.message) return err.message
  return fallback
}
