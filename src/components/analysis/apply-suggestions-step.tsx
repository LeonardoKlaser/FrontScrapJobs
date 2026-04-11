import { useState } from 'react'
import { Save, Download, SaveAll, Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TemplateSelector } from '@/components/curriculum/template-selector'
import { useApplySuggestions } from '@/hooks/usePdf'
import { toast } from 'sonner'
import type { Suggestion } from '@/services/analysisService'

type ActionType = 'save' | 'download' | 'both'
type StepType = 'choose-action' | 'choose-save-mode' | 'choose-template' | 'processing' | 'success'

interface ApplySuggestionsStepProps {
  curriculumId: number
  jobId: number
  suggestions: Suggestion[]
  onComplete: () => void
  onBack: () => void
}

export function ApplySuggestionsStep({
  curriculumId,
  jobId,
  suggestions,
  onComplete,
  onBack
}: ApplySuggestionsStepProps) {
  const [step, setStep] = useState<StepType>('choose-action')
  const [action, setAction] = useState<ActionType | null>(null)
  const [saveMode, setSaveMode] = useState<'new' | 'overwrite' | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  const { mutate: applySuggestions } = useApplySuggestions()

  const handleActionSelect = (selectedAction: ActionType) => {
    setAction(selectedAction)
    if (selectedAction === 'save') {
      setStep('choose-save-mode')
    } else if (selectedAction === 'download') {
      setStep('choose-template')
    } else {
      setStep('choose-save-mode')
    }
  }

  const handleSaveModeSelect = (mode: 'new' | 'overwrite') => {
    setSaveMode(mode)
    if (action === 'both') {
      setStep('choose-template')
    } else {
      execute(action!, mode, null)
    }
  }

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
    execute(action!, saveMode, templateId)
  }

  const execute = (
    finalAction: ActionType,
    finalSaveMode: 'new' | 'overwrite' | null,
    finalTemplateId: string | null
  ) => {
    setStep('processing')

    applySuggestions(
      {
        curriculum_id: curriculumId,
        job_id: jobId,
        suggestions,
        action: finalAction,
        save_mode: finalSaveMode || undefined,
        template_id: finalTemplateId || undefined
      },
      {
        onSuccess: (data) => {
          if (data.pdf_url) {
            setPdfUrl(data.pdf_url)
          }
          const messages: Record<ActionType, string> = {
            save: 'Currículo salvo com sucesso!',
            download: 'PDF gerado com sucesso!',
            both: 'Currículo salvo e PDF gerado com sucesso!'
          }
          toast.success(messages[finalAction])
          if (data.pdf_url) {
            setStep('success')
          } else {
            onComplete()
          }
        },
        onError: (error) => {
          toast.error(error.message)
          setStep('choose-action')
        }
      }
    )
  }

  if (step === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Aplicando sugestões e processando...</p>
      </div>
    )
  }

  if (step === 'success' && pdfUrl) {
    return (
      <div className="flex flex-col items-center gap-4 py-6">
        <p className="text-sm text-muted-foreground">
          {action === 'both' ? 'Currículo salvo e PDF gerado!' : 'PDF gerado com sucesso!'}
        </p>
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Download className="h-4 w-4" />
          Baixar PDF
        </a>
        <p className="text-xs text-muted-foreground">Link válido por 1 hora</p>
        <Button variant="outline" size="sm" onClick={onComplete}>
          Fechar
        </Button>
      </div>
    )
  }

  if (step === 'choose-action') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h3 className="font-medium">O que deseja fazer com as sugestões?</h3>
        </div>

        <div className="grid gap-3">
          <ActionCard
            icon={<SaveAll className="h-5 w-5" />}
            title="Salvar e Baixar PDF"
            description="Aplica sugestões, salva o currículo e gera um PDF"
            onClick={() => handleActionSelect('both')}
          />
          <ActionCard
            icon={<Save className="h-5 w-5" />}
            title="Apenas Salvar"
            description="Aplica sugestões e salva o currículo atualizado"
            onClick={() => handleActionSelect('save')}
          />
          <ActionCard
            icon={<Download className="h-5 w-5" />}
            title="Apenas Baixar PDF"
            description="Gera um PDF com as sugestões sem salvar no currículo"
            onClick={() => handleActionSelect('download')}
          />
        </div>
      </div>
    )
  }

  if (step === 'choose-save-mode') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Button variant="ghost" size="sm" onClick={() => setStep('choose-action')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h3 className="font-medium">Como deseja salvar?</h3>
        </div>

        <div className="grid gap-3">
          <ActionCard
            title="Criar novo currículo"
            description="Mantém o original e cria uma cópia com as sugestões"
            onClick={() => handleSaveModeSelect('new')}
          />
          <ActionCard
            title="Atualizar currículo atual"
            description="Substitui o currículo atual com as sugestões aplicadas"
            onClick={() => handleSaveModeSelect('overwrite')}
          />
        </div>
      </div>
    )
  }

  if (step === 'choose-template') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (action === 'both') setStep('choose-save-mode')
              else setStep('choose-action')
            }}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h3 className="font-medium">Escolha o modelo do PDF</h3>
        </div>

        <TemplateSelector selectedId={selectedTemplate} onSelect={handleTemplateSelect} />
      </div>
    )
  }

  return null
}

function ActionCard({
  icon,
  title,
  description,
  onClick
}: {
  icon?: React.ReactNode
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-start gap-3 p-4 rounded-lg border border-border text-left transition-colors hover:border-primary/50 hover:bg-primary/5"
    >
      {icon && <div className="mt-0.5 text-muted-foreground">{icon}</div>}
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </button>
  )
}
