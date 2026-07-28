import { isAxiosError } from 'axios'

// Slugs de erro que o backend de /api/curriculum-files devolve em
// `error.response.data.error` (ver Task 5, controller de curriculum-files).
// Cada slug mapeia 1:1 pra uma chave em curriculum.errors.<slug> (PT + EN).
// Slugs desconhecidos (rede, 5xx sem body, etc.) caem no fallback
// internal_error em vez de vazar uma mensagem crua pra UI.
const KNOWN_ERROR_SLUGS = new Set([
  'invalid_format',
  'too_large',
  'limit_reached',
  'not_found',
  'invalid_id',
  'storage_unavailable',
  'internal_error'
])

export function curriculumFileErrorKey(err: unknown): string {
  if (isAxiosError(err)) {
    const slug = err.response?.data?.error
    if (typeof slug === 'string' && KNOWN_ERROR_SLUGS.has(slug)) {
      return `errors.${slug}`
    }
  }
  return 'errors.internal_error'
}
