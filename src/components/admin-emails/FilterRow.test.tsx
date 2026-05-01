import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { FilterRow, defaultValueFor } from './FilterRow'
import type { SegmentField } from '@/models/email'

const fields: SegmentField[] = [
  { name: 'plan_id', type: 'int', description: 'Plano' },
  { name: 'plan_name', type: 'string', description: 'Nome plano' },
  { name: 'is_admin', type: 'bool', description: 'Admin?' },
  { name: 'expires_at', type: 'timestamp', description: 'Expira em' },
  { name: 'payment_method', type: 'enum', description: 'Pgto' }
]

describe('FilterRow — between', () => {
  it('renderiza 2 inputs com placeholders início/fim e value de cada lado', () => {
    render(
      <FilterRow
        fields={fields}
        value={{ field: 'plan_id', op: 'between', value: [1, 5] }}
        onChange={() => {}}
      />
    )
    expect(screen.getByPlaceholderText('início')).toHaveValue(1)
    expect(screen.getByPlaceholderText('fim')).toHaveValue(5)
  })

  it('mantém primeiro valor ao alterar segundo (array preservado)', () => {
    const onChange = vi.fn()
    render(
      <FilterRow
        fields={fields}
        value={{ field: 'plan_id', op: 'between', value: [1, 5] }}
        onChange={onChange}
      />
    )
    fireEvent.change(screen.getByPlaceholderText('fim'), { target: { value: '10' } })
    expect(onChange).toHaveBeenCalledWith({
      field: 'plan_id',
      op: 'between',
      value: [1, 10]
    })
  })

  it('coage strings pra number em fields int', () => {
    const onChange = vi.fn()
    render(
      <FilterRow
        fields={fields}
        value={{ field: 'plan_id', op: 'between', value: [0, 0] }}
        onChange={onChange}
      />
    )
    fireEvent.change(screen.getByPlaceholderText('início'), { target: { value: '7' } })
    const last = onChange.mock.calls.at(-1)?.[0]
    expect(last.value[0]).toBe(7)
    expect(typeof last.value[0]).toBe('number')
  })
})

describe('FilterRow — in/not_in', () => {
  it('renderiza CSV input com array stringificado', () => {
    render(
      <FilterRow
        fields={fields}
        value={{ field: 'plan_id', op: 'in', value: [1, 2, 3] }}
        onChange={() => {}}
      />
    )
    expect(screen.getByLabelText('lista de valores')).toHaveValue('1, 2, 3')
  })

  it('CSV em int field converte cada elemento pra number', () => {
    const onChange = vi.fn()
    render(
      <FilterRow
        fields={fields}
        value={{ field: 'plan_id', op: 'in', value: [] }}
        onChange={onChange}
      />
    )
    fireEvent.change(screen.getByLabelText('lista de valores'), {
      target: { value: '4, 5, 6' }
    })
    expect(onChange).toHaveBeenCalledWith({
      field: 'plan_id',
      op: 'in',
      value: [4, 5, 6]
    })
  })

  it('CSV em string field mantém strings', () => {
    const onChange = vi.fn()
    render(
      <FilterRow
        fields={fields}
        value={{ field: 'plan_name', op: 'in', value: [] }}
        onChange={onChange}
      />
    )
    fireEvent.change(screen.getByLabelText('lista de valores'), {
      target: { value: 'Gold, Silver' }
    })
    expect(onChange).toHaveBeenCalledWith({
      field: 'plan_name',
      op: 'in',
      value: ['Gold', 'Silver']
    })
  })

  it('CSV vazio gera array vazio (não array de uma string vazia)', () => {
    const onChange = vi.fn()
    render(
      <FilterRow
        fields={fields}
        value={{ field: 'plan_id', op: 'in', value: [1] }}
        onChange={onChange}
      />
    )
    fireEvent.change(screen.getByLabelText('lista de valores'), { target: { value: '' } })
    expect(onChange).toHaveBeenCalledWith({
      field: 'plan_id',
      op: 'in',
      value: []
    })
  })
})

describe('FilterRow — coerção scalar', () => {
  it('int field renderiza input type=number e coage onChange', () => {
    const onChange = vi.fn()
    render(
      <FilterRow
        fields={fields}
        value={{ field: 'plan_id', op: '=', value: 0 }}
        onChange={onChange}
      />
    )
    const input = screen.getByPlaceholderText('valor') as HTMLInputElement
    expect(input.type).toBe('number')
    fireEvent.change(input, { target: { value: '42' } })
    expect(onChange).toHaveBeenCalledWith({ field: 'plan_id', op: '=', value: 42 })
  })

  it('int field aceita input vazio temporariamente como string vazia', () => {
    const onChange = vi.fn()
    render(
      <FilterRow
        fields={fields}
        value={{ field: 'plan_id', op: '=', value: 5 }}
        onChange={onChange}
      />
    )
    fireEvent.change(screen.getByPlaceholderText('valor'), { target: { value: '' } })
    expect(onChange).toHaveBeenCalledWith({ field: 'plan_id', op: '=', value: '' })
  })

  it('timestamp field renderiza input type=datetime-local', () => {
    render(
      <FilterRow
        fields={fields}
        value={{ field: 'expires_at', op: '>', value: '' }}
        onChange={() => {}}
      />
    )
    const input = screen.getByPlaceholderText('valor') as HTMLInputElement
    expect(input.type).toBe('datetime-local')
  })

  it('timestamp field converte datetime-local pra ISO string no onChange', () => {
    const onChange = vi.fn()
    render(
      <FilterRow
        fields={fields}
        value={{ field: 'expires_at', op: '>', value: '' }}
        onChange={onChange}
      />
    )
    fireEvent.change(screen.getByPlaceholderText('valor'), {
      target: { value: '2026-12-31T23:59' }
    })
    const last = onChange.mock.calls.at(-1)?.[0]
    expect(typeof last.value).toBe('string')
    expect(last.value).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/)
  })

  it('string field mantém input texto e value string', () => {
    const onChange = vi.fn()
    render(
      <FilterRow
        fields={fields}
        value={{ field: 'plan_name', op: 'contains', value: '' }}
        onChange={onChange}
      />
    )
    const input = screen.getByPlaceholderText('valor') as HTMLInputElement
    expect(input.type).toBe('text')
    fireEvent.change(input, { target: { value: 'Gold' } })
    expect(onChange).toHaveBeenCalledWith({
      field: 'plan_name',
      op: 'contains',
      value: 'Gold'
    })
  })
})

describe('FilterRow — is_null/is_not_null', () => {
  it('não renderiza input de valor pra is_null', () => {
    render(
      <FilterRow fields={fields} value={{ field: 'plan_id', op: 'is_null' }} onChange={() => {}} />
    )
    expect(screen.queryByPlaceholderText('valor')).toBeNull()
    expect(screen.queryByLabelText('lista de valores')).toBeNull()
    expect(screen.queryByPlaceholderText('início')).toBeNull()
  })
})

describe('defaultValueFor', () => {
  it('between em int retorna [0, 0]', () => {
    expect(defaultValueFor('between', 'int')).toEqual([0, 0])
  })

  it('between em timestamp retorna ["", ""]', () => {
    expect(defaultValueFor('between', 'timestamp')).toEqual(['', ''])
  })

  it('in/not_in retornam array vazio', () => {
    expect(defaultValueFor('in', 'int')).toEqual([])
    expect(defaultValueFor('not_in', 'string')).toEqual([])
  })

  it('is_null/is_not_null retornam undefined', () => {
    expect(defaultValueFor('is_null', 'int')).toBeUndefined()
    expect(defaultValueFor('is_not_null', 'bool')).toBeUndefined()
  })

  it('= em int retorna 0', () => {
    expect(defaultValueFor('=', 'int')).toBe(0)
  })

  it('= em bool retorna true', () => {
    expect(defaultValueFor('=', 'bool')).toBe(true)
  })

  it('= em string retorna string vazia', () => {
    expect(defaultValueFor('=', 'string')).toBe('')
  })
})
