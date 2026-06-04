import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  ExternalLink,
  MapPin,
  Target,
  AlertTriangle,
  CheckCircle,
  MessageCircle
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AnalysisDialog } from '@/components/analysis/analysis-dialog'
import { useDigestSession } from '@/hooks/useDigestSession'
import type { DigestJobSnapshot } from '@/services/digestService'
import { trackDigest } from '@/lib/analytics'
import { PATHS } from '@/router/paths'

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-hidden="true">
      <div className="h-7 w-2/3 animate-pulse rounded-md bg-muted" />
      <div className="h-32 w-full animate-pulse rounded-xl bg-muted" />
      <div className="h-32 w-full animate-pulse rounded-xl bg-muted" />
    </div>
  )
}

function InvalidLinkScreen() {
  const { t } = useTranslation('digest')
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-7 w-7 text-destructive" />
      </div>
      <h1 className="text-xl font-semibold">{t('invalidTitle')}</h1>
      <p className="max-w-xs text-sm text-muted-foreground">{t('invalidDescription')}</p>
      <Button asChild variant="outline" size="sm" className="mt-2">
        <a href={PATHS.landing}>{t('invalidCta')}</a>
      </Button>
    </div>
  )
}

function RenewBanner({ onDismiss }: { onDismiss: () => void }) {
  const { t } = useTranslation('digest')
  return (
    <Card className="gap-3 border-warning/30 bg-warning/5 px-4 py-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">{t('renewTitle')}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t('renewDescription')}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm" variant="glow">
          <a href={PATHS.app.renew}>{t('renewCta')}</a>
        </Button>
        <Button size="sm" variant="ghost" onClick={onDismiss}>
          {t('renewDismiss')}
        </Button>
      </div>
    </Card>
  )
}

function JobCard({
  job,
  onAnalyze,
  onViewJob
}: {
  job: DigestJobSnapshot
  onAnalyze: (jobId: number) => void
  onViewJob: (jobId: number | null) => void
}) {
  const { t } = useTranslation('digest')
  const canAnalyze = job.job_live && job.job_id !== null

  return (
    <Card className="gap-3 px-4 py-4">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold tracking-wide text-primary">
          {job.company.toUpperCase()}
        </span>
        <h2 className="text-base font-semibold leading-snug text-foreground">{job.title}</h2>
        {job.location && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {job.location}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {job.has_analysis && (
          <Badge variant="default" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            {t('alreadyAnalyzed')}
          </Badge>
        )}
        {!job.job_live && (
          <Badge variant="secondary" className="gap-1">
            {t('notAcceptingBadge')}
          </Badge>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm" className="gap-1.5">
          <a
            href={job.job_link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onViewJob(job.job_id)}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {t('viewJob')}
          </a>
        </Button>
        <Button
          variant="glow"
          size="sm"
          className="gap-1.5"
          disabled={!canAnalyze}
          onClick={() => job.job_id !== null && onAnalyze(job.job_id)}
        >
          <Target className="h-3.5 w-3.5" />
          {t('analyze')}
        </Button>
      </div>
    </Card>
  )
}

export default function DigestPage() {
  const { token } = useParams<{ token: string }>()
  const { t } = useTranslation('digest')
  const { data, isLoading, isError } = useDigestSession(token)

  const [selectedJobId, setSelectedJobId] = useState<number | null>(null)
  const [showRenew, setShowRenew] = useState(false)
  const openedRef = useRef(false)

  // digest_opened uma unica vez, quando os dados carregam.
  useEffect(() => {
    if (data && !openedRef.current) {
      openedRef.current = true
      trackDigest('digest_opened', { count: data.jobs.length })
    }
  }, [data])

  const handleAnalyze = (jobId: number) => {
    trackDigest('analysis_started_from_digest', { job_id: jobId })
    setSelectedJobId(jobId)
  }

  const handleViewJob = (jobId: number | null) => {
    trackDigest('external_link_clicked', { job_id: jobId })
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-5 px-4 py-8">
      {isLoading && <LoadingSkeleton />}

      {isError && <InvalidLinkScreen />}

      {data && (
        <>
          <header className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold tracking-tight">{t('heading')}</h1>
            <p className="text-sm text-muted-foreground">{t('subheading')}</p>
          </header>

          {showRenew && <RenewBanner onDismiss={() => setShowRenew(false)} />}

          <div className="flex flex-col gap-4">
            {data.jobs.map((job) => (
              <JobCard
                key={job.notification_id}
                job={job}
                onAnalyze={handleAnalyze}
                onViewJob={handleViewJob}
              />
            ))}
          </div>

          {data.norte_number && (
            <footer className="mt-2 flex justify-center pb-4">
              <Button asChild variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                <a
                  href={`https://wa.me/${data.norte_number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackDigest('back_to_whatsapp_clicked')}
                >
                  <MessageCircle className="h-4 w-4" />
                  {t('backToWhatsapp')}
                </a>
              </Button>
            </footer>
          )}
        </>
      )}

      <AnalysisDialog
        jobId={selectedJobId}
        open={selectedJobId !== null}
        onClose={() => setSelectedJobId(null)}
        onSubscriptionExpired={() => {
          setSelectedJobId(null)
          setShowRenew(true)
        }}
        onAnalysisCompleted={() =>
          trackDigest('analysis_completed_from_digest', { job_id: selectedJobId })
        }
        onOptimizeRequested={() => trackDigest('cv_optimize_requested', { job_id: selectedJobId })}
      />
    </main>
  )
}
