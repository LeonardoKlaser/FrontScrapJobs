import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { FilterBuilder, normalizeFilter } from './FilterBuilder'
import type { SegmentField, SegmentFilter } from '@/models/email'

const fields: SegmentField[] = [
  { name: 'plan_id', type: 'int', description: 'Plano' },
  { name: 'payment_method', type: 'enum', description: 'Método pgto' }
]

describe('FilterBuilder', () => {
  it('renderiza grupo AND com 1 leaf inicial', () => {
    const value: SegmentFilter = {
      op: 'AND',
      filters: [{ field: 'plan_id', op: '=', value: 1 }]
    }
    render(<FilterBuilder fields={fields} value={value} onChange={() => {}} />)
    expect(screen.getByText('AND')).toBeInTheDocument()
  })

  it('toggle op AND ↔ OR via click no botão de op', () => {
    const onChange = vi.fn()
    const value: SegmentFilter = { op: 'AND', filters: [] }
    render(<FilterBuilder fields={fields} value={value} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'AND' }))
    expect(onChange).toHaveBeenCalledWith({ op: 'OR', filters: [] })
  })

  it('respeita maxDepth — não renderiza "+ Grupo" no nível máximo', () => {
    const value: SegmentFilter = { op: 'AND', filters: [] }
    render(
      <FilterBuilder fields={fields} value={value} onChange={() => {}} depth={3} maxDepth={3} />
    )
    expect(screen.queryByText('+ Grupo AND')).toBeNull()
    expect(screen.queryByText('+ Grupo OR')).toBeNull()
  })

  it('+ Filtro adiciona leaf com primeiro field e op =', () => {
    const onChange = vi.fn()
    const value: SegmentFilter = { op: 'AND', filters: [] }
    render(<FilterBuilder fields={fields} value={value} onChange={onChange} />)
    fireEvent.click(screen.getByText('+ Filtro'))
    expect(onChange).toHaveBeenCalledWith({
      op: 'AND',
      filters: [{ field: 'plan_id', op: '=', value: '' }]
    })
  })

  it('+ Grupo AND adiciona group vazio', () => {
    const onChange = vi.fn()
    const value: SegmentFilter = { op: 'AND', filters: [] }
    render(<FilterBuilder fields={fields} value={value} onChange={onChange} />)
    fireEvent.click(screen.getByText('+ Grupo AND'))
    expect(onChange).toHaveBeenCalledWith({
      op: 'AND',
      filters: [{ op: 'AND', filters: [] }]
    })
  })
})

describe('normalizeFilter', () => {
  it('retorna leaf inalterada', () => {
    const leaf: SegmentFilter = { field: 'plan_id', op: '=', value: 1 }
    expect(normalizeFilter(leaf)).toEqual(leaf)
  })

  it('retorna null para grupo vazio', () => {
    const empty: SegmentFilter = { op: 'AND', filters: [] }
    expect(normalizeFilter(empty)).toBeNull()
  })

  it('colapsa grupo com 1 filho no próprio filho', () => {
    const single: SegmentFilter = {
      op: 'AND',
      filters: [{ field: 'plan_id', op: '=', value: 1 }]
    }
    expect(normalizeFilter(single)).toEqual({
      field: 'plan_id',
      op: '=',
      value: 1
    })
  })

  it('mantém grupo com 2+ filhos', () => {
    const two: SegmentFilter = {
      op: 'OR',
      filters: [
        { field: 'plan_id', op: '=', value: 1 },
        { field: 'plan_id', op: '=', value: 2 }
      ]
    }
    expect(normalizeFilter(two)).toEqual(two)
  })

  it('strip recursivo de grupos vazios aninhados', () => {
    const nested: SegmentFilter = {
      op: 'AND',
      filters: [
        { field: 'plan_id', op: '=', value: 1 },
        { op: 'OR', filters: [] }
      ]
    }
    // Grupo OR vazio strip; AND fica com 1 → colapsa pro leaf
    expect(normalizeFilter(nested)).toEqual({ field: 'plan_id', op: '=', value: 1 })
  })
})
