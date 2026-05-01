import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { SegmentFilter, SegmentField, SegmentGroup, SegmentLeaf } from '@/models/email'
import { FilterRow } from './FilterRow'

interface FilterBuilderProps {
  fields: SegmentField[]
  value: SegmentFilter
  onChange: (next: SegmentFilter) => void
  depth?: number
  maxDepth?: number
}

function isGroup(value: SegmentFilter): value is SegmentGroup {
  return 'op' in value && (value.op === 'AND' || value.op === 'OR')
}

export function FilterBuilder({
  fields,
  value,
  onChange,
  depth = 1,
  maxDepth = 3
}: FilterBuilderProps) {
  if (!isGroup(value)) {
    return (
      <FilterRow fields={fields} value={value} onChange={onChange as (v: SegmentLeaf) => void} />
    )
  }

  const group = value
  const updateChild = (idx: number, next: SegmentFilter) => {
    onChange({
      ...group,
      filters: group.filters.map((f, i) => (i === idx ? next : f))
    })
  }
  const removeChild = (idx: number) => {
    onChange({ ...group, filters: group.filters.filter((_, i) => i !== idx) })
  }
  const addLeaf = () => {
    if (fields.length === 0) return
    const newLeaf: SegmentLeaf = {
      field: fields[0].name,
      op: '=',
      value: ''
    }
    onChange({ ...group, filters: [...group.filters, newLeaf] })
  }
  const addGroup = (op: 'AND' | 'OR') => {
    if (depth >= maxDepth) return
    onChange({ ...group, filters: [...group.filters, { op, filters: [] }] })
  }
  const toggleOp = () => {
    onChange({ ...group, op: group.op === 'AND' ? 'OR' : 'AND' })
  }

  return (
    <Card className="border-dashed">
      <CardContent className="p-3 space-y-2">
        <Button variant="outline" size="sm" onClick={toggleOp}>
          {group.op}
        </Button>
        {group.filters.map((f, i) => (
          <div key={i} className="flex items-start gap-2">
            <FilterBuilder
              fields={fields}
              value={f}
              onChange={(next) => updateChild(i, next)}
              depth={depth + 1}
              maxDepth={maxDepth}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeChild(i)}
              aria-label="remover filtro"
            >
              ×
            </Button>
          </div>
        ))}
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={addLeaf}>
            + Filtro
          </Button>
          {depth < maxDepth && (
            <>
              <Button size="sm" variant="secondary" onClick={() => addGroup('AND')}>
                + Grupo AND
              </Button>
              <Button size="sm" variant="secondary" onClick={() => addGroup('OR')}>
                + Grupo OR
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// normalizeFilter remove empty groups antes de submit. Backend rejeita
// grupos vazios — UI permite construir, mas normaliza no envio.
// Colapsa grupos com 1 filho (group → seu único filho).
// Retorna null se filter inteiro normaliza pra vazio (caller decide se
// envia null ou aborta).
export function normalizeFilter(filter: SegmentFilter): SegmentFilter | null {
  if (!isGroup(filter)) {
    return filter
  }
  const cleaned = filter.filters.map(normalizeFilter).filter((f): f is SegmentFilter => f !== null)
  if (cleaned.length === 0) return null
  if (cleaned.length === 1) return cleaned[0]
  return { ...filter, filters: cleaned }
}
