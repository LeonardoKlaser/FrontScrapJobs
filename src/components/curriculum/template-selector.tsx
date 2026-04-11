import { Check } from 'lucide-react'
import { useTemplates } from '@/hooks/usePdf'
import { ModernoPreview, ClassicoPreview, CriativoPreview } from './template-preview-miniatures'
import type { ComponentType } from 'react'

interface TemplateSelectorProps {
  selectedId: string | null
  onSelect: (id: string) => void
}

const previewMap: Record<string, ComponentType> = {
  moderno: ModernoPreview,
  classico: ClassicoPreview,
  criativo: CriativoPreview
}

const SCALE = 0.18
const DOC_W = 794
const DOC_H = 1123
const CARD_W = Math.round(DOC_W * SCALE)
const CARD_H = Math.round(DOC_H * SCALE)

export function TemplateSelector({ selectedId, onSelect }: TemplateSelectorProps) {
  const { data: templates } = useTemplates()

  return (
    <div className="grid grid-cols-3 gap-3">
      {templates?.map((template) => {
        const Preview = previewMap[template.id]
        const isSelected = selectedId === template.id

        return (
          <button
            key={template.id}
            onClick={() => onSelect(template.id)}
            className="group flex flex-col items-center gap-2 text-center"
          >
            <div
              className={`relative rounded-xl overflow-hidden transition-all duration-200 ${
                isSelected
                  ? 'ring-2 ring-primary shadow-lg shadow-primary/10'
                  : 'ring-1 ring-border/50 group-hover:ring-primary/40 group-hover:-translate-y-0.5 group-hover:shadow-md'
              }`}
              style={{ width: CARD_W, height: CARD_H }}
            >
              {/* Scaled miniature */}
              <div
                style={{
                  transform: `scale(${SCALE})`,
                  transformOrigin: 'top left',
                  width: DOC_W,
                  height: DOC_H,
                  pointerEvents: 'none'
                }}
              >
                {Preview && <Preview />}
              </div>

              {/* Selected checkmark */}
              {isSelected && (
                <div className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </div>
              )}
            </div>

            <p className={`text-xs font-medium transition-colors ${
              isSelected ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
            }`}>
              {template.name}
            </p>
          </button>
        )
      })}
    </div>
  )
}
