import { useState, useMemo, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import {
  Globe,
  FileText,
  BellRing,
  Plus,
  Loader2,
  Bot,
  ChevronLeft,
  ChevronRight,
  Search,
  ExternalLink,
  Sparkles,
  BarChart3,
  Link2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Trash2,
  ListFilter,
  X,
  Eye,
  ClipboardCheck
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { SectionHeader } from '@/components/common/section-header'
import { EmptyState } from '@/components/common/empty-state'
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
import { useDashboard, useLatestJobs } from '@/hooks/useDashboard'
import { useUnregisterUserSite } from '@/hooks/useRegisterUserSite'
import { useUser } from '@/hooks/useUser'
import { OnboardingWizard } from '@/components/app/onboarding-wizard'
import { AnalysisDialog } from '@/components/analysis/analysis-dialog'
import { PATHS } from '@/router/paths'
import { safeHref } from '@/utils/url'
import { categorizeLocation } from '@/lib/location'
import { toast } from 'sonner'
import { ApplicationStatusDropdown } from '@/components/common/application-status-dropdown'
import { useCreateApplication, useUpdateApplication } from '@/hooks/useApplications'
import { STATUS_COLORS } from '@/models/application'
import type { ApplicationStatus } from '@/models/application'

function StatsCard({
  title,
  value,
  icon: Icon,
  delay,
  description
}: {
  title: string
  value: number
  icon: React.ElementType
  delay: number
  description?: string
}) {
  return (
    <Card
      className="animate-fade-in-up group relative overflow-hidden hover:border-primary/20"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="flex flex-col gap-3">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-all duration-300 group-hover:bg-primary/10" />
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-4.5 w-4.5 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
        <p className="font-display text-3xl font-bold tracking-tight text-foreground">{value}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  )
}

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

function ApplyButton({ jobId }: { jobId: number }) {
  const { t } = useTranslation('applications')
  const createApplication = useCreateApplication()
  return (
    <Button
      size="sm"
      variant="outline"
      className="gap-1.5 text-xs"
      onClick={() =>
        createApplication.mutate(jobId, {
          onSuccess: () => toast.success(t('toast.createSuccess')),
          onError: (err) => toast.error(err.message)
        })
      }
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
    error: dashboardError
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

  // Filters
  const [filterCompany, setFilterCompany] = useState('__all__')
  const [filterLocationCategory, setFilterLocationCategory] = useState('__all__')
  const [filterLocationText, setFilterLocationText] = useState('')

  // Sorting
  const [sortField, setSortField] = useState<SortField | null>('created_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const {
    data: jobsData,
    isLoading: isJobsLoading,
    isError: isJobsError
  } = useLatestJobs({
    search: debouncedSearch,
    days: days || undefined,
    matched_only: matchedOnly
  })

  const unregisterSite = useUnregisterUserSite()

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

  // Also fetch all jobs for 24h count when matchedOnly differs
  const { data: allJobsData } = useLatestJobs({
    days: 1,
    matched_only: matchedOnly
  })

  const allJobs = jobsData?.jobs || []

  // Unique companies for filter dropdown
  const uniqueCompanies = useMemo(
    () => [...new Set(allJobs.map((j) => j.company).filter(Boolean))].sort(),
    [allJobs]
  )

  // Apply client-side filters
  const filteredJobs = useMemo(
    () =>
      allJobs.filter((job) => {
        if (filterCompany !== '__all__' && job.company !== filterCompany) return false

        if (filterLocationCategory !== '__all__') {
          const cat = categorizeLocation(job.location)
          if (filterLocationCategory === 'National' && cat !== 'National') return false
          if (filterLocationCategory === 'International' && cat !== 'International') return false
          if (filterLocationCategory === 'Remote' && cat !== 'Remote') return false
        }

        if (filterLocationText.trim()) {
          const searchLower = filterLocationText.toLowerCase()
          if (!job.location?.toLowerCase().includes(searchLower)) return false
        }

        return true
      }),
    [allJobs, filterCompany, filterLocationCategory, filterLocationText]
  )

  // Apply sorting
  const sortedJobs = useMemo(() => {
    if (!sortField) return filteredJobs
    const dir = sortDir === 'asc' ? 1 : -1
    return [...filteredJobs].sort((a, b) => {
      if (sortField === 'matched') {
        return (Number(a.matched) - Number(b.matched)) * dir
      }
      if (sortField === 'created_at') {
        const dateA = new Date(a.created_at || 0).getTime()
        const dateB = new Date(b.created_at || 0).getTime()
        return (dateA - dateB) * dir
      }
      const valA = (a[sortField] || '').toLowerCase()
      const valB = (b[sortField] || '').toLowerCase()
      return valA.localeCompare(valB) * dir
    })
  }, [filteredJobs, sortField, sortDir])

  // Client-side pagination
  const totalCount = sortedJobs.length
  const totalPages = Math.ceil(totalCount / LIMIT)
  const paginatedJobs = sortedJobs.slice((page - 1) * LIMIT, page * LIMIT)

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

  const resetFilters = () => {
    setFilterCompany('__all__')
    setFilterLocationCategory('__all__')
    setFilterLocationText('')
    setPage(1)
  }

  const hasActiveFilters =
    filterCompany !== '__all__' || filterLocationCategory !== '__all__' || filterLocationText !== ''

  const activeFilterCount =
    (filterCompany !== '__all__' ? 1 : 0) + (filterLocationCategory !== '__all__' ? 1 : 0)

  const handleRemoveSite = (siteId: number) => {
    unregisterSite.mutate(siteId, {
      onSuccess: () => {
        toast.success(t('monitoredUrls.removeSuccess'))
      },
      onError: () => {
        toast.error(t('monitoredUrls.removeError'))
      }
    })
  }

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
    setWizardLatched(!!user?.is_trial_active && (data.user_monitored_urls?.length ?? 0) === 0)
  }, [user, data, wizardLatched])

  if (isDashboardLoading) {
    return (
      <div className="space-y-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <SkeletonTable rows={4} />
      </div>
    )
  }

  if (isDashboardError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 animate-fade-in-up">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <BarChart3 className="h-6 w-6 text-destructive" />
        </div>
        <p className="text-sm font-medium text-foreground">{t('error.loadDashboard')}</p>
        <p className="text-xs text-muted-foreground max-w-sm text-center">
          {dashboardError.message}
        </p>
      </div>
    )
  }

  const jobs24hCount = allJobsData?.total_count ?? data?.new_jobs_today_count ?? 0

  const stats = [
    {
      title: t('stats.monitoredUrls'),
      value: data?.monitored_urls_count ?? 0,
      icon: Globe
    },
    {
      title: t('stats.newJobs24h'),
      value: jobs24hCount,
      icon: FileText
    },
    {
      title: t('stats.alertsSent'),
      value: data?.alerts_sent_count ?? 0,
      icon: BellRing,
      description: t('stats.alertsSentDescription')
    }
  ]

  const monitoredUrls = data?.user_monitored_urls || []

  const showOnboarding = wizardLatched === true && !wizardDismissed

  return (
    <div className="space-y-10">
      {/* Onboarding wizard for new trial users */}
      {showOnboarding && <OnboardingWizard onDismiss={() => setWizardDismissed(true)} />}
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <StatsCard key={s.title} {...s} delay={i * 60} />
        ))}
      </div>

      {/* Jobs section */}
      <div className="flex flex-col gap-5 animate-fade-in-up [animation-delay:180ms]">
        {/* Line 1: Title + Matched Only toggle */}
        <SectionHeader title={t('latestJobs.title')} icon={Sparkles}>
          <div className="flex items-center gap-2">
            <label htmlFor="matched-only" className="text-sm text-muted-foreground cursor-pointer">
              {t('latestJobs.relevantOnly')}
            </label>
            <Switch
              id="matched-only"
              checked={matchedOnly}
              onCheckedChange={handleMatchedOnlyChange}
            />
          </div>
        </SectionHeader>

        {/* Line 2: Toolbar — Search + Period + Filters Popover */}
        <div className="flex flex-wrap items-center gap-3">
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
                </Label>
                <Select
                  value={filterCompany}
                  onValueChange={(v) => {
                    setFilterCompany(v)
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="w-full h-9">
                    <SelectValue placeholder={t('latestJobs.filterCompanyAll')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">{t('latestJobs.filterCompanyAll')}</SelectItem>
                    {uniqueCompanies.map((company) => (
                      <SelectItem key={company} value={company}>
                        {company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  {t('latestJobs.filterLocation')}
                </Label>
                <Select
                  value={filterLocationCategory}
                  onValueChange={(v) => {
                    setFilterLocationCategory(v)
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="w-full h-9">
                    <SelectValue placeholder={t('latestJobs.filterLocationAll')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">{t('latestJobs.filterLocationAll')}</SelectItem>
                    <SelectItem value="National">
                      {t('latestJobs.filterLocationNational')}
                    </SelectItem>
                    <SelectItem value="International">
                      {t('latestJobs.filterLocationInternational')}
                    </SelectItem>
                    <SelectItem value="Remote">{t('latestJobs.filterLocationRemote')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </PopoverContent>
          </Popover>

          <div className="relative min-w-0 max-w-sm flex-1 sm:min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder={t('latestJobs.filterLocationSearch')}
              value={filterLocationText}
              onChange={(e) => {
                setFilterLocationText(e.target.value)
                setPage(1)
              }}
              className="pl-9 h-9"
            />
          </div>
        </div>

        {/* Table */}
        {isJobsLoading && allJobs.length === 0 ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : isJobsError ? (
          <p className="text-sm text-destructive">{t('latestJobs.loadError')}</p>
        ) : paginatedJobs.length === 0 ? (
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

            {/* Desktop: table layout */}
            <div className="hidden sm:block overflow-x-auto rounded-lg border border-border/50">
              <Table className="text-sm">
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
                    <TableHead className="font-medium">
                      <button
                        type="button"
                        className="inline-flex items-center select-none"
                        onClick={() => handleSort('company')}
                      >
                        {t('latestJobs.company')}
                        <SortIcon field="company" sortField={sortField} sortDir={sortDir} />
                      </button>
                    </TableHead>
                    <TableHead className="font-medium">
                      <button
                        type="button"
                        className="inline-flex items-center select-none"
                        onClick={() => handleSort('location')}
                      >
                        {t('latestJobs.location')}
                        <SortIcon field="location" sortField={sortField} sortDir={sortDir} />
                      </button>
                    </TableHead>
                    <TableHead className="whitespace-nowrap">{t('latestJobs.link')}</TableHead>
                    <TableHead />
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedJobs.map((job) => (
                    <TableRow key={job.id} className="group/row hover:bg-muted/30">
                      <TableCell className="whitespace-nowrap">
                        <span className="flex items-center gap-2">
                          <span className="font-medium text-foreground" title={job.title}>
                            {job.title}
                          </span>
                          {!matchedOnly && job.matched && (
                            <Badge variant="default" className="shrink-0 text-xs">
                              {t('latestJobs.matchBadge')}
                            </Badge>
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {job.company}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {job.location}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <a
                          href={safeHref(job.job_link)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline underline-offset-4"
                        >
                          {t('latestJobs.viewJob')}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {job.application_id && job.application_status ? (
                          <ApplicationStatusDropdown
                            currentStatus={job.application_status}
                            interviewRound={job.interview_round}
                            onStatusChange={(status, round) =>
                              handleStatusChange(job.application_id!, status, round)
                            }
                          />
                        ) : (
                          <ApplyButton jobId={job.id} />
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 opacity-70 group-hover/row:opacity-100 transition-opacity text-xs"
                          onClick={() => setSelectedJobId(job.id)}
                        >
                          {job.has_analysis ? (
                            <>
                              <Eye className="h-3.5 w-3.5" />
                              {t('latestJobs.viewAnalysis')}
                            </>
                          ) : (
                            <>
                              <Bot className="h-3.5 w-3.5" />
                              {t('latestJobs.analyzeAI')}
                            </>
                          )}
                        </Button>
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
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-muted-foreground"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('latestJobs.previous')}</span>
                </Button>
                <span className="inline-flex h-8 min-w-[2rem] items-center justify-center rounded-md bg-primary/10 px-2.5 text-sm font-medium text-primary">
                  {page}
                </span>
                <span className="text-sm text-muted-foreground">/ {totalPages || 1}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-muted-foreground"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <span className="hidden sm:inline">{t('latestJobs.next')}</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Monitored Companies */}
      <div className="flex flex-col gap-5 animate-fade-in-up [animation-delay:240ms]">
        <SectionHeader title={t('monitoredUrls.title')} icon={Link2}>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => navigate(PATHS.app.listSites)}
          >
            <Plus className="h-3.5 w-3.5" /> {t('monitoredUrls.newUrl')}
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
          <>
            {/* Mobile: card layout */}
            <div className="flex flex-col gap-2 sm:hidden">
              {monitoredUrls.map((url) => (
                <Card key={url.site_id}>
                  <CardContent className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">{url.site_name}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                      onClick={() => handleRemoveSite(url.site_id)}
                      disabled={unregisterSite.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Desktop: table layout */}
            <div className="hidden sm:block overflow-x-auto rounded-lg border border-border/50">
              <Table className="text-sm">
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="font-medium">{t('monitoredUrls.name')}</TableHead>
                    <TableHead className="font-medium w-[100px] text-right">
                      {t('latestJobs.action')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monitoredUrls.map((url) => (
                    <TableRow key={url.site_id} className="hover:bg-muted/30">
                      <TableCell className="font-medium text-foreground">{url.site_name}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
                          onClick={() => handleRemoveSite(url.site_id)}
                          disabled={unregisterSite.isPending}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {t('monitoredUrls.remove')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>

      <AnalysisDialog
        jobId={selectedJobId}
        open={selectedJobId !== null}
        onClose={() => setSelectedJobId(null)}
      />
    </div>
  )
}
