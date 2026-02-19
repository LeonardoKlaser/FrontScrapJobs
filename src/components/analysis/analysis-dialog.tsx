import { useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle, AlertTriangle, Lightbulb, Target } from 'lucide-react'
import { useAnalyzeJob } from '@/hooks/useAnalysis'
import type { ResumeAnalysis } from '@/services/analysisService'
import { isAxiosError } from 'axios'

interface AnalysisDialogProps {
  jobId: number | null
  open: boolean
  onClose: () => void
}

function getScoreBadgeColor(score: number) {
  if (score >= 80) return 'bg-green-500/10 text-green-500 border-green-500/20'
  if (score >= 60) return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
  if (score >= 40) return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
  return 'bg-red-500/10 text-red-500 border-red-500/20'
}

function AnalysisResult({ analysis }: { analysis: ResumeAnalysis }) {
  const {
    matchAnalysis,
    strengthsForThisJob,
    gapsAndImprovementAreas,
    actionableResumeSuggestions,
    finalConsiderations
  } = analysis

  return (
    <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
      {/* Score */}
      <div className="flex items-center gap-4">
        <div className="text-center">
          <p className="text-5xl font-bold text-foreground">{matchAnalysis.overallScoreNumeric}</p>
          <p className="text-xs text-muted-foreground">de 100</p>
        </div>
        <div className="flex-1">
          <Badge className={getScoreBadgeColor(matchAnalysis.overallScoreNumeric)}>
            {matchAnalysis.overallScoreQualitative}
          </Badge>
          <p className="text-sm text-muted-foreground mt-2">{matchAnalysis.summary}</p>
        </div>
      </div>

      {/* Strengths */}
      {strengthsForThisJob?.length > 0 && (
        <div>
          <h4 className="font-semibold text-foreground flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Pontos Fortes
          </h4>
          <ul className="space-y-2">
            {strengthsForThisJob.map((s, i) => (
              <li key={i} className="text-sm">
                <span className="font-medium text-foreground">{s.point}</span>
                <span className="text-muted-foreground"> — {s.relevanceToJob}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Gaps */}
      {gapsAndImprovementAreas?.length > 0 && (
        <div>
          <h4 className="font-semibold text-foreground flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            Lacunas e Melhorias
          </h4>
          <ul className="space-y-2">
            {gapsAndImprovementAreas.map((g, i) => (
              <li key={i} className="text-sm">
                <span className="font-medium text-foreground">{g.areaDescription}</span>
                <span className="text-muted-foreground"> — {g.jobRequirementImpacted}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggestions */}
      {actionableResumeSuggestions?.length > 0 && (
        <div>
          <h4 className="font-semibold text-foreground flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4 text-blue-500" />
            Sugestões para o Currículo
          </h4>
          <ul className="space-y-3">
            {actionableResumeSuggestions.map((s, i) => (
              <li key={i} className="text-sm border-l-2 border-blue-500/30 pl-3">
                <p className="font-medium text-foreground">{s.suggestion}</p>
                <p className="text-muted-foreground text-xs mt-1">
                  Aplicar em: {s.curriculumSectionToApply}
                </p>
                {s.exampleWording && (
                  <p className="text-xs text-muted-foreground italic mt-1">
                    Exemplo: "{s.exampleWording}"
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Final Considerations */}
      {finalConsiderations && (
        <div>
          <h4 className="font-semibold text-foreground flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-primary" />
            Considerações Finais
          </h4>
          <p className="text-sm text-muted-foreground">{finalConsiderations}</p>
        </div>
      )}
    </div>
  )
}

export function AnalysisDialog({ jobId, open, onClose }: AnalysisDialogProps) {
  const { mutate, data, isPending, isError, error, reset } = useAnalyzeJob()

  useEffect(() => {
    if (open && jobId !== null) {
      reset()
      mutate(jobId)
    }
  }, [open, jobId, mutate, reset])

  const getErrorMessage = () => {
    if (isAxiosError(error) && error.response?.data?.error) {
      return error.response.data.error
    }
    return 'Erro ao executar análise. Tente novamente.'
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Análise de Compatibilidade com IA</DialogTitle>
          <DialogDescription>Comparação entre seu currículo e a vaga selecionada</DialogDescription>
        </DialogHeader>

        {isPending && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Analisando compatibilidade...</p>
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <p className="text-sm text-destructive">{getErrorMessage()}</p>
          </div>
        )}

        {data && <AnalysisResult analysis={data} />}
      </DialogContent>
    </Dialog>
  )
}
