import { Link } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEmailTemplates } from '@/hooks/useEmailTemplates'
import { useEmailEvents } from '@/hooks/useEmailEvents'
import { useEmailLifecycleJobs } from '@/hooks/useEmailLifecycle'
import { PATHS } from '@/router/paths'

interface KpiCardProps {
  title: string
  count: number | null
  loading: boolean
  href: string
  description?: string
}

function KpiCard({ title, count, loading, href, description }: KpiCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground">Carregando...</p>
        ) : count !== null ? (
          <p className="text-3xl font-semibold">{count}</p>
        ) : (
          <p className="text-muted-foreground">{description}</p>
        )}
        <Link to={href} className="text-sm text-primary hover:underline mt-2 inline-block">
          Gerenciar →
        </Link>
      </CardContent>
    </Card>
  )
}

export default function Hub() {
  const tpls = useEmailTemplates()
  const events = useEmailEvents()
  const lifecycle = useEmailLifecycleJobs()

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Email Management</h1>
        <p className="text-muted-foreground">Gerencie templates, eventos, lifecycles e logs</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <KpiCard
          title="Templates"
          count={tpls.data?.length ?? 0}
          loading={tpls.isLoading}
          href={PATHS.app.adminEmails.templates}
        />
        <KpiCard
          title="Eventos"
          count={events.data?.length ?? 0}
          loading={events.isLoading}
          href={PATHS.app.adminEmails.events}
        />
        <KpiCard
          title="Lifecycle Jobs"
          count={lifecycle.data?.length ?? 0}
          loading={lifecycle.isLoading}
          href={PATHS.app.adminEmails.lifecycle}
        />
        <KpiCard
          title="Logs"
          count={null}
          loading={false}
          href={PATHS.app.adminEmails.logs}
          description="Histórico de envios"
        />
      </div>
    </div>
  )
}
