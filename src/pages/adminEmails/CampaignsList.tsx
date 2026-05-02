import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { useEmailCampaigns } from '@/hooks/useEmailCampaigns'
import { PATHS } from '@/router/paths'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { StatusBadge } from '@/components/admin-emails/StatusBadge'
import { CampaignProgressBar } from '@/components/admin-emails/CampaignProgressBar'

// Sentinel 'all' em vez de string vazia — Radix Select não aceita value=''.
// Pattern reusado de LogsViewer.tsx (filtro Status/Origem).
const STATUS_OPTIONS = [
  'all',
  'draft',
  'scheduled',
  'sending',
  'sent',
  'failed',
  'canceled'
] as const

type StatusOption = (typeof STATUS_OPTIONS)[number]

const PAGE_LIMIT = 50

export default function CampaignsList() {
  const { t } = useTranslation('admin-emails')
  const [status, setStatus] = useState<StatusOption>('all')
  const [offset, setOffset] = useState(0)
  const { data, isLoading } = useEmailCampaigns({
    status: status === 'all' ? undefined : status,
    limit: PAGE_LIMIT,
    offset
  })

  const total = data?.total ?? 0
  const currentPage = Math.floor(offset / PAGE_LIMIT) + 1
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT))
  const hasNext = offset + PAGE_LIMIT < total
  const hasPrev = offset > 0

  // Reset paginacao ao trocar filtro pra evitar offset alem do total novo.
  const handleStatusChange = (v: string) => {
    setStatus(v as StatusOption)
    setOffset(0)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t('campaigns.title')}</CardTitle>
        <Button asChild>
          <Link to={PATHS.app.adminEmails.campaignNew}>{t('campaigns.new')}</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {t(`campaigns.list.filters.${s}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isLoading && <p>{t('campaigns.list.loading')}</p>}
        {data && data.data.length === 0 && <p>{t('campaigns.list.empty')}</p>}
        {data && data.data.length > 0 && (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('campaigns.list.columns.name')}</TableHead>
                  <TableHead>{t('campaigns.list.columns.status')}</TableHead>
                  <TableHead>{t('campaigns.list.columns.sendAt')}</TableHead>
                  <TableHead>{t('campaigns.list.columns.progress')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Link to={PATHS.app.adminEmails.campaignEdit(c.id)} className="underline">
                        {c.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={c.status} />
                    </TableCell>
                    <TableCell>
                      {c.send_at ? new Date(c.send_at).toLocaleString('pt-BR') : '—'}
                    </TableCell>
                    <TableCell className="w-64">
                      <CampaignProgressBar
                        sent={c.sent_count}
                        failed={c.failed_count}
                        recipient={c.recipient_count ?? null}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {t('campaigns.list.page', { current: currentPage, total: totalPages })}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasPrev}
                  onClick={() => setOffset(Math.max(0, offset - PAGE_LIMIT))}
                >
                  {t('campaigns.list.prev')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasNext}
                  onClick={() => setOffset(offset + PAGE_LIMIT)}
                >
                  {t('campaigns.list.next')}
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
