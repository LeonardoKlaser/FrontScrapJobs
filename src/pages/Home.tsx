import { useState } from 'react'
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
  Link2
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { AnalysisDialog } from '@/components/analysis/analysis-dialog'
import { PATHS } from '@/router/paths'

function StatsCard({
  title,
  value,
  icon: Icon,
  delay
}: {
  title: string
  value: number
  icon: React.ElementType
  delay: number
}) {
  return (
    <Card
      className="animate-fade-in-up group relative flex flex-1 min-w-[180px] flex-col gap-3 p-5 overflow-hidden hover:border-primary/20"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-all duration-300 group-hover:bg-primary/10" />
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-4.5 w-4.5 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
      <p className="font-display text-3xl font-bold tracking-tight text-foreground">{value}</p>
    </Card>
  )
}

const LIMIT = 10

export function Home() {
  const {
    data,
    isLoading: isDashboardLoading,
    isError: isDashboardError,
    error: dashboardError
  } = useDashboard()
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null)
  const navigate = useNavigate()

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [days, setDays] = useState(0)

  const {
    data: jobsData,
    isLoading: isJobsLoading,
    isError: isJobsError
  } = useLatestJobs({ page, limit: LIMIT, search, days: days || undefined })

  if (isDashboardLoading) {
    return (
      <div className="flex flex-col gap-10">
        <div className="flex flex-wrap gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} className="flex-1 min-w-[180px]" />
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
        <p className="text-sm font-medium text-foreground">Erro ao carregar o dashboard</p>
        <p className="text-xs text-muted-foreground max-w-sm text-center">
          {dashboardError.message}
        </p>
      </div>
    )
  }

  const stats = [
    {
      title: 'URLs monitoradas',
      value: data?.monitored_urls_count ?? 0,
      icon: Globe
    },
    {
      title: 'Vagas novas (24h)',
      value: data?.new_jobs_today_count ?? 0,
      icon: FileText
    },
    {
      title: 'Alertas enviados',
      value: data?.alerts_sent_count ?? 0,
      icon: BellRing
    }
  ]

  const monitoredUrls = data?.user_monitored_urls || []

  const jobs = jobsData?.jobs || []
  const totalCount = jobsData?.total_count ?? 0
  const totalPages = Math.ceil(totalCount / LIMIT)

  const handleSearch = () => {
    setSearch(searchInput)
    setPage(1)
  }

  const handleDaysChange = (value: string) => {
    setDays(Number(value))
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-10">
      {/* Stats */}
      <div className="flex flex-wrap gap-4">
        {stats.map((s, i) => (
          <StatsCard key={s.title} {...s} delay={i * 80} />
        ))}
      </div>

      {/* Jobs section */}
      <div className="flex flex-col gap-5 animate-fade-in-up" style={{ animationDelay: '240ms' }}>
        <SectionHeader title="Últimas vagas" icon={Sparkles} />

        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-9"
            />
          </div>
          <Button size="sm" variant="outline" onClick={handleSearch}>
            Buscar
          </Button>
          <Select value={String(days)} onValueChange={handleDaysChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Todas</SelectItem>
              <SelectItem value="1">Últimas 24h</SelectItem>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {isJobsLoading && jobs.length === 0 ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : isJobsError ? (
          <p className="text-sm text-destructive">Erro ao carregar vagas.</p>
        ) : jobs.length === 0 ? (
          <EmptyState icon={FileText} title="Nenhuma vaga encontrada." />
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-border/50">
              <Table className="min-w-[600px] text-sm">
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="font-medium">Título</TableHead>
                    <TableHead className="font-medium">Empresa</TableHead>
                    <TableHead className="font-medium">Localização</TableHead>
                    <TableHead className="font-medium">Link</TableHead>
                    <TableHead className="font-medium text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow key={job.id} className="group/row hover:bg-muted/30">
                      <TableCell className="font-medium text-foreground">{job.title}</TableCell>
                      <TableCell className="text-muted-foreground">{job.company}</TableCell>
                      <TableCell className="text-muted-foreground">{job.location}</TableCell>
                      <TableCell>
                        <a
                          href={job.job_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline underline-offset-4"
                        >
                          Ver vaga
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 opacity-70 group-hover/row:opacity-100 transition-opacity"
                          onClick={() => setSelectedJobId(job.id)}
                        >
                          <Bot className="h-3.5 w-3.5" />
                          Analisar com IA
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{totalCount} vaga(s) encontrada(s)</p>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-muted-foreground"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
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
                  Próximo
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Monitored URLs */}
      <div className="flex flex-col gap-5 animate-fade-in-up" style={{ animationDelay: '320ms' }}>
        <SectionHeader title="Suas URLs monitoradas" icon={Link2}>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => navigate(PATHS.app.listSites)}
          >
            <Plus className="h-3.5 w-3.5" /> Nova URL
          </Button>
        </SectionHeader>

        {monitoredUrls.length === 0 ? (
          <EmptyState
            icon={Globe}
            title="Você ainda não adicionou URLs para monitorar."
            action={
              <Button
                size="sm"
                variant="glow"
                className="gap-1.5"
                onClick={() => navigate(PATHS.app.listSites)}
              >
                <Plus className="h-3.5 w-3.5" /> Adicionar empresa
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border/50">
            <Table className="min-w-[540px] text-sm">
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="font-medium">Nome</TableHead>
                  <TableHead className="font-medium">URL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monitoredUrls.map((url) => (
                  <TableRow key={url.site_name + url.base_url} className="hover:bg-muted/30">
                    <TableCell className="font-medium text-foreground">{url.site_name}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      <a
                        href={url.base_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline underline-offset-4"
                      >
                        {url.base_url}
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
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
