import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { StatusBadge } from '../StatusBadge'

describe('StatusBadge', () => {
  it('renderiza label "Rascunho" para status draft', () => {
    render(<StatusBadge status="draft" />)
    expect(screen.getByText('Rascunho')).toBeInTheDocument()
  })

  it('renderiza label "Agendada" para status scheduled', () => {
    render(<StatusBadge status="scheduled" />)
    expect(screen.getByText('Agendada')).toBeInTheDocument()
  })

  it('renderiza label "Enviando" para status sending', () => {
    render(<StatusBadge status="sending" />)
    expect(screen.getByText('Enviando')).toBeInTheDocument()
  })

  it('renderiza label "Enviada" para status sent', () => {
    render(<StatusBadge status="sent" />)
    expect(screen.getByText('Enviada')).toBeInTheDocument()
  })

  it('renderiza label "Falhou" para status failed', () => {
    render(<StatusBadge status="failed" />)
    expect(screen.getByText('Falhou')).toBeInTheDocument()
  })

  it('renderiza label "Cancelada" para status canceled', () => {
    render(<StatusBadge status="canceled" />)
    expect(screen.getByText('Cancelada')).toBeInTheDocument()
  })
})
