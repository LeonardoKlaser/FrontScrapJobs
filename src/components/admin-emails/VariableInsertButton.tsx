import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import type { VariableSchema } from '@/models/email'

interface Props {
  variables: VariableSchema[]
  builtins?: string[]
  onInsert: (variableName: string) => void
}

const DEFAULT_BUILTINS = [
  'FrontendURL',
  'DashboardLink',
  'RenewLink',
  'SupportEmail',
  'SupportPhone'
]

export function VariableInsertButton({ variables, builtins = DEFAULT_BUILTINS, onInsert }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          + Inserir variável
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {variables.length > 0 && (
          <>
            <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Declaradas</div>
            {variables.map((v) => (
              <DropdownMenuItem key={v.name} onClick={() => onInsert(v.name)}>
                <span className="font-mono text-sm">{`{{.${v.name}}}`}</span>
                <span className="ml-2 text-xs text-muted-foreground">{v.type}</span>
              </DropdownMenuItem>
            ))}
          </>
        )}
        {builtins.length > 0 && (
          <>
            <div className="px-2 py-1 text-xs font-medium text-muted-foreground mt-1">Built-in</div>
            {builtins.map((name) => (
              <DropdownMenuItem key={name} onClick={() => onInsert(name)}>
                <span className="font-mono text-sm">{`{{.${name}}}`}</span>
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
