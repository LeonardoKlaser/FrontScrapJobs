import { FileText } from 'lucide-react'
import { useTemplates } from '@/hooks/usePdf'

interface TemplateSelectorProps {
  selectedId: string | null
  onSelect: (id: string) => void
}

export function TemplateSelector({ selectedId, onSelect }: TemplateSelectorProps) {
  const { data: templates } = useTemplates()

  return (
    <div className="grid gap-3">
      {templates?.map((template) => (
        <button
          key={template.id}
          onClick={() => onSelect(template.id)}
          className={`flex items-start gap-3 p-4 rounded-lg border text-left transition-colors ${
            selectedId === template.id
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }`}
        >
          <FileText className="h-5 w-5 mt-0.5 text-muted-foreground" />
          <div>
            <p className="font-medium">{template.name}</p>
            <p className="text-sm text-muted-foreground">{template.description}</p>
          </div>
        </button>
      ))}
    </div>
  )
}
