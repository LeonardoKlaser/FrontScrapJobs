import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { isAxiosError } from 'axios'
import { toast } from 'sonner'
import { Copy, Download, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useOptimizationPrompt } from '@/hooks/useAnalysis'
import { curriculumFilesService } from '@/services/curriculumFilesService'

interface OptimizationPromptSectionProps {
  notificationId: number
  curriculumFileId: number | null
}

// OptimizationPromptSection substitui a antiga UI de "aplicar sugestões"
// (apply-suggestions-step, removida na Task 15). Em vez de reescrever o
// currículo no próprio produto, geramos um prompt pronto (cacheado por
// análise no backend, ver Task 7) pra o usuário colar em outra LLM junto do
// PDF que ele já tem — dá pra copiar o texto e baixar o mesmo arquivo usado
// na análise num único lugar.
export function OptimizationPromptSection({
  notificationId,
  curriculumFileId
}: OptimizationPromptSectionProps) {
  const { t } = useTranslation('sites')
  const [copied, setCopied] = useState(false)
  const { mutate, data, isPending } = useOptimizationPrompt(notificationId)

  const handleGenerate = () => {
    mutate(undefined, {
      onError: (err: unknown) => {
        const slug = isAxiosError(err) ? err.response?.data?.error : undefined
        toast.error(
          slug === 'no_analysis'
            ? t('analysis.optimization.noAnalysisError')
            : t('analysis.optimization.error')
        )
      }
    })
  }

  const handleCopy = () => {
    if (!data?.prompt) return
    navigator.clipboard.writeText(data.prompt)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-3 rounded-lg border border-border/50 bg-card p-4">
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
        </div>
        <h4 className="text-sm font-semibold text-foreground">
          {t('analysis.optimization.title')}
        </h4>
      </div>
      <p className="text-xs text-muted-foreground">{t('analysis.optimization.description')}</p>

      {data ? (
        <div className="space-y-3">
          <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-md bg-muted/40 p-3 text-xs text-foreground">
            {data.prompt}
          </pre>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={handleCopy}>
              <Copy className="h-3.5 w-3.5" />
              {copied ? t('analysis.optimization.copied') : t('analysis.optimization.copy')}
            </Button>
            {curriculumFileId != null && (
              <Button variant="outline" size="sm" className="gap-2" asChild>
                <a
                  href={curriculumFilesService.downloadUrl(curriculumFileId)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="h-3.5 w-3.5" />
                  {t('analysis.optimization.download')}
                </a>
              </Button>
            )}
          </div>
        </div>
      ) : (
        <Button
          variant="glow"
          size="sm"
          className="gap-2"
          onClick={handleGenerate}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {t('analysis.optimization.generate')}
        </Button>
      )}
    </div>
  )
}
