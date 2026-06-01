// Sequência de páginas a exibir: números + 'ellipsis' para gaps de 2+ páginas.
// siblingCount = quantas páginas mostrar de cada lado da atual.
export function getPageItems(
  page: number,
  totalPages: number,
  siblingCount = 1
): (number | 'ellipsis')[] {
  const anchors = new Set<number>()
  anchors.add(1)
  anchors.add(totalPages)
  for (let p = page - siblingCount; p <= page + siblingCount; p++) {
    if (p >= 1 && p <= totalPages) anchors.add(p)
  }

  const sorted = [...anchors].sort((a, b) => a - b)
  const items: (number | 'ellipsis')[] = []
  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i]
    items.push(current)
    const next = sorted[i + 1]
    if (next === undefined) continue
    const diff = next - current
    if (diff === 2) {
      items.push(current + 1)
    } else if (diff > 2) {
      items.push('ellipsis')
    }
  }
  return items
}
