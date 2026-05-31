export interface PaginationResult<T> {
  pageItems: T[]
  safePage: number
  totalPages: number
}

// Pagina uma lista no client. safePage e sempre clampado para [1, totalPages]
// — isso evita o usuario ficar "preso" numa pagina fora do range quando o
// conjunto filtrado encolhe (ex.: refetch em background reduz as vagas).
export function paginate<T>(items: T[], page: number, limit: number): PaginationResult<T> {
  const totalPages = Math.max(1, Math.ceil(items.length / limit))
  const safePage = Math.min(Math.max(page, 1), totalPages)
  const start = (safePage - 1) * limit
  return {
    pageItems: items.slice(start, start + limit),
    safePage,
    totalPages
  }
}
