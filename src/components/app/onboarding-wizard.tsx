import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Building2,
  CheckCircle,
  Search,
  Upload,
  Loader2,
  X,
  ArrowRight,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { RegistrationModal } from '@/components/companyPopup'
import { useSiteCareer } from '@/hooks/useSiteCareer'
import {
  useRegisterUserSite,
  useUnregisterUserSite,
  useUpdateUserSiteFilters
} from '@/hooks/useRegisterUserSite'
import { useUser } from '@/hooks/useUser'
import { useLatestJobs } from '@/hooks/useDashboard'
import { useExtractPdf } from '@/hooks/usePdf'
import { useCreateCurriculum, useCurriculum } from '@/hooks/useCurriculum'
import { trackTrial } from '@/lib/analytics'
import { safeHref } from '@/utils/url'
import { toast } from 'sonner'
import type { SiteCareer } from '@/models/siteCareer'
import type { Curriculum } from '@/models/curriculum'

const MAX_FILE_SIZE = 5 * 1024 * 1024
// Versionar a key permite re-mostrar o wizard pra users que ja dispensaram
// quando o shape/copy mudar — bumpar pra v2 ao introduzir step novo etc.
// Mantemos a key legada cleanup-only (sem leitura) pra usuarios antigos
// converterem pro estado atual sem ver o wizard de novo no proximo bump.
const ONBOARDING_DISMISSED_KEY = 'sj_onboarding_dismissed_v1'

// --- Progress Bar ---

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={[
            'h-1.5 flex-1 rounded-full transition-all duration-300',
            i < step ? 'bg-primary' : 'bg-muted'
          ].join(' ')}
        />
      ))}
      <span className="ml-2 shrink-0 text-xs text-muted-foreground font-medium">
        {step}/{total}
      </span>
    </div>
  )
}

// --- Step 1: Upload CV ---

interface Step1Props {
  onNext: () => void
  onSkip: () => void
}

function Step1Upload({ onNext, onSkip }: Step1Props) {
  const { t } = useTranslation('onboarding')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { mutate: extractPdf, isPending: isExtracting } = useExtractPdf()
  const { mutate: createCurriculum, isPending: isSaving } = useCreateCurriculum()
  const isPending = isExtracting || isSaving

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast.error(t('step1.errorPdfType'))
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error(t('step1.errorFileSize'))
      return
    }

    extractPdf(file, {
      onSuccess: (data: Omit<Curriculum, 'id'>) => {
        createCurriculum(data, {
          onSuccess: () => {
            toast.success(t('step1.successImport'))
            trackTrial('onboarding_step_1')
            onNext()
          },
          onError: (err) => {
            // Backend errors carry implementation detail (ex: rate-limit codes,
            // SQL constraint names). User-facing copy stays generic and
            // actionable — log to console pra trilha de suporte sem expor pro
            // usuario.
            console.error('onboarding cv createCurriculum failed', err)
            toast.error(t('step1.cvUploadError'))
          }
        })
      },
      onError: (err) => {
        console.error('onboarding cv extractPdf failed', err)
        toast.error(t('step1.cvUploadError'))
      }
    })

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <h2 className="text-xl font-bold text-foreground tracking-tight">{t('step1.title')}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{t('step1.description')}</p>
      </div>

      <div
        className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border/60 bg-muted/20 px-6 py-10 text-center cursor-pointer hover:border-primary/40 hover:bg-muted/30 transition-colors"
        onClick={() => !isPending && fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !isPending) {
            fileInputRef.current?.click()
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={t('step1.uploadAria')}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          {isPending ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : (
            <Upload className="h-6 w-6 text-primary" />
          )}
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">
            {isPending ? t('step1.processing') : t('step1.selectPdf')}
          </p>
          <p className="text-xs text-muted-foreground">{t('step1.fileSizeHint')}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={onSkip}
          disabled={isPending}
          className="text-muted-foreground"
        >
          {t('step1.skipForNow')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isPending}
          className="gap-1.5"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {isPending ? t('step1.uploading') : t('step1.selectButton')}
        </Button>
      </div>
    </div>
  )
}

// --- Step 2: Choose companies ---

interface Step2Props {
  onNext: () => void
  onSkip: () => void
}

function Step2Companies({ onNext, onSkip }: Step2Props) {
  const { t } = useTranslation('onboarding')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCompany, setSelectedCompany] = useState<SiteCareer | undefined>()
  const [isPopupOpen, setPopupOpen] = useState(false)

  const { data: sitesData } = useSiteCareer()
  const { data: user } = useUser()
  const { mutate: registerUserToSite, isPending: isRegistering } = useRegisterUserSite()
  const { mutate: unregisterUser } = useUnregisterUserSite()
  const { mutate: updateFilters, isPending: isUpdatingFilters } = useUpdateUserSiteFilters()

  // Source of truth for "did they add anything?" is the server-rendered
  // is_subscribed flag — invalidating useSiteCareer after register/unregister
  // already keeps it fresh, so addedCount was double-counting.
  const subscribedCount = useMemo(
    () => sitesData?.filter((c) => c.is_subscribed).length ?? 0,
    [sitesData]
  )
  const maxSites = user?.plan?.max_sites ?? 3
  const remainingSlots = Math.max(0, maxSites - subscribedCount)

  const filteredSites = useMemo(() => {
    if (!sitesData) return []
    return sitesData.filter((c) => c.site_name.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [sitesData, searchTerm])

  const handleCompanyClick = (company: SiteCareer) => {
    setSelectedCompany(company)
    setPopupOpen(true)
  }

  const handleRegister = useCallback(
    (targetWords: string[]) => {
      if (!selectedCompany) return
      registerUserToSite(
        { site_id: selectedCompany.site_id, target_words: targetWords },
        {
          onSuccess: () => {
            setPopupOpen(false)
          }
        }
      )
    },
    [selectedCompany, registerUserToSite]
  )

  const handleUnregister = useCallback(() => {
    if (!selectedCompany) return
    unregisterUser(selectedCompany.site_id, {
      onSuccess: () => {
        setPopupOpen(false)
      }
    })
  }, [selectedCompany, unregisterUser])

  const handleUpdateFilters = useCallback(
    (targetWords: string[]) => {
      if (!selectedCompany) return
      updateFilters(
        { siteId: selectedCompany.site_id, targetWords },
        {
          onSuccess: () => {
            setPopupOpen(false)
          }
        }
      )
    },
    [selectedCompany, updateFilters]
  )

  // Step completion fires once on advance — moving past Step 2 is the
  // conversion event, not each individual company-add.
  const handleAdvance = () => {
    trackTrial('onboarding_step_2')
    onNext()
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <h2 className="text-xl font-bold text-foreground tracking-tight">{t('step2.title')}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{t('step2.description')}</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder={t('step2.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 pr-9 h-9"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Company grid */}
      <div className="max-h-56 overflow-y-auto pr-1">
        {!sitesData ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : filteredSites.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">{t('step2.noResults')}</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {filteredSites.map((company) => (
              <button
                key={company.site_id}
                type="button"
                onClick={() => handleCompanyClick(company)}
                className="group relative flex flex-col items-center gap-2 rounded-lg border border-border/50 bg-card p-3 text-center transition-all duration-150 hover:border-primary/30 hover:bg-card/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {company.is_subscribed && (
                  <Badge className="absolute -top-2 -right-2 px-1 py-0.5 text-[10px]">
                    <CheckCircle className="size-2.5" />
                  </Badge>
                )}
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/30 p-1.5">
                  {company.logo_url ? (
                    <img
                      src={company.logo_url}
                      alt={`${company.site_name} logo`}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <Building2 className="size-5 text-muted-foreground" />
                  )}
                </div>
                <span className="text-xs font-medium text-foreground leading-tight line-clamp-2">
                  {company.site_name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
        <Button variant="ghost" size="sm" onClick={onSkip} className="text-muted-foreground">
          {t('step2.skip')}
        </Button>
        <Button
          size="sm"
          variant="glow"
          onClick={handleAdvance}
          disabled={subscribedCount === 0}
          className="gap-1.5"
        >
          {t('step2.continue')}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {selectedCompany && (
        <RegistrationModal
          key={selectedCompany.site_id}
          isOpen={isPopupOpen}
          onClose={() => setPopupOpen(false)}
          siteId={selectedCompany.site_id}
          companyName={selectedCompany.site_name}
          companyLogo={selectedCompany.logo_url}
          remainingSlots={remainingSlots}
          isAlreadyRegistered={selectedCompany.is_subscribed}
          isLoading={isRegistering}
          onRegister={handleRegister}
          onUnRegister={handleUnregister}
          currentTargetWords={selectedCompany.target_words}
          onUpdateFilters={handleUpdateFilters}
          isUpdatingFilters={isUpdatingFilters}
        />
      )}
    </div>
  )
}

// --- Step 3: First jobs ---

interface Step3Props {
  onDismiss: () => void
}

function Step3Jobs({ onDismiss }: Step3Props) {
  const { t } = useTranslation('onboarding')
  const { data: jobsData, isLoading, isError } = useLatestJobs({ days: 7 })
  const jobs = jobsData?.jobs?.slice(0, 5) ?? []
  const totalCount = jobsData?.total_count ?? 0
  const fired = useRef(false)

  // Funil de conversao precisa do evento "step 3 viewed" só quando o user
  // efetivamente VIU o conteudo (nao loading skeleton ou error state). Sem o
  // gate, taxa de conclusao de step 3 ficava inflada por falhas de query.
  useEffect(() => {
    if (fired.current) return
    if (isLoading || isError) return
    fired.current = true
    trackTrial('onboarding_step_3')
  }, [isLoading, isError])

  const headlineCopy = isLoading
    ? t('step3.loading')
    : totalCount > 0
      ? t('step3.found', { count: totalCount })
      : t('step3.noJobs')

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <h2 className="text-xl font-bold text-foreground tracking-tight">{t('step3.title')}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{headlineCopy}</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : jobs.length > 0 ? (
        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="flex items-start justify-between gap-3 rounded-lg border border-border/40 bg-muted/20 px-3 py-2.5"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground leading-snug line-clamp-1">
                  {job.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{job.company}</p>
              </div>
              <a
                href={safeHref(job.job_link)}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-1 text-xs text-primary hover:underline underline-offset-4"
              >
                {t('step3.viewJob')}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex justify-end">
        <Button size="sm" variant="glow" onClick={onDismiss} className="gap-1.5">
          {t('step3.goToDashboard')}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// --- Main Wizard ---

interface OnboardingWizardProps {
  onDismiss?: () => void
}

export function OnboardingWizard({ onDismiss }: OnboardingWizardProps = {}) {
  const [step, setStep] = useState(1)
  const [dismissed, setDismissed] = useState(false)
  const { data: curriculumList, isLoading: curriculumLoading } = useCurriculum()
  const reconciledRef = useRef(false)

  // Avanca pra step 2 se o user ja tem curriculum cadastrado (refresh mid-wizard
  // ou re-abertura). Sem isso, refresh apos upload bem-sucedido voltava pro
  // step 1 e o user re-extraia o PDF (custa OpenAI quota + UX confuso).
  // Roda 1x quando a query resolve — depois disso, navegacao do user controla.
  useEffect(() => {
    if (reconciledRef.current) return
    if (curriculumLoading) return
    reconciledRef.current = true
    if (curriculumList && curriculumList.length > 0) {
      setStep((prev) => (prev < 2 ? 2 : prev))
    }
  }, [curriculumList, curriculumLoading])

  const handleDismiss = () => {
    try {
      window.localStorage.setItem(ONBOARDING_DISMISSED_KEY, '1')
    } catch (err) {
      // Safari private mode lança QuotaExceeded — não-fatal, a flag em memória
      // ainda esconde o wizard nesta sessão. Loga pra ter visibilidade se outro
      // path (não-Safari) começar a falhar (ex: storage real cheio = bug em outro lugar).
      console.warn('onboarding wizard: localStorage.setItem failed', err)
    }
    setDismissed(true)
    onDismiss?.()
  }

  if (dismissed) return null

  return (
    <Card className="w-full animate-fade-in-up border-primary/20 shadow-md">
      <CardContent className="space-y-5 pt-5">
        <ProgressBar step={step} total={3} />

        {step === 1 && <Step1Upload onNext={() => setStep(2)} onSkip={() => setStep(2)} />}
        {step === 2 && <Step2Companies onNext={() => setStep(3)} onSkip={() => setStep(3)} />}
        {step === 3 && <Step3Jobs onDismiss={handleDismiss} />}
      </CardContent>
    </Card>
  )
}
