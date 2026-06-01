import { getPageItems } from '@/components/common/pagination'

describe('getPageItems', () => {
  it('returns a single page when totalPages is 1', () => {
    expect(getPageItems(1, 1)).toEqual([1])
  })

  it('shows every page without ellipsis when they fit', () => {
    expect(getPageItems(3, 5)).toEqual([1, 2, 3, 4, 5])
  })

  it('inserts a single hidden page instead of an ellipsis', () => {
    // page 4 de 7: 1->3 esconde só a 2, 5->7 esconde só a 6
    expect(getPageItems(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('shows a trailing ellipsis near the start', () => {
    expect(getPageItems(1, 100)).toEqual([1, 2, 'ellipsis', 100])
    expect(getPageItems(2, 100)).toEqual([1, 2, 3, 'ellipsis', 100])
  })

  it('shows both ellipses in the middle', () => {
    expect(getPageItems(50, 100)).toEqual([1, 'ellipsis', 49, 50, 51, 'ellipsis', 100])
  })

  it('shows a leading ellipsis near the end', () => {
    expect(getPageItems(99, 100)).toEqual([1, 'ellipsis', 98, 99, 100])
    expect(getPageItems(100, 100)).toEqual([1, 'ellipsis', 99, 100])
  })
})
