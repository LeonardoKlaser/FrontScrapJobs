import { isAxiosError } from 'axios'

// Padrões de mensagens axios cruas em inglês que NÃO devem vazar pra UI —
// quando backend não retornou body estruturado ou a falha é de rede/CORS,
// preferimos fallback localizado. Aplicado em ambos os branches (axios error
// + Error genérico) porque axios pode re-throw como Error plano em adapter
// errors / abort, escapando do guard isAxiosError.
const GENERIC_AXIOS_PATTERNS = [
  /^Request failed with status code \d+/i,
  /^Network Error$/i,
  /^timeout of \d+ms exceeded$/i,
  /^Request aborted$/i
]

function isGenericAxiosMessage(msg: string): boolean {
  return GENERIC_AXIOS_PATTERNS.some((re) => re.test(msg))
}

/**
 * Extrai mensagem de erro útil de um axios error, propagando o `error` que o
 * backend retorna em vez do genérico "Request failed with status N".
 *
 * Política: o backend sempre retorna `{ error: "..." }` em erros validados
 * (4xx/5xx). Se o body tem `error` string não-vazio, usa. Caso contrário
 * (network/CORS, 5xx sem body, body inesperado, axios re-thrown como Error)
 * usa fallback localizado em vez de vazar a mensagem axios em inglês.
 */
export function extractApiError(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    const data = err.response?.data
    if (data && typeof data === 'object' && 'error' in data) {
      const e = (data as { error?: unknown }).error
      if (typeof e === 'string' && e.trim().length > 0) return e
    }
    return fallback
  }
  if (err instanceof Error && err.message) {
    if (isGenericAxiosMessage(err.message)) return fallback
    return err.message
  }
  return fallback
}
