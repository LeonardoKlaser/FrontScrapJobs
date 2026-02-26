import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FilterPills } from '@/components/common/filter-pills'

const options = [
  { key: 'all', label: 'Todos' },
  { key: 'active', label: 'Ativos' },
  { key: 'inactive', label: 'Inativos' }
] as const

describe('FilterPills', () => {
  it('renders all options', () => {
    render(<FilterPills options={options} activeKey="all" onChange={() => {}} />)

    expect(screen.getByText('Todos')).toBeInTheDocument()
    expect(screen.getByText('Ativos')).toBeInTheDocument()
    expect(screen.getByText('Inativos')).toBeInTheDocument()
  })

  it('has tablist role on container', () => {
    render(<FilterPills options={options} activeKey="all" onChange={() => {}} />)
    expect(screen.getByRole('tablist')).toBeInTheDocument()
  })

  it('has tab role on each button', () => {
    render(<FilterPills options={options} activeKey="all" onChange={() => {}} />)
    const tabs = screen.getAllByRole('tab')
    expect(tabs.length).toBe(3)
  })

  it('sets aria-selected true on active key', () => {
    render(<FilterPills options={options} activeKey="active" onChange={() => {}} />)

    const activeTab = screen.getByText('Ativos')
    expect(activeTab).toHaveAttribute('aria-selected', 'true')

    const inactiveTab = screen.getByText('Todos')
    expect(inactiveTab).toHaveAttribute('aria-selected', 'false')
  })

  it('calls onChange with correct key on click', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()

    render(<FilterPills options={options} activeKey="all" onChange={onChange} />)

    await user.click(screen.getByText('Ativos'))

    expect(onChange).toHaveBeenCalledWith('active')
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('applies active styles to selected pill', () => {
    render(<FilterPills options={options} activeKey="all" onChange={() => {}} />)

    const activePill = screen.getByText('Todos')
    expect(activePill.className).toContain('bg-primary/10')
    expect(activePill.className).toContain('text-primary')
  })

  it('applies inactive styles to non-selected pill', () => {
    render(<FilterPills options={options} activeKey="all" onChange={() => {}} />)

    const inactivePill = screen.getByText('Ativos')
    expect(inactivePill.className).toContain('text-muted-foreground')
  })
})
