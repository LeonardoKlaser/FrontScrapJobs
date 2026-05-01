import { useState } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  useEmailLifecycleJobs,
  useDeleteLifecycle,
  useRunLifecycleNow
} from '@/hooks/useEmailLifecycle'
import { PATHS } from '@/router/paths'
import type { EmailLifecycleJob, LifecycleKind } from '@/models/email'

interface LifecycleTableProps {
  jobs: EmailLifecycleJob[]
  isLoading: boolean
}

function LifecycleTable({ jobs, isLoading }: LifecycleTableProps) {
  const deleteMut = useDeleteLifecycle()
  const runMut = useRunLifecycleNow()

  const handleDelete = (job: EmailLifecycleJob) => {
    if (!confirm(`Deletar lifecycle "${job.name}"?`)) return
    deleteMut.mutate(job.id)
  }

  const handleRunNow = (job: EmailLifecycleJob) => {
    runMut.mutate(job.id, {
      onSuccess: () => toast.success(`Lifecycle "${job.name}" enfileirado`),
      onError: (err) => toast.error(`Erro: ${(err as Error).message}`)
    })
  }

  if (isLoading) {
    return <div className="p-6 text-muted-foreground">Carregando...</div>
  }

  if (jobs.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground">Nenhum lifecycle nesta categoria</div>
    )
  }

  return (
    <table className="w-full">
      <thead className="border-b">
        <tr className="text-left">
          <th className="p-3 font-medium">Nome</th>
          <th className="p-3 font-medium">Handler/Kind</th>
          <th className="p-3 font-medium">Cron</th>
          <th className="p-3 font-medium">Última execução</th>
          <th className="p-3 font-medium">Count</th>
          <th className="p-3 font-medium">Ativo</th>
          <th className="p-3 font-medium">Ações</th>
        </tr>
      </thead>
      <tbody>
        {jobs.map((job) => (
          <tr key={job.id} className="border-b hover:bg-muted/50">
            <td className="p-3">{job.name}</td>
            <td className="p-3 font-mono text-sm">{job.handler_key ?? job.kind}</td>
            <td className="p-3 font-mono text-sm">{job.cron_expression}</td>
            <td className="p-3 text-sm text-muted-foreground">
              {job.last_run_at ? new Date(job.last_run_at).toLocaleString('pt-BR') : '—'}
            </td>
            <td className="p-3 text-sm">{job.last_run_count ?? '—'}</td>
            <td className="p-3">
              <Badge variant={job.is_active ? 'default' : 'secondary'}>
                {job.is_active ? 'Ativo' : 'Inativo'}
              </Badge>
            </td>
            <td className="p-3 space-x-2">
              <Button variant="outline" size="sm" asChild>
                <Link to={PATHS.app.adminEmails.lifecycleEdit(job.id)}>Editar</Link>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleRunNow(job)}
                disabled={runMut.isPending}
              >
                Run now
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(job)}
                disabled={deleteMut.isPending}
              >
                Deletar
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default function LifecycleList() {
  const { data, isLoading } = useEmailLifecycleJobs()
  const [activeTab, setActiveTab] = useState<LifecycleKind>('simple_segment')

  const all = data ?? []
  const configurable = all.filter((j) => j.kind === 'simple_segment')
  const specialized = all.filter((j) => j.kind === 'specialized')

  const tabs: { kind: LifecycleKind; label: string }[] = [
    { kind: 'simple_segment', label: 'Configuráveis' },
    { kind: 'specialized', label: 'Especializadas' }
  ]

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Lifecycle Jobs</h1>
        {activeTab === 'simple_segment' && (
          <Button asChild>
            <Link to={PATHS.app.adminEmails.lifecycleNew}>Criar lifecycle</Link>
          </Button>
        )}
      </div>
      <div className="border-b flex gap-1">
        {tabs.map((t) => (
          <button
            key={t.kind}
            type="button"
            onClick={() => setActiveTab(t.kind)}
            className={
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ' +
              (activeTab === t.kind
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground')
            }
          >
            {t.label}
          </button>
        ))}
      </div>
      <Card>
        <LifecycleTable
          jobs={activeTab === 'simple_segment' ? configurable : specialized}
          isLoading={isLoading}
        />
      </Card>
    </div>
  )
}
