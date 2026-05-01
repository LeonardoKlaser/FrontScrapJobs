import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet'
import { useEmailLogs, useEmailLog, useExportEmailLogsCSV } from '@/hooks/useEmailLogs'
import type { EmailLog, EmailLogFilters, EmailLogStatus } from '@/models/email'
import { extractApiError } from '@/lib/extractApiError'

const PAGE_SIZE = 50
const STATUS_OPTIONS: EmailLogStatus[] = ['queued', 'sent', 'failed', 'bounced', 'suppressed']

function statusVariant(status: EmailLogStatus): 'default' | 'secondary' | 'destructive' {
  if (status === 'sent') return 'default'
  if (status === 'failed' || status === 'bounced') return 'destructive'
  return 'secondary'
}

export default function LogsViewer() {
  const [filters, setFilters] = useState<EmailLogFilters>({
    limit: PAGE_SIZE,
    offset: 0
  })
  const [recipientInput, setRecipientInput] = useState('')
  const [templateKeyInput, setTemplateKeyInput] = useState('')
  const [selectedLogId, setSelectedLogId] = useState<number | null>(null)

  const { data, isLoading } = useEmailLogs(filters)
  const detail = useEmailLog(selectedLogId)
  const exportCSV = useExportEmailLogsCSV()

  const total = data?.total ?? 0
  const offset = filters.offset ?? 0
  const limit = filters.limit ?? PAGE_SIZE
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const currentPage = Math.floor(offset / limit) + 1

  const applyFilters = () => {
    setFilters((prev) => ({
      ...prev,
      recipient: recipientInput || undefined,
      template_key: templateKeyInput || undefined,
      offset: 0
    }))
  }

  const clearFilters = () => {
    setRecipientInput('')
    setTemplateKeyInput('')
    setFilters({ limit: PAGE_SIZE, offset: 0 })
  }

  const handlePrev = () => {
    setFilters((prev) => ({
      ...prev,
      offset: Math.max(0, (prev.offset ?? 0) - (prev.limit ?? PAGE_SIZE))
    }))
  }

  const handleNext = () => {
    setFilters((prev) => ({
      ...prev,
      offset: (prev.offset ?? 0) + (prev.limit ?? PAGE_SIZE)
    }))
  }

  const handleExport = async () => {
    try {
      const blob = await exportCSV.mutateAsync(filters)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `email_logs_${Date.now()}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      toast.error(extractApiError(err, 'Erro ao exportar logs'))
    }
  }

  const logs: EmailLog[] = data?.logs ?? []

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Logs de Email</h1>
        <Button variant="outline" onClick={handleExport}>
          Exportar CSV
        </Button>
      </div>

      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <Label>De</Label>
            <Input
              type="datetime-local"
              value={filters.from ?? ''}
              onChange={(e) => setFilters((p) => ({ ...p, from: e.target.value || undefined }))}
            />
          </div>
          <div>
            <Label>Até</Label>
            <Input
              type="datetime-local"
              value={filters.to ?? ''}
              onChange={(e) => setFilters((p) => ({ ...p, to: e.target.value || undefined }))}
            />
          </div>
          <div>
            <Label>Status</Label>
            <Select
              value={filters.status ?? 'all'}
              onValueChange={(v) =>
                setFilters((p) => ({
                  ...p,
                  status: v === 'all' ? undefined : (v as EmailLogStatus)
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Origem</Label>
            <Select
              value={filters.source ?? 'all'}
              onValueChange={(v) =>
                setFilters((p) => ({
                  ...p,
                  source: v === 'all' ? undefined : (v as 'event' | 'lifecycle')
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="event">Event</SelectItem>
                <SelectItem value="lifecycle">Lifecycle</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Template key</Label>
            <Input
              value={templateKeyInput}
              onChange={(e) => setTemplateKeyInput(e.target.value)}
              placeholder="ex: welcome_email"
            />
          </div>
          <div>
            <Label>Destinatário</Label>
            <Input
              value={recipientInput}
              onChange={(e) => setRecipientInput(e.target.value)}
              placeholder="email..."
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={applyFilters}>Aplicar filtros</Button>
          <Button variant="ghost" onClick={clearFilters}>
            Limpar
          </Button>
        </div>
      </Card>

      <Card>
        {isLoading ? (
          <div className="p-6 text-muted-foreground">Carregando...</div>
        ) : (
          <table className="w-full">
            <thead className="border-b">
              <tr className="text-left">
                <th className="p-3 font-medium">Data</th>
                <th className="p-3 font-medium">Template</th>
                <th className="p-3 font-medium">Destinatário</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Provider</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b hover:bg-muted/50 cursor-pointer"
                  onClick={() => setSelectedLogId(log.id)}
                >
                  <td className="p-3 text-sm text-muted-foreground">
                    {new Date(log.created_at).toLocaleString('pt-BR')}
                  </td>
                  <td className="p-3 font-mono text-sm">{log.template_key_snapshot}</td>
                  <td className="p-3 text-sm">{log.recipient_email}</td>
                  <td className="p-3">
                    <Badge variant={statusVariant(log.status)}>{log.status}</Badge>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">{log.provider ?? '—'}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-muted-foreground">
                    Nenhum log encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {total > 0
            ? `Página ${currentPage} de ${totalPages} • ${total} registros`
            : 'Sem registros'}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrev} disabled={offset === 0}>
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={offset + limit >= total}
          >
            Próximo
          </Button>
        </div>
      </div>

      <Sheet open={selectedLogId !== null} onOpenChange={(o) => !o && setSelectedLogId(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Detalhes do log</SheetTitle>
            <SheetDescription>{detail.data ? `ID #${detail.data.id}` : ''}</SheetDescription>
          </SheetHeader>
          <div className="p-4 space-y-3 text-sm">
            {detail.isLoading ? (
              <p className="text-muted-foreground">Carregando...</p>
            ) : detail.data ? (
              <dl className="space-y-2">
                <Field label="Template" value={detail.data.template_key_snapshot} />
                <Field label="Destinatário" value={detail.data.recipient_email} />
                <Field label="Status" value={detail.data.status} />
                <Field label="Provider" value={detail.data.provider ?? '—'} />
                <Field label="Provider message ID" value={detail.data.provider_message_id ?? '—'} />
                <Field
                  label="Criado em"
                  value={new Date(detail.data.created_at).toLocaleString('pt-BR')}
                />
                <Field
                  label="Enviado em"
                  value={
                    detail.data.sent_at
                      ? new Date(detail.data.sent_at).toLocaleString('pt-BR')
                      : '—'
                  }
                />
                <Field label="User ID" value={String(detail.data.user_id ?? '—')} />
                <Field label="Subscriber ID" value={String(detail.data.subscriber_id ?? '—')} />
                <Field
                  label="Lifecycle job ID"
                  value={String(detail.data.lifecycle_job_id ?? '—')}
                />
                <Field label="Dedup key" value={detail.data.dedup_key ?? '—'} />
                {detail.data.error_message && (
                  <div>
                    <dt className="font-medium">Erro</dt>
                    <dd className="mt-1 p-2 bg-destructive/10 text-destructive text-xs font-mono whitespace-pre-wrap rounded">
                      {detail.data.error_message}
                    </dd>
                  </div>
                )}
              </dl>
            ) : (
              <p className="text-muted-foreground">Não encontrado</p>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

interface FieldProps {
  label: string
  value: string
}

function Field({ label, value }: FieldProps) {
  return (
    <div className="flex flex-col">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="font-mono break-all">{value}</dd>
    </div>
  )
}
