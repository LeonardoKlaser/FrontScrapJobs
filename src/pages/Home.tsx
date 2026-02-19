import { FileText, Globe, BellRing, AlertTriangle, Plus, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from '@/components/ui/table'
import { useDashboard } from '@/hooks/useDashboard'


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

export function Home() {
  const { data, isLoading, isError, error} = useDashboard();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center text-red-500">
        <p>Ocorreu um erro ao carregar os dados do dashboard.</p>
        <p className="text-sm">{error.message}</p>
      </div>
    )
  }

  const stats = [
    { title: 'URLs monitoradas', value: data?.monitored_urls_count ?? 0, icon: Globe },
    { title: 'Vagas novas (24h)', value: data?.new_jobs_today_count ?? 0, icon: FileText },
    { title: 'Alertas enviados', value: data?.alerts_sent_count ?? 0, icon: BellRing },
    { title: 'Falhas de scraping', value: 0, icon: AlertTriangle }
  ]

  const latestJobs = data?.latest_jobs || []
  const monitoredUrls = data?.user_monitored_urls || []

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap gap-4">
        {stats.map((s) => (
          <StatsCard key={s.title} {...s} />
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Últimas vagas</h2>
        {latestJobs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma vaga nova por enquanto.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <Table className="min-w-[540px] text-sm">
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Link</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {latestJobs.map((job) => (
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Suas URLs monitoradas</h2>
          <Button size="sm" variant="outline" className="gap-1">
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
                  <TableRow key={url.site_name}>
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
    </div>
  )
}
