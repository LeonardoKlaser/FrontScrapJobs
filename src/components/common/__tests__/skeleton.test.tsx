import { render } from '@testing-library/react'
import { Skeleton, SkeletonCard, SkeletonTable } from '@/components/common/skeleton'

describe('Skeleton', () => {
  it('renders with default classes', () => {
    const { container } = render(<Skeleton />)
    expect(container.firstChild).toHaveClass('animate-shimmer')
    expect(container.firstChild).toHaveClass('rounded-md')
  })

  it('applies custom className', () => {
    const { container } = render(<Skeleton className="h-4 w-24" />)
    expect(container.firstChild).toHaveClass('h-4')
    expect(container.firstChild).toHaveClass('w-24')
  })
})

describe('SkeletonCard', () => {
  it('renders card structure', () => {
    const { container } = render(<SkeletonCard />)
    expect(container.firstChild).toHaveClass('rounded-lg')
    expect(container.firstChild).toHaveClass('border')

    const skeletons = container.querySelectorAll('.animate-shimmer')
    expect(skeletons.length).toBeGreaterThanOrEqual(2)
  })

  it('applies custom className', () => {
    const { container } = render(<SkeletonCard className="custom" />)
    expect(container.firstChild).toHaveClass('custom')
  })
})

describe('SkeletonTable', () => {
  it('renders 3 rows by default', () => {
    const { container } = render(<SkeletonTable />)
    const rows = container.querySelectorAll('.border-t')
    expect(rows.length).toBe(3)
  })

  it('renders custom number of rows', () => {
    const { container } = render(<SkeletonTable rows={5} />)
    const rows = container.querySelectorAll('.border-t')
    expect(rows.length).toBe(5)
  })

  it('applies custom className', () => {
    const { container } = render(<SkeletonTable className="custom" />)
    expect(container.firstChild).toHaveClass('custom')
  })
})
