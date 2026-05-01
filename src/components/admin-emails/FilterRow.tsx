import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import type { SegmentField, SegmentLeaf, SegmentOperator } from '@/models/email'

const OPS_BY_TYPE: Record<string, SegmentOperator[]> = {
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
  const showValue = !NO_VALUE_OPS.includes(value.op)

  return (
    <div className="flex gap-2 items-center flex-wrap">
      <Select value={value.field} onValueChange={(v) => onChange({ ...value, field: v })}>
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
      <Select
        value={value.op}
        onValueChange={(v) => onChange({ ...value, op: v as SegmentOperator })}
      >
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
      {showValue && (
        <Input
          value={String(value.value ?? '')}
          onChange={(e) => onChange({ ...value, value: e.target.value })}
          className="w-48"
          placeholder="valor"
        />
      )}
    </div>
  )
}
