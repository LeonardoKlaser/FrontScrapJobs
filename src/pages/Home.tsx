import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import {
  Globe,
  FileText,
  Plus,
  Loader2,
  Bot,
  Search,
  ExternalLink,
  Sparkles,
  BarChart3,
  Link2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ListFilter,
  X,
  Eye,
  ClipboardCheck,
  Check
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { AppPageHeader } from '@/components/common/app-page-header'
import { SectionHeader } from '@/components/common/section-header'
import { EmptyState } from '@/components/common/empty-state'
import { Pagination } from '@/components/common/pagination'
import { SkeletonCard, SkeletonTable } from '@/components/common/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from '@/components/ui/table'
import { useDashboard, useLatestJobs, useJobCompanies } from '@/hooks/useDashboard'
import { useUser } from '@/hooks/useUser'
import { OnboardingWizard } from '@/components/app/onboarding-wizard'
import { AnalysisDialog } from '@/components/analysis/analysis-dialog'
import { PATHS } from '@/router/paths'
import { safeHref } from '@/utils/url'
import { toast } from 'sonner'
import { ApplicationStatusDropdown } from '@/components/common/application-status-dropdown'
import { useCreateApplication, useUpdateApplication } from '@/hooks/useApplications'
import { STATUS_COLORS } from '@/models/application'
import type { ApplicationStatus } from '@/models/application'

type SortField = 'title' | 'company' | 'location' | 'matched' | 'created_at'
type SortDir = 'asc' | 'desc' | null

function SortIcon({
  field,
  sortField,
  sortDir
}: {
  field: SortField
  sortField: SortField | null
  sortDir: SortDir
}) {
  if (sortField !== field || !sortDir)
    return <ArrowUpDown className="h-3.5 w-3.5 ml-1 opacity-40" />
  return sortDir === 'asc' ? (
    <ArrowUp className="h-3.5 w-3.5 ml-1" />
  ) : (
    <ArrowDown className="h-3.5 w-3.5 ml-1" />
  )
}

const LIMIT = 10

// Regiões aplicadas server-side via param `regions` (vocabulário do backend:
// model.AllRegions). OTHER inclui vagas sem país identificado.
const REGION_OPTIONS = ['BR', 'US_CA', 'EUROPE', 'REMOTE', 'OTHER'] as const

function ApplyButton({ jobId, iconOnly }: { jobId: number; iconOnly?: boolean }) {
  const { t } = useTranslation('applications')
  const createApplication = useCreateApplication()
  const handleApply = () =>
    createApplication.mutate(jobId, {
      onSuccess: () => toast.success(t('toast.createSuccess')),
      onError: (err) => toast.error(err.message)
    })

  if (iconOnly) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8"
            onClick={handleApply}
            disabled={createApplication.isPending}
            aria-label={t('dashboard.applied')}
          >
            <ClipboardCheck className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t('dashboard.applied')}</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="gap-1.5 text-xs"
      onClick={handleApply}
      disabled={createApplication.isPending}
    >
      <ClipboardCheck className="h-3.5 w-3.5" />
      {t('dashboard.applied')}
    </Button>
  )
}

export function Home() {
  const { t } = useTranslation('dashboard')
  const {
    data,
    isLoading: isDashboardLoading,
    isError: isDashboardError,
    error: dashboardError,
    refetch: refetchDashboard
  } = useDashboard()
  const { data: user } = useUser()
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null)
  const navigate = useNavigate()

  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])
  const [days, setDays] = useState(0)
  const [matchedOnly, setMatchedOnly] = useState(true)

  // Filters — todos aplicados server-side (Fase 2).
  // Empresa é multi-select (OR entre as escolhidas); vazio = todas.
  const [filterCompanies, setFilterCompanies] = useState<string[]>([])
  const [companySearch, setCompanySearch] = useState('')
  // Região é multi-rótulo: BR/US_CA/EUROPE/REMOTE/OTHER (OR entre si).
  const [filterRegions, setFilterRegions] = useState<string[]>([])
  const [filterLocationText, setFilterLocationText] = useState('')
  const [debouncedLocation, setDebouncedLocation] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedLocation(filterLocationText)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [filterLocationText])

  // Sorting (server-side). sortField null → backend usa created_at desc.
  const [sortField, setSortField] = useState<SortField | null>('created_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  // Empresas do dropdown vêm de uma faceta server-side (não dá mais pra derivar
  // do conjunto, já que só temos uma página).
  const { data: companiesData } = useJobCompanies(days)
  const uniqueCompanies = companiesData ?? []

  // Lista do filtro de empresa: selecionadas SEMPRE no topo (fixadas, removíveis
  // mesmo que saiam da faceta ao trocar período, ou sejam escondidas pela busca)
  // + as da faceta que casam a busca e ainda não estão selecionadas. Sem fixar as
  // selecionadas, uma escolha fora da faceta ficava filtrando sem botão pra
  // desmarcar (só "Limpar filtros" zerava tudo).
  const companyQuery = companySearch.trim().toLowerCase()
  const visibleCompanies = [
    ...filterCompanies,
    ...uniqueCompanies.filter(
      (c) => !filterCompanies.includes(c) && c.toLowerCase().includes(companyQuery)
    )
  ]

  const {
    data: jobsData,
    isLoading: isJobsLoading,
    isError: isJobsError
  } = useLatestJobs({
    search: debouncedSearch,
    // days=0 ('Todas') é enviado explícito pro backend tratar como "sem janela"
    // (todas as vagas). Com `days || undefined`, 0 virava undefined → backend
    // caía no default de 30 dias, e o "Todas" silenciosamente limitava a 30d.
    days,
    matched_only: matchedOnly,
    regions: filterRegions,
    company: filterCompanies,
    location: debouncedLocation || undefined,
    sort: sortField ?? undefined,
    dir: sortField ? (sortDir ?? undefined) : undefined,
    page,
    limit: LIMIT
  })

  // slice(0, LIMIT) é defesa pra janela de deploy: se um backend antigo (sem
  // paginação server-side) responder com até 5000 vagas, o front renderiza no
  // máximo uma página em vez de despejar tudo. No fluxo normal o backend já
  // devolve <= LIMIT, então é no-op.
  const paginatedJobs = (jobsData?.jobs ?? []).slice(0, LIMIT)
  const totalCount = jobsData?.total_count ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / LIMIT))
  const safePage = Math.min(page, totalPages)

  // Se a página atual ficou fora do range (ex.: filtro reduziu os resultados),
  // sincroniza o state pro usuário não ficar preso numa página vazia.
  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const { t: tApp } = useTranslation('applications')
  const { mutate: updateApplicationMutate } = useUpdateApplication()

  const handleStatusChange = useCallback(
    (applicationId: number, status: ApplicationStatus, interviewRound?: number) => {
      updateApplicationMutate(
        {
          id: applicationId,
          status,
          interview_round: status === 'interview' ? interviewRound : null
        },
        {
          onSuccess: () => toast.success(tApp('toast.updateSuccess')),
          onError: (err) => toast.error(err.message)
        }
      )
    },
    [updateApplicationMutate, tApp]
  )

  // Contagem de vagas das últimas 24h pro stat do topo — só usamos total_count,
  // então limit=1 pra não trazer payload à toa.
  const { data: allJobsData } = useLatestJobs({
    days: 1,
    matched_only: matchedOnly,
    limit: 1
  })

  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField !== field) {
        setSortField(field)
        setSortDir('asc')
      } else if (sortDir === 'asc') {
        setSortDir('desc')
      } else {
        setSortField(null)
        setSortDir(null)
      }
      setPage(1)
    },
    [sortField, sortDir]
  )

  const handleDaysChange = (value: string) => {
    setDays(Number(value))
    setPage(1)
  }

  const handleMatchedOnlyChange = (checked: boolean) => {
    setMatchedOnly(checked)
    setPage(1)
  }

  const toggleRegion = (region: string) => {
    setFilterRegions((prev) =>
      prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]
    )
    setPage(1)
  }

  const toggleCompany = (company: string) => {
    setFilterCompanies((prev) =>
      prev.includes(company) ? prev.filter((c) => c !== company) : [...prev, company]
    )
    setPage(1)
  }

  const resetFilters = () => {
    setFilterCompanies([])
    setCompanySearch('')
    setFilterRegions([])
    setFilterLocationText('')
    setPage(1)
  }

  const hasActiveFilters =
    filterCompanies.length > 0 || filterRegions.length > 0 || filterLocationText !== ''

  const activeFilterCount =
    (filterCompanies.length > 0 ? 1 : 0) +
    (filterRegions.length > 0 ? 1 : 0) +
    (filterLocationText.trim() ? 1 : 0)

  // Latch the wizard the FIRST time both `user` and dashboard `data` have
  // resolved: if the user starts in the "needs onboarding" state, keep the
  // wizard mounted until explicit dismiss (without this, monitoredUrls flips
  // length>0 mid-flow at Step 2 and the wizard unmounts losing Step 3).
  //
  // Declared before the early returns below — otherwise hook count differs
  // between the loading render and the resolved render (React error #310).
  const [wizardLatched, setWizardLatched] = useState<boolean | null>(null)
  const [wizardDismissed, setWizardDismissed] = useState(false)
  useEffect(() => {
    if (wizardLatched !== null) return
    if (user === undefined || data === undefined) return
    try {
      if (window.localStorage.getItem('sj_onboarding_dismissed_v1') === '1') {
        setWizardLatched(false)
        return
      }
    } catch {
      // Storage unavailable — proceed without persisted dismiss flag
    }
    setWizardLatched((data.user_monitored_urls?.length ?? 0) === 0)
  }, [user, data, wizardLatched])

  const addCompanyButton = (
    <Button
      variant="outline"
      onClick={() => navigate(PATHS.app.listSites)}
      aria-label={t('home.addCompany', { ns: 'common' })}
    >
      <Plus className="h-4 w-4" />
      <span className="hidden sm:inline">{t('home.addCompany', { ns: 'common' })}</span>
    </Button>
  )

  if (isDashboardLoading) {
    return (
      <>
        <AppPageHeader title={t('pageTitle.home', { ns: 'common' })}>
          {addCompanyButton}
        </AppPageHeader>
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          <SkeletonTable rows={4} />
        </div>
      </>
    )
  }

  if (isDashboardError) {
    return (
      <>
        <AppPageHeader title={t('pageTitle.home', { ns: 'common' })}>
          {addCompanyButton}
        </AppPageHeader>
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center h-64 gap-3 animate-fade-in-up">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <BarChart3 className="h-6 w-6 text-destructive" />
            </div>
            <p className="text-sm font-medium text-foreground">{t('error.loadDashboard')}</p>
            <p className="text-xs text-muted-foreground max-w-sm text-center">
              {dashboardError.message}
            </p>
            <Button variant="outline" size="sm" onClick={() => refetchDashboard()}>
              {t('error.retry', { defaultValue: 'Tentar novamente' })}
            </Button>
          </div>
        </div>
      </>
    )
  }

  const jobs24hCount = allJobsData?.total_count ?? data?.new_jobs_today_count ?? 0

  const monitoredUrls = data?.user_monitored_urls || []

  const showOnboarding = wizardLatched === true && !wizardDismissed

  return (
    <>
      <AppPageHeader title={t('pageTitle.home', { ns: 'common' })}>
        {addCompanyButton}
      </AppPageHeader>

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
        {showOnboarding && <OnboardingWizard onDismiss={() => setWizardDismissed(true)} />}

        <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span>{t('stats.monitoredUrlsValue', { count: data?.monitored_urls_count ?? 0 })}</span>
          <span aria-hidden>·</span>
          <span>{t('stats.newJobs24hValue', { count: jobs24hCount })}</span>
          <span aria-hidden>·</span>
          <span>{t('stats.alertsSentValue', { count: data?.alerts_sent_count ?? 0 })}</span>
        </div>

        {/* Jobs section */}
        <div className="flex flex-col gap-5 animate-fade-in-up [animation-delay:180ms]">
          <SectionHeader title={t('latestJobs.title')} icon={Sparkles} />

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-0 max-w-xs flex-1 sm:min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder={t('latestJobs.searchPlaceholder')}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 pr-9 h-9"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('')
                    setDebouncedSearch('')
                    setPage(1)
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <Select value={String(days)} onValueChange={handleDaysChange}>
              <SelectTrigger className="w-[150px] h-9">
                <SelectValue placeholder={t('latestJobs.period')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">{t('latestJobs.all')}</SelectItem>
                <SelectItem value="1">{t('latestJobs.last24h')}</SelectItem>
                <SelectItem value="7">{t('latestJobs.last7days')}</SelectItem>
                <SelectItem value="30">{t('latestJobs.last30days')}</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-2 relative">
                  <ListFilter className="h-3.5 w-3.5" />
                  {t('latestJobs.filters', 'Filtros')}
                  {activeFilterCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{t('latestJobs.filters', 'Filtros')}</p>
                  {hasActiveFilters && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={resetFilters}
                      className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3 mr-1" />
                      {t('latestJobs.clearFilters')}
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    {t('latestJobs.filterCompany')}
                    {filterCompanies.length > 0 && ` (${filterCompanies.length})`}
                  </Label>
                  {uniqueCompanies.length > 6 && (
                    <Input
                      placeholder={t('latestJobs.filterCompanySearch')}
                      value={companySearch}
                      onChange={(e) => setCompanySearch(e.target.value)}
                      className="h-8"
                    />
                  )}
                  <div
                    role="group"
                    aria-label={t('latestJobs.filterCompany')}
                    className="max-h-40 overflow-y-auto rounded-md border border-border/60 p-1"
                  >
                    {visibleCompanies.length === 0 ? (
                      <p className="px-2 py-1.5 text-xs text-muted-foreground">
                        {t('latestJobs.filterCompanyEmpty')}
                      </p>
                    ) : (
                      visibleCompanies.map((company) => {
                        const active = filterCompanies.includes(company)
                        return (
                          <button
                            key={company}
                            type="button"
                            onClick={() => toggleCompany(company)}
                            aria-pressed={active}
                            className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-muted"
                          >
                            <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                              {active && <Check className="h-3.5 w-3.5 text-primary" />}
                            </span>
                            <span className="truncate">{company}</span>
                          </button>
                        )
                      })
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    {t('latestJobs.regionLabel')}
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {REGION_OPTIONS.map((region) => {
                      const active = filterRegions.includes(region)
                      return (
                        <Button
                          key={region}
                          type="button"
                          size="sm"
                          variant={active ? 'default' : 'outline'}
                          aria-pressed={active}
                          onClick={() => toggleRegion(region)}
                          className="h-8 text-xs"
                        >
                          {t(`latestJobs.regions.${region}`)}
                        </Button>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    {t('latestJobs.filterLocationSearch')}
                  </Label>
                  <Input
                    placeholder={t('latestJobs.filterLocationSearch')}
                    value={filterLocationText}
                    onChange={(e) => setFilterLocationText(e.target.value)}
                  />
                </div>
              </PopoverContent>
            </Popover>

            <Button
              variant="outline"
              size="sm"
              aria-pressed={matchedOnly}
              onClick={() => handleMatchedOnlyChange(!matchedOnly)}
              className="ml-auto"
            >
              {t('latestJobs.relevantOnly')}
            </Button>
          </div>

          {/* Table */}
          {isJobsLoading && paginatedJobs.length === 0 ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : isJobsError ? (
            <p className="text-sm text-destructive">{t('latestJobs.loadError')}</p>
          ) : totalCount === 0 ? (
            <EmptyState icon={FileText} title={t('latestJobs.empty')} />
          ) : (
            <>
              {/* Mobile: card layout */}
              <div className="flex flex-col gap-3 sm:hidden">
                {paginatedJobs.map((job) => (
                  <Card key={job.id}>
                    <CardContent className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground text-sm leading-snug line-clamp-2">
                            {job.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">{job.company}</p>
                        </div>
                        {!matchedOnly && job.matched && (
                          <Badge variant="default" className="shrink-0 text-xs">
                            {t('latestJobs.matchBadge')}
                          </Badge>
                        )}
                        {job.application_status && (
                          <span
                            className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium text-white"
                            style={{
                              backgroundColor: STATUS_COLORS[job.application_status]
                            }}
                          >
                            {job.application_status === 'interview' && job.interview_round
                              ? tApp('status.interview', {
                                  round: job.interview_round
                                })
                              : tApp(`status.${job.application_status}`)}
                          </span>
                        )}
                      </div>
                      {job.location && (
                        <p className="text-xs text-muted-foreground">{job.location}</p>
                      )}
                      <div className="flex items-center gap-2 pt-1">
                        <a
                          href={safeHref(job.job_link)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline underline-offset-4"
                        >
                          {t('latestJobs.viewJob')}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                        {!job.application_id && <ApplyButton jobId={job.id} />}
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 ml-auto text-xs"
                          onClick={() => setSelectedJobId(job.id)}
                        >
                          {job.has_analysis ? (
                            <>
                              <Eye className="h-3 w-3" />
                              {t('latestJobs.viewAnalysis')}
                            </>
                          ) : (
                            <>
                              <Bot className="h-3 w-3" />
                              {t('latestJobs.analyzeAI')}
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop: table layout. O proprio primitivo Table ja envolve
                  num container com overflow-x-auto; aqui so a moldura
                  (borda arredondada + clip). table-fixed mantem as larguras de
                  coluna estaveis entre paginas e min-w garante legibilidade
                  (scroll interno so em telas estreitas). */}
              <div className="hidden sm:block overflow-hidden rounded-lg border border-border/50">
                <Table className="text-sm table-fixed min-w-[680px]">
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead className="font-medium">
                        <button
                          type="button"
                          className="inline-flex items-center select-none"
                          onClick={() => handleSort('title')}
                        >
                          {t('latestJobs.jobTitle')}
                          <SortIcon field="title" sortField={sortField} sortDir={sortDir} />
                        </button>
                      </TableHead>
                      <TableHead className="font-medium w-[150px]">
                        <button
                          type="button"
                          className="inline-flex items-center select-none"
                          onClick={() => handleSort('company')}
                        >
                          {t('latestJobs.company')}
                          <SortIcon field="company" sortField={sortField} sortDir={sortDir} />
                        </button>
                      </TableHead>
                      <TableHead className="font-medium w-[120px]">
                        <button
                          type="button"
                          className="inline-flex items-center select-none"
                          onClick={() => handleSort('location')}
                        >
                          {t('latestJobs.location')}
                          <SortIcon field="location" sortField={sortField} sortDir={sortDir} />
                        </button>
                      </TableHead>
                      <TableHead className="whitespace-nowrap w-[64px] text-center">
                        {t('latestJobs.link')}
                      </TableHead>
                      <TableHead className="w-[132px] text-center" />
                      <TableHead className="w-[64px] text-center" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedJobs.map((job) => (
                      <TableRow key={job.id} className="group/row hover:bg-muted/30">
                        <TableCell>
                          <span className="flex items-center gap-2 min-w-0">
                            <span
                              className="font-medium text-foreground truncate"
                              title={job.title}
                            >
                              {job.title}
                            </span>
                            {!matchedOnly && job.matched && (
                              <Badge variant="default" className="shrink-0 text-xs">
                                {t('latestJobs.matchBadge')}
                              </Badge>
                            )}
                          </span>
                        </TableCell>
                        <TableCell className="truncate text-muted-foreground" title={job.company}>
                          {job.company}
                        </TableCell>
                        <TableCell className="truncate text-muted-foreground" title={job.location}>
                          {job.location}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-center">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <a
                                href={safeHref(job.job_link)}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={t('latestJobs.viewJob')}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-primary hover:bg-muted"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </TooltipTrigger>
                            <TooltipContent>{t('latestJobs.viewJob')}</TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-center">
                          {job.application_id && job.application_status ? (
                            <ApplicationStatusDropdown
                              currentStatus={job.application_status}
                              interviewRound={job.interview_round}
                              onStatusChange={(status, round) =>
                                handleStatusChange(job.application_id!, status, round)
                              }
                            />
                          ) : (
                            <ApplyButton jobId={job.id} iconOnly />
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-center">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 opacity-70 group-hover/row:opacity-100 transition-opacity"
                                onClick={() => setSelectedJobId(job.id)}
                                aria-label={
                                  job.has_analysis
                                    ? t('latestJobs.viewAnalysis')
                                    : t('latestJobs.analyzeAI')
                                }
                              >
                                {job.has_analysis ? (
                                  <Eye className="h-3.5 w-3.5" />
                                ) : (
                                  <Bot className="h-3.5 w-3.5" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {job.has_analysis
                                ? t('latestJobs.viewAnalysis')
                                : t('latestJobs.analyzeAI')}
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  {t('latestJobs.jobCount', { count: totalCount })}
                </p>
                <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
              </div>
            </>
          )}
        </div>

        {/* Monitored Companies */}
        <div className="flex flex-col gap-5 animate-fade-in-up [animation-delay:240ms]">
          <SectionHeader title={t('monitoredUrls.title')} icon={Link2}>
            <Button size="sm" variant="ghost" onClick={() => navigate(PATHS.app.listSites)}>
              {t('home.manage', { ns: 'common' })} →
            </Button>
          </SectionHeader>

          {monitoredUrls.length === 0 ? (
            <EmptyState
              icon={Globe}
              title={t('monitoredUrls.empty')}
              action={
                <Button
                  size="sm"
                  variant="glow"
                  className="gap-1.5"
                  onClick={() => navigate(PATHS.app.listSites)}
                >
                  <Plus className="h-3.5 w-3.5" /> {t('monitoredUrls.addCompany')}
                </Button>
              }
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {monitoredUrls.map((u) => (
                <Badge variant="secondary" key={u.site_id}>
                  {u.site_name}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <AnalysisDialog
          jobId={selectedJobId}
          open={selectedJobId !== null}
          onClose={() => setSelectedJobId(null)}
        />
      </div>
    </>
  )
}
