import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import type { SegmentField, SegmentLeaf, SegmentOperator } from '@/models/email'

type FieldType = SegmentField['type']

const OPS_BY_TYPE: Record<FieldType, SegmentOperator[]> = {
  string: [
    '=',
    '!=',
    'in',
    'not_in',
    'is_null',
    'is_not_null',
    'contains',
    'not_contains',
    'starts_with'
  ],
  int: ['=', '!=', '<', '<=', '>', '>=', 'between', 'in', 'not_in', 'is_null', 'is_not_null'],
  bool: ['=', '!=', 'is_null', 'is_not_null'],
  timestamp: ['=', '!=', '<', '<=', '>', '>=', 'between', 'is_null', 'is_not_null'],
  enum: ['=', '!=', 'in', 'not_in', 'is_null', 'is_not_null']
}

const NO_VALUE_OPS: SegmentOperator[] = ['is_null', 'is_not_null']
const LIST_OPS: SegmentOperator[] = ['in', 'not_in']

// defaultValueFor produz o shape inicial do `value` pro par (op, fieldType).
// Backend rejeita formatos divergentes — between exige [lo,hi] e in/not_in exigem
// array não-vazio. Caller (FilterBuilder.addLeaf, handleFieldChange, handleOpChange)
// usa isto pra evitar value herdado incompatível.
export function defaultValueFor(op: SegmentOperator, type: FieldType): unknown {
  if (NO_VALUE_OPS.includes(op)) return undefined
  if (op === 'between') return type === 'int' ? [0, 0] : ['', '']
  if (LIST_OPS.includes(op)) return []
  if (type === 'int') return 0
  if (type === 'bool') return true
  return ''
}

interface FilterRowProps {
  fields: SegmentField[]
  value: SegmentLeaf
  onChange: (next: SegmentLeaf) => void
}

export function FilterRow({ fields, value, onChange }: FilterRowProps) {
  if (fields.length === 0) {
    return <div className="text-muted-foreground text-sm">Sem campos disponíveis</div>
  }
  const currentField = fields.find((f) => f.name === value.field) ?? fields[0]
  const ops = OPS_BY_TYPE[currentField.type] ?? OPS_BY_TYPE.string

  const handleFieldChange = (name: string) => {
    const next = fields.find((f) => f.name === name) ?? currentField
    const allowed = OPS_BY_TYPE[next.type] ?? OPS_BY_TYPE.string
    const newOp = allowed.includes(value.op) ? value.op : '='
    onChange({ field: name, op: newOp, value: defaultValueFor(newOp, next.type) })
  }

  const handleOpChange = (op: SegmentOperator) => {
    onChange({ ...value, op, value: defaultValueFor(op, currentField.type) })
  }

  return (
    <div className="flex gap-2 items-center flex-wrap">
      <Select value={value.field} onValueChange={handleFieldChange}>
        <SelectTrigger className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {fields.map((f) => (
            <SelectItem key={f.name} value={f.name}>
              {f.description ?? f.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={value.op} onValueChange={(v) => handleOpChange(v as SegmentOperator)}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ops.map((op) => (
            <SelectItem key={op} value={op}>
              {op}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <ValueInput
        op={value.op}
        fieldType={currentField.type}
        value={value.value}
        onChange={(v) => onChange({ ...value, value: v })}
      />
    </div>
  )
}

interface ValueInputProps {
  op: SegmentOperator
  fieldType: FieldType
  value: unknown
  onChange: (v: unknown) => void
}

function ValueInput({ op, fieldType, value, onChange }: ValueInputProps) {
  if (NO_VALUE_OPS.includes(op)) return null

  if (op === 'between') {
    const arr = (Array.isArray(value) ? value : [undefined, undefined]) as [unknown, unknown]
    const update = (idx: 0 | 1, v: unknown) => {
      const next: [unknown, unknown] = [arr[0], arr[1]]
      next[idx] = v
      onChange(next)
    }
    return (
      <>
        <ScalarInput
          fieldType={fieldType}
          value={arr[0]}
          onChange={(v) => update(0, v)}
          placeholder="início"
        />
        <span className="text-muted-foreground text-sm">e</span>
        <ScalarInput
          fieldType={fieldType}
          value={arr[1]}
          onChange={(v) => update(1, v)}
          placeholder="fim"
        />
      </>
    )
  }

  if (LIST_OPS.includes(op)) {
    const arr = Array.isArray(value) ? value : []
    const display = arr.map((v) => (v == null ? '' : String(v))).join(', ')
    return (
      <Input
        value={display}
        onChange={(e) => onChange(parseList(e.target.value, fieldType))}
        className="w-72"
        placeholder="valores separados por vírgula"
        aria-label="lista de valores"
      />
    )
  }

  return <ScalarInput fieldType={fieldType} value={value} onChange={onChange} placeholder="valor" />
}

interface ScalarInputProps {
  fieldType: FieldType
  value: unknown
  onChange: (v: unknown) => void
  placeholder?: string
}

function ScalarInput({ fieldType, value, onChange, placeholder }: ScalarInputProps) {
  if (fieldType === 'bool') {
    const display = value === false ? 'false' : 'true'
    return (
      <Select value={display} onValueChange={(v) => onChange(v === 'true')}>
        <SelectTrigger className="w-32" aria-label="valor booleano">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="true">true</SelectItem>
          <SelectItem value="false">false</SelectItem>
        </SelectContent>
      </Select>
    )
  }

  if (fieldType === 'int') {
    const display =
      typeof value === 'number' ? String(value) : typeof value === 'string' ? value : ''
    return (
      <Input
        type="number"
        value={display}
        onChange={(e) => {
          const raw = e.target.value
          if (raw === '') {
            onChange('')
            return
          }
          const n = Number(raw)
          onChange(Number.isFinite(n) ? n : raw)
        }}
        className="w-32"
        placeholder={placeholder ?? 'valor'}
      />
    )
  }

  if (fieldType === 'timestamp') {
    return (
      <Input
        type="datetime-local"
        value={isoToLocal(typeof value === 'string' ? value : '')}
        onChange={(e) => onChange(localToIso(e.target.value))}
        className="w-52"
        placeholder={placeholder ?? 'data'}
      />
    )
  }

  // string / enum
  const display = typeof value === 'string' ? value : value == null ? '' : String(value)
  return (
    <Input
      value={display}
      onChange={(e) => onChange(e.target.value)}
      className="w-48"
      placeholder={placeholder ?? 'valor'}
    />
  )
}

function parseList(raw: string, fieldType: FieldType): unknown[] {
  const parts = raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s !== '')
  if (fieldType === 'int') {
    return parts.map((s) => {
      const n = Number(s)
      return Number.isFinite(n) ? n : s
    })
  }
  if (fieldType === 'bool') {
    return parts.map((s) => s === 'true')
  }
  return parts
}

function isoToLocal(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  )
}

function localToIso(local: string): string {
  if (!local) return ''
  const d = new Date(local)
  if (isNaN(d.getTime())) return ''
  return d.toISOString()
}
