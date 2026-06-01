import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { getPageItems, Pagination } from '@/components/common/pagination'

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

describe('Pagination', () => {
  it('disables Previous on the first page', () => {
    render(<Pagination page={1} totalPages={10} onPageChange={() => {}} />)
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Próximo' })).not.toBeDisabled()
  })

  it('disables Next on the last page', () => {
    render(<Pagination page={10} totalPages={10} onPageChange={() => {}} />)
    expect(screen.getByRole('button', { name: 'Próximo' })).toBeDisabled()
  })

  it('renders numbered buttons and ellipses for many pages', () => {
    render(<Pagination page={50} totalPages={100} onPageChange={() => {}} />)
    expect(screen.getByRole('button', { name: 'Página 49' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Página 50' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Página 100' })).toBeInTheDocument()
    expect(screen.getAllByText('…').length).toBeGreaterThan(0)
  })

  it('marks the current page with aria-current', () => {
    render(<Pagination page={50} totalPages={100} onPageChange={() => {}} />)
    expect(screen.getByRole('button', { name: 'Página 50' })).toHaveAttribute(
      'aria-current',
      'page'
    )
    expect(screen.getByRole('button', { name: 'Página 49' })).not.toHaveAttribute('aria-current')
  })

  it('calls onPageChange when a number is clicked', async () => {
    const onPageChange = vi.fn()
    const user = userEvent.setup()
    render(<Pagination page={50} totalPages={100} onPageChange={onPageChange} />)
    await user.click(screen.getByRole('button', { name: 'Página 51' }))
    expect(onPageChange).toHaveBeenCalledWith(51)
  })

  it('has an accessible navigation label', () => {
    render(<Pagination page={1} totalPages={10} onPageChange={() => {}} />)
    expect(screen.getByRole('navigation', { name: 'Paginação' })).toBeInTheDocument()
  })

  it('jumps to a typed page via the Go button', async () => {
    const onPageChange = vi.fn()
    const user = userEvent.setup()
    render(<Pagination page={1} totalPages={100} onPageChange={onPageChange} />)
    await user.type(screen.getByRole('spinbutton', { name: 'Ir para a página' }), '90')
    await user.click(screen.getByRole('button', { name: 'Ir' }))
    expect(onPageChange).toHaveBeenCalledWith(90)
  })

  it('jumps when pressing Enter in the field', async () => {
    const onPageChange = vi.fn()
    const user = userEvent.setup()
    render(<Pagination page={1} totalPages={100} onPageChange={onPageChange} />)
    await user.type(screen.getByRole('spinbutton', { name: 'Ir para a página' }), '42{Enter}')
    expect(onPageChange).toHaveBeenCalledWith(42)
  })

  it('clamps a jump above the last page to totalPages', async () => {
    const onPageChange = vi.fn()
    const user = userEvent.setup()
    render(<Pagination page={1} totalPages={100} onPageChange={onPageChange} />)
    await user.type(screen.getByRole('spinbutton', { name: 'Ir para a página' }), '150')
    await user.click(screen.getByRole('button', { name: 'Ir' }))
    expect(onPageChange).toHaveBeenCalledWith(100)
  })

  it('clamps a jump below 1 to the first page', async () => {
    const onPageChange = vi.fn()
    const user = userEvent.setup()
    render(<Pagination page={5} totalPages={100} onPageChange={onPageChange} />)
    await user.type(screen.getByRole('spinbutton', { name: 'Ir para a página' }), '0')
    await user.click(screen.getByRole('button', { name: 'Ir' }))
    expect(onPageChange).toHaveBeenCalledWith(1)
  })

  it('ignores an empty jump submit', async () => {
    const onPageChange = vi.fn()
    const user = userEvent.setup()
    render(<Pagination page={5} totalPages={100} onPageChange={onPageChange} />)
    await user.click(screen.getByRole('button', { name: 'Ir' }))
    expect(onPageChange).not.toHaveBeenCalled()
  })

  it('clamps a negative jump to the first page', async () => {
    const onPageChange = vi.fn()
    const user = userEvent.setup()
    render(<Pagination page={5} totalPages={100} onPageChange={onPageChange} />)
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Ir para a página' }), {
      target: { value: '-5' }
    })
    await user.click(screen.getByRole('button', { name: 'Ir' }))
    expect(onPageChange).toHaveBeenCalledWith(1)
  })

  it('does not call onPageChange when totalPages is below 1', async () => {
    const onPageChange = vi.fn()
    const user = userEvent.setup()
    render(<Pagination page={1} totalPages={0} onPageChange={onPageChange} />)
    await user.type(screen.getByRole('spinbutton', { name: 'Ir para a página' }), '5')
    await user.click(screen.getByRole('button', { name: 'Ir' }))
    expect(onPageChange).not.toHaveBeenCalled()
  })
})
