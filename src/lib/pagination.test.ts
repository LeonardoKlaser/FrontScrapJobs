import { describe, it, expect } from 'vitest'
import { paginate } from './pagination'

const items = Array.from({ length: 25 }, (_, i) => i + 1)

describe('paginate', () => {
  it('fatia a primeira pagina e calcula totalPages com ceil', () => {
    const { pageItems, safePage, totalPages } = paginate(items, 1, 10)
    expect(pageItems).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    expect(safePage).toBe(1)
    expect(totalPages).toBe(3)
  })

  it('fatia uma pagina do meio', () => {
    expect(paginate(items, 2, 10).pageItems).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20])
  })

  it('fatia a ultima pagina parcial', () => {
    const { pageItems, safePage } = paginate(items, 3, 10)
    expect(pageItems).toEqual([21, 22, 23, 24, 25])
    expect(safePage).toBe(3)
  })

  it('clampa page acima de totalPages para a ultima pagina (evita ficar "preso")', () => {
    const { pageItems, safePage, totalPages } = paginate(items, 99, 10)
    expect(safePage).toBe(3)
    expect(totalPages).toBe(3)
    expect(pageItems).toEqual([21, 22, 23, 24, 25])
  })

  it('clampa page abaixo de 1 para a primeira pagina', () => {
    expect(paginate(items, 0, 10).safePage).toBe(1)
    expect(paginate(items, -5, 10).safePage).toBe(1)
  })

  it('lista vazia: totalPages 1, safePage 1, sem itens', () => {
    const { pageItems, safePage, totalPages } = paginate([], 1, 10)
    expect(pageItems).toEqual([])
    expect(safePage).toBe(1)
    expect(totalPages).toBe(1)
  })
})
