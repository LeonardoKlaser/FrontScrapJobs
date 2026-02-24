import { useState } from 'react'
import { useNavigate } from 'react-router'
import {
  FileText,
  Globe,
  BellRing,
  Plus,
  Loader2,
  Bot,
  ChevronLeft,
  ChevronRight,
  Search
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  icon: Icon
}: {
  title: string
  value: number
  icon: React.ElementType
}) {
  return (
    <Card className="flex flex-1 min-w-[150px] flex-col items-center gap-2 p-4 text-center">
      <Icon className="h-6 w-6 text-primary" />
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-2xl font-semibold leading-none">{value}</p>
    </Card>
  )
}

const LIMIT = 10

export function Home() {
  const { data, isLoading: isDashboardLoading, isError: isDashboardError, error: dashboardError } = useDashboard()
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
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isDashboardError) {
    return (
      <div className="text-center text-red-500">
        <p>Ocorreu um erro ao carregar os dados do dashboard.</p>
        <p className="text-sm">{dashboardError.message}</p>
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
      <div className="flex flex-wrap gap-4">
        {stats.map((s) => (
          <StatsCard key={s.title} {...s} />
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Últimas vagas</h2>

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

        {isJobsLoading && jobs.length === 0 ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : isJobsError ? (
          <p className="text-sm text-red-500">Erro ao carregar vagas.</p>
        ) : jobs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma vaga encontrada.</p>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border">
              <Table className="min-w-[540px] text-sm">
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead>Link</TableHead>
                    <TableHead>Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>{job.title}</TableCell>
                      <TableCell>{job.company}</TableCell>
                      <TableCell>{job.location}</TableCell>
                      <TableCell>
                        <a
                          href={job.job_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Ver vaga
                        </a>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          onClick={() => setSelectedJobId(job.id)}
                        >
                          <Bot className="h-4 w-4" />
                          Analisar com IA
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {totalCount} vaga(s) encontrada(s)
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  {page} / {totalPages || 1}
                </span>
                <Button
                  size="sm"
                  variant="outline"
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

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Suas URLs monitoradas</h2>
          <Button
            size="sm"
            variant="outline"
            className="gap-1"
            onClick={() => navigate(PATHS.app.listSites)}
          >
            <Plus className="h-4 w-4" /> Nova URL
          </Button>
        </div>

        {monitoredUrls.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Você ainda não adicionou URLs para monitorar.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <Table className="min-w-[540px] text-sm">
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Url</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monitoredUrls.map((url) => (
                  <TableRow key={url.site_name + url.base_url}>
                    <TableCell>{url.site_name}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      <a
                        href={url.base_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {url.base_url}
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
