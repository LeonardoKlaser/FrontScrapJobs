import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Loader2,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Target,
  Mail,
  TrendingUp,
  TrendingDown,
  RefreshCw
} from 'lucide-react'
import { useAnalyzeJob, useAnalysisHistory, useSendAnalysisEmail } from '@/hooks/useAnalysis'
import { useCurriculum } from '@/hooks/useCurriculum'
import type { ResumeAnalysis } from '@/services/analysisService'
import { isAxiosError } from 'axios'
import { toast } from 'sonner'

interface AnalysisDialogProps {
  jobId: number | null
  open: boolean
  onClose: () => void
}

function getScoreColor(score: number) {
  if (score >= 80) return 'text-primary'
  if (score >= 60) return 'text-warning'
  if (score >= 40) return 'text-destructive'
  return 'text-destructive'
}

function getScoreBadgeVariant(score: number) {
  if (score >= 80) return 'default'
  if (score >= 60) return 'bg-warning/10 text-warning border-warning/20'
  if (score >= 40) return 'bg-destructive/10 text-destructive border-destructive/20'
  return 'bg-destructive/10 text-destructive border-destructive/20'
}

function getScoreIcon(score: number) {
  if (score >= 60) return TrendingUp
  return TrendingDown
}

function AnalysisResult({ analysis, jobId }: { analysis: ResumeAnalysis; jobId: number }) {
  const { t } = useTranslation('sites')
  const {
    matchAnalysis,
    strengthsForThisJob,
    gapsAndImprovementAreas,
    actionableResumeSuggestions,
    finalConsiderations
  } = analysis

  const { mutate: sendEmail, isPending: isSending, isSuccess: emailSent } = useSendAnalysisEmail()

  const handleSendEmail = () => {
    sendEmail(
      { jobId, analysis },
      {
        onSuccess: () => toast.success(t('analysis.emailSuccess')),
        onError: () => toast.error(t('analysis.emailError'))
      }
    )
  }

  const score = matchAnalysis.overallScoreNumeric
  const ScoreIcon = getScoreIcon(score)

  return (
    <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
      {/* Score hero */}
      <Card className="flex flex-col items-center gap-4 p-5 sm:flex-row sm:items-center sm:gap-5 border-border/50">
        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
          <svg className="absolute inset-0 h-20 w-20 -rotate-90" viewBox="0 0 80 80">
            <circle
              cx="40"
              cy="40"
              r="34"
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
              className="text-border/50"
            />
            <circle
              cx="40"
              cy="40"
              r="34"
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${(score / 100) * 213.6} 213.6`}
              className={getScoreColor(score)}
            />
          </svg>
          <span className={`font-display text-2xl font-bold ${getScoreColor(score)}`}>{score}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <ScoreIcon className={`h-4 w-4 ${getScoreColor(score)}`} />
            {score >= 80 ? (
              <Badge>{matchAnalysis.overallScoreQualitative}</Badge>
            ) : (
              <Badge className={getScoreBadgeVariant(score)}>
                {matchAnalysis.overallScoreQualitative}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{matchAnalysis.summary}</p>
        </div>
      </Card>

      {/* Strengths */}
      {strengthsForThisJob?.length > 0 && (
        <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <h4 className="font-semibold text-foreground flex items-center gap-2 mb-3 text-sm">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
              <CheckCircle className="h-3.5 w-3.5 text-primary" />
            </div>
            {t('analysis.strengths')}
          </h4>
          <div className="grid gap-2">
            {strengthsForThisJob.map((s) => (
              <div
                key={s.point}
                className="flex items-start gap-2.5 rounded-lg border border-border/50 bg-card px-3.5 py-2.5"
              >
                <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <div className="text-sm">
                  <span className="font-medium text-foreground">{s.point}</span>
                  <span className="text-muted-foreground"> — {s.relevanceToJob}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gaps */}
      {gapsAndImprovementAreas?.length > 0 && (
        <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <h4 className="font-semibold text-foreground flex items-center gap-2 mb-3 text-sm">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-warning/10">
              <AlertTriangle className="h-3.5 w-3.5 text-warning" />
            </div>
            {t('analysis.gaps')}
          </h4>
          <div className="grid gap-2">
            {gapsAndImprovementAreas.map((g) => (
              <div
                key={g.areaDescription}
                className="flex items-start gap-2.5 rounded-lg border border-border/50 bg-card px-3.5 py-2.5"
              >
                <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                <div className="text-sm">
                  <span className="font-medium text-foreground">{g.areaDescription}</span>
                  <span className="text-muted-foreground"> — {g.jobRequirementImpacted}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {actionableResumeSuggestions?.length > 0 && (
        <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <h4 className="font-semibold text-foreground flex items-center gap-2 mb-3 text-sm">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-info/10">
              <Lightbulb className="h-3.5 w-3.5 text-info" />
            </div>
            {t('analysis.suggestions')}
          </h4>
          <div className="grid gap-2.5">
            {actionableResumeSuggestions.map((s) => (
              <div
                key={s.suggestion}
                className="rounded-lg border border-border/50 bg-card px-3.5 py-3 border-l-2 border-l-info/40"
              >
                <p className="text-sm font-medium text-foreground">{s.suggestion}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <Badge variant="secondary" className="text-xs">
                    {s.curriculumSectionToApply}
                  </Badge>
                </div>
                {s.exampleWording && (
                  <p className="text-xs text-muted-foreground italic mt-2 pl-2 border-l border-border/50">
                    &ldquo;{s.exampleWording}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Final Considerations */}
      {finalConsiderations && (
        <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <h4 className="font-semibold text-foreground flex items-center gap-2 mb-3 text-sm">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
              <Target className="h-3.5 w-3.5 text-primary" />
            </div>
            {t('analysis.finalNotes')}
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{finalConsiderations}</p>
        </div>
      )}

      {/* Send Email */}
      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border/50">
        <Button
          size="sm"
          variant={emailSent ? 'outline' : 'glow'}
          className="gap-2"
          onClick={handleSendEmail}
          disabled={isSending || emailSent}
        >
          {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
          {emailSent ? t('analysis.emailSent') : t('analysis.sendEmail')}
        </Button>
      </div>
    </div>
  )
}

export function AnalysisDialog({ jobId, open, onClose }: AnalysisDialogProps) {
  const { t } = useTranslation('sites')
  const [step, setStep] = useState<
    'loading-history' | 'select' | 'analyzing' | 'result' | 'history'
  >('loading-history')
  const [selectedCvId, setSelectedCvId] = useState<number | null>(null)
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysis | null>(null)

  const { data: curricula } = useCurriculum()
  const { data: historyData, isLoading: isLoadingHistory } = useAnalysisHistory(
    open ? jobId : null
  )
  const {
    mutate: analyzeJob,
    isError,
    error,
    reset: resetAnalysis
  } = useAnalyzeJob()

  // When dialog opens, reset state
  useEffect(() => {
    if (open) {
      setStep('loading-history')
      setSelectedCvId(null)
      setAnalysisResult(null)
      resetAnalysis()
    }
  }, [open, resetAnalysis])

  // When history data loads, decide which step to show
  useEffect(() => {
    if (!open || step !== 'loading-history') return
    if (isLoadingHistory) return

    if (historyData?.has_analysis && historyData.analysis) {
      setAnalysisResult(historyData.analysis)
      setStep('history')
    } else {
      setStep('select')
    }
  }, [open, step, isLoadingHistory, historyData])

  const handleAnalyze = () => {
    if (!jobId || !selectedCvId) return
    setStep('analyzing')
    analyzeJob(
      { jobId, curriculumId: selectedCvId },
      {
        onSuccess: (data) => {
          setAnalysisResult(data)
          setStep('result')
        },
        onError: () => {
          setStep('select')
        }
      }
    )
  }

  const handleRedo = () => {
    setAnalysisResult(null)
    setStep('select')
    resetAnalysis()
  }

  const getErrorMessage = () => {
    if (isAxiosError(error) && error.response?.data?.error) {
      return error.response.data.error
    }
    return t('analysis.error')
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="tracking-tight">{t('analysis.title')}</DialogTitle>
          <DialogDescription>{t('analysis.description')}</DialogDescription>
        </DialogHeader>

        {/* Loading history */}
        {step === 'loading-history' && (
          <div className="flex flex-col items-center justify-center py-14 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">{t('analysis.loading')}</p>
          </div>
        )}

        {/* Previous analysis (history) */}
        {step === 'history' && analysisResult && jobId !== null && (
          <div className="space-y-4">
            <AnalysisResult analysis={analysisResult} jobId={jobId} />
            <div className="flex justify-center pt-2 border-t border-border/50">
              <Button variant="outline" size="sm" onClick={handleRedo} className="gap-2">
                <RefreshCw className="h-3.5 w-3.5" />
                {t('analysis.redo')}
              </Button>
            </div>
          </div>
        )}

        {/* Curriculum selection */}
        {step === 'select' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{t('analysis.selectCurriculum')}</p>
            <div className="grid gap-2 max-h-[40vh] overflow-y-auto pr-1">
              {curricula?.map((cv) => (
                <Card
                  key={cv.id}
                  className={`cursor-pointer p-3 transition-all duration-150 ${
                    selectedCvId === cv.id
                      ? 'border-primary/50 bg-primary/5'
                      : 'hover:bg-muted/30'
                  }`}
                  onClick={() => setSelectedCvId(cv.id)}
                >
                  <p className="text-sm font-medium">{cv.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{cv.summary}</p>
                </Card>
              ))}
            </div>
            {isError && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4" />
                {getErrorMessage()}
              </div>
            )}
            <div className="flex justify-end">
              <Button
                variant="glow"
                size="sm"
                disabled={!selectedCvId}
                onClick={handleAnalyze}
                className="gap-2"
              >
                <Target className="h-3.5 w-3.5" />
                {t('analysis.generate')}
              </Button>
            </div>
          </div>
        )}

        {/* Analyzing */}
        {step === 'analyzing' && (
          <div className="flex flex-col items-center justify-center py-14 gap-3">
            <div className="relative">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div className="absolute inset-0 h-8 w-8 animate-ping opacity-20 text-primary">
                <Loader2 className="h-8 w-8" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground animate-fade-in">
              {t('analysis.loading')}
            </p>
          </div>
        )}

        {/* New analysis result */}
        {step === 'result' && analysisResult && jobId !== null && (
          <AnalysisResult analysis={analysisResult} jobId={jobId} />
        )}
      </DialogContent>
    </Dialog>
  )
}
