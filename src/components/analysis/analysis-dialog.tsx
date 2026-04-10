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
import { Progress } from '@/components/ui/progress'
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
import { ApplySuggestionsStep } from './apply-suggestions-step'

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

function AnalyzingState() {
  const { t } = useTranslation('sites')
  const steps = t('analysis.loadingSteps', { returnObjects: true }) as string[]
  const [currentStep, setCurrentStep] = useState(0)

  const progressPerStep = 100 / steps.length
  const progress = Math.min((currentStep + 1) * progressPerStep, 95)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev))
    }, 2500)
    return () => clearInterval(interval)
  }, [steps.length])

  return (
    <div className="flex flex-col items-center justify-center py-10 gap-5">
      <div className="relative">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <div className="absolute inset-0 h-8 w-8 animate-ping opacity-20 text-primary">
          <Loader2 className="h-8 w-8" />
        </div>
      </div>
      <div className="w-full max-w-xs space-y-3">
        <Progress value={progress} className="h-2" />
        <p key={currentStep} className="text-sm text-muted-foreground text-center animate-fade-in">
          {steps[currentStep]}
        </p>
      </div>
    </div>
  )
}

function AnalysisResult({
  analysis,
  jobId,
  curriculumId,
  selectedSuggestions,
  onToggleSuggestion
}: {
  analysis: ResumeAnalysis
  jobId: number
  curriculumId?: number
  selectedSuggestions?: Set<number>
  onToggleSuggestion?: (index: number) => void
}) {
  const { t } = useTranslation('sites')
  const { data: curricula } = useCurriculum({ enabled: !!curriculumId })
  const curriculumName = curricula?.find((c) => c.id === curriculumId)?.title
  const {
    matchAnalysis,
    atsKeywords,
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
      {/* Curriculum used */}
      {curriculumId && (
        <p className="text-xs text-muted-foreground">
          {t('analysis.curriculumUsed', 'Currículo utilizado')}:{' '}
          <span className="font-medium text-foreground">
            {curriculumName ?? t('analysis.curriculumDeleted', 'Currículo removido')}
          </span>
        </p>
      )}

      {/* Score hero */}
      <Card className="flex flex-col items-center gap-4 p-3 sm:p-5 sm:flex-row sm:items-center sm:gap-5 border-border/50">
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

      {/* ATS Keywords */}
      {(atsKeywords?.matched?.length > 0 || atsKeywords?.missing?.length > 0) && (
        <div className="animate-fade-in-up" style={{ animationDelay: '50ms' }}>
          <h4 className="font-semibold text-foreground flex items-center gap-2 mb-3 text-sm">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
              <Target className="h-3.5 w-3.5 text-primary" />
            </div>
            {t('analysis.atsKeywords')}
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {atsKeywords.matched?.map((kw) => (
              <span
                key={kw}
                className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 text-xs font-medium"
              >
                <CheckCircle className="h-3 w-3" />
                {kw}
              </span>
            ))}
            {atsKeywords.missing?.map((kw) => (
              <span
                key={kw}
                className="inline-flex items-center gap-1 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 text-xs font-medium"
              >
                <AlertTriangle className="h-3 w-3" />
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Strengths */}
      {strengthsForThisJob?.length > 0 && (
        <div className="animate-fade-in-up" style={{ animationDelay: '150ms' }}>
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
        <div className="animate-fade-in-up" style={{ animationDelay: '250ms' }}>
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
        <div className="animate-fade-in-up" style={{ animationDelay: '350ms' }}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-foreground flex items-center gap-2 text-sm">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-info/10">
                <Lightbulb className="h-3.5 w-3.5 text-info" />
              </div>
              {t('analysis.suggestions')}
            </h4>
            {selectedSuggestions && (
              <span className="text-xs text-muted-foreground">
                {selectedSuggestions.size} de {actionableResumeSuggestions.length} selecionadas
              </span>
            )}
          </div>
          <div className="grid gap-2.5">
            {actionableResumeSuggestions.map((s, index) => {
              const isChecked = selectedSuggestions?.has(index) ?? false
              const isSelectable = !!onToggleSuggestion

              return (
                <div
                  key={s.suggestion}
                  onClick={() => onToggleSuggestion?.(index)}
                  className={`rounded-lg border bg-card px-3.5 py-3 border-l-2 transition-colors ${
                    isSelectable ? 'cursor-pointer' : ''
                  } ${
                    isChecked
                      ? 'border-primary/50 bg-primary/5 border-l-primary'
                      : 'border-border/50 border-l-info/40 hover:border-primary/30'
                  }`}
                >
                  <div className="flex gap-3">
                    {isSelectable && (
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggleSuggestion?.(index)}
                        className="mt-1 h-4 w-4 accent-primary shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                    <div className="flex-1">
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
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Final Considerations */}
      {finalConsiderations && (
        <div className="animate-fade-in-up" style={{ animationDelay: '450ms' }}>
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
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(new Set())
  const [showApplyStep, setShowApplyStep] = useState(false)

  const { data: curricula } = useCurriculum({ enabled: open })
  const { data: historyData, isLoading: isLoadingHistory } = useAnalysisHistory(open ? jobId : null)
  const { mutate: analyzeJob, isError, error, reset: resetAnalysis } = useAnalyzeJob()

  // When dialog opens, reset state
  useEffect(() => {
    if (open) {
      setStep('loading-history')
      setSelectedCvId(null)
      setAnalysisResult(null)
      setSelectedSuggestions(new Set())
      setShowApplyStep(false)
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

  // Auto-select when there's only one curriculum
  useEffect(() => {
    if (step === 'select' && curricula?.length === 1 && !selectedCvId) {
      setSelectedCvId(curricula[0].id)
    }
  }, [step, curricula, selectedCvId])

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
            <AnalysisResult
              analysis={analysisResult}
              jobId={jobId}
              curriculumId={historyData?.curriculum_id}
            />
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
                    selectedCvId === cv.id ? 'border-primary/50 bg-primary/5' : 'hover:bg-muted/30'
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
        {step === 'analyzing' && <AnalyzingState />}

        {/* New analysis result */}
        {step === 'result' && analysisResult && jobId !== null && !showApplyStep && (
          <>
            <AnalysisResult
              analysis={analysisResult}
              jobId={jobId}
              curriculumId={selectedCvId ?? undefined}
              selectedSuggestions={selectedSuggestions}
              onToggleSuggestion={(index) => {
                setSelectedSuggestions((prev) => {
                  const next = new Set(prev)
                  if (next.has(index)) next.delete(index)
                  else next.add(index)
                  return next
                })
              }}
            />
            {selectedSuggestions.size > 0 && (
              <div className="sticky bottom-0 pt-3 pb-1 border-t bg-background">
                <Button onClick={() => setShowApplyStep(true)} className="w-full">
                  Aplicar {selectedSuggestions.size} Sugestão{selectedSuggestions.size > 1 ? 'ões' : ''}
                </Button>
              </div>
            )}
          </>
        )}

        {/* Apply suggestions flow */}
        {step === 'result' && showApplyStep && analysisResult && jobId !== null && (
          <ApplySuggestionsStep
            curriculumId={selectedCvId ?? 0}
            jobId={jobId}
            suggestions={Array.from(selectedSuggestions).map(
              (i) => analysisResult.actionableResumeSuggestions[i]
            )}
            onComplete={() => {
              setShowApplyStep(false)
              setSelectedSuggestions(new Set())
              onClose()
            }}
            onBack={() => setShowApplyStep(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
