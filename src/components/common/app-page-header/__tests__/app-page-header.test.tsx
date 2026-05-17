import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AppPageHeader } from '@/components/common/app-page-header'

describe('AppPageHeader', () => {
  it('renders title as h1', () => {
    render(<AppPageHeader title="Início" />)
    expect(screen.getByRole('heading', { level: 1, name: 'Início' })).toBeInTheDocument()
  })

  it('renders action children', () => {
    render(
      <AppPageHeader title="Início">
        <button>Adicionar</button>
      </AppPageHeader>
    )
    expect(screen.getByRole('button', { name: 'Adicionar' })).toBeInTheDocument()
  })

  it('renders standalone without SidebarProvider', () => {
    expect(() => render(<AppPageHeader title="X" />)).not.toThrow()
  })
})
