import { FileText, Globe, BellRing, AlertTriangle, Plus } from 'lucide-react'
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

const stats = [
  { title: 'URLs monitoradas', value: 12, icon: Globe },
  { title: 'Vagas novas (24h)', value: 4, icon: FileText },
  { title: 'Alertas enviados', value: 9, icon: BellRing },
  { title: 'Falhas de scraping', value: 1, icon: AlertTriangle }
]

const latestJobs = [
  { id: 1, title: 'Desenvolvedor React', source: 'Gupy', detected: 'há 2 h' },
  { id: 2, title: 'Analista de Dados', source: 'LinkedIn', detected: 'há 3 h' },
  { id: 3, title: 'Product Manager', source: 'Greenhouse', detected: 'há 5 h' },
  { id: 4, title: 'UX Designer', source: 'Lever', detected: 'ontem' }
]

const monitoredUrls = [
  { id: 1, name: 'Jobs at ACME', status: 'OK', freq: '30 min' },
  { id: 2, name: 'Careers – Globex', status: 'Erro', freq: '1 h' },
  { id: 3, name: 'Vagas Initrode', status: 'OK', freq: '15 min' }
]

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
                  <TableHead>Fonte</TableHead>
                  <TableHead>Detectada</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {latestJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>{job.title}</TableCell>
                    <TableCell>{job.source}</TableCell>
                    <TableCell>{job.detected}</TableCell>
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
                  <TableHead>Status</TableHead>
                  <TableHead>Frequência</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monitoredUrls.map((url) => (
                  <TableRow key={url.id}>
                    <TableCell>{url.name}</TableCell>
                    <TableCell>
                      {url.status === 'OK' ? (
                        <span className="text-emerald-600">OK</span>
                      ) : (
                        <span className="text-red-600">Erro</span>
                      )}
                    </TableCell>
                    <TableCell>{url.freq}</TableCell>
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
