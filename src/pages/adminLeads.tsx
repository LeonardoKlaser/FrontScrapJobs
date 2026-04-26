import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { isAxiosError } from 'axios'
import { AlertTriangle, Check, MessageCircle, ShieldAlert, Undo2, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/common/empty-state'
import { LoadingSection } from '@/components/common/loading-section'
import { PageHeader } from '@/components/common/page-header'
import { useAdminLeads, useSetLeadContacted } from '@/hooks/useAdminLeads'
import type { AdminLead } from '@/services/adminLeadsService'

const DATE_TIME_FMT = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})

const DATE_SHORT_FMT = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit'
})

// formatDateSafe protege a tabela de Invalid Date: backend pode (em teoria)
// mandar timestamp malformado e Intl.DateTimeFormat.format(invalid) joga RangeError,
// derrubando o ErrorBoundary inteiro. Fallback '-' mantém a linha visível.
function formatDateSafe(iso: string, fmt: Intl.DateTimeFormat): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '-'
  return fmt.format(d)
}

// 10 dígitos = fixo BR (DDD + 8); 11 = celular BR (DDD + 9). Fora disso, link wa.me inválido.
const BR_PHONE_MIN = 10
const BR_PHONE_MAX = 11

// Backend SaveLead já valida 10-11 dígitos via cleanNumericString + ErrInvalidPhone
// (usecase/leads_usecase.go), então phones em DB devem vir nesse range. Mas se algum
// dia rolar drift (import direto, dado legado), strip 55 inicial mantém o link válido.
function whatsappDigits(phone: string): string {
  const d = phone.replace(/\D/g, '')
  return d.startsWith('55') && d.length > BR_PHONE_MAX ? d.slice(2) : d
}

function isValidBRPhone(phone: string): boolean {
  const d = whatsappDigits(phone)
  return d.length >= BR_PHONE_MIN && d.length <= BR_PHONE_MAX
}

function whatsappUrl(lead: AdminLead): string {
  const digits = whatsappDigits(lead.phone)
  const firstName = lead.name.trim().split(/\s+/)[0] || lead.name
  const msg =
    `Oi ${firstName}, vi que você começou sua assinatura no ScrapJobs ` +
    'e não finalizou. Posso te ajudar?'
  return `https://wa.me/55${digits}?text=${encodeURIComponent(msg)}`
}

function isForbiddenError(err: unknown): boolean {
  return isAxiosError(err) && err.response?.status === 403
}

export default function AdminLeadsPage() {
  const { t } = useTranslation('admin')
  const { data, isLoading, isError, error, refetch } = useAdminLeads()

  // pendingIds rastreia leads em mutation. setContacted.variables fica
  // sobrescrito quando admin clica em outra linha antes da primeira resolver,
  // permitindo double-fire. Set local + onMutate/onSettled garante per-row real.
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set())
  const setContacted = useSetLeadContacted()

  const [search, setSearch] = useState('')
  const [hideContacted, setHideContacted] = useState(true)

  const togglePending = (id: number, on: boolean) =>
    setPendingIds((prev) => {
      const next = new Set(prev)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })

  const mutateContacted = (id: number, contacted: boolean) => {
    togglePending(id, true)
    setContacted.mutate({ id, contacted }, { onSettled: () => togglePending(id, false) })
  }

  const filtered = useMemo(() => {
    if (!data) return []
    const term = search.trim().toLocaleLowerCase('pt')
    return data.filter((lead) => {
      if (hideContacted && lead.contacted_at) return false
      if (!term) return true
      return (
        lead.name.toLocaleLowerCase('pt').includes(term) ||
        lead.email.toLocaleLowerCase('pt').includes(term)
      )
    })
  }, [data, search, hideContacted])

  return (
    <div className="space-y-10">
      <PageHeader
        title={t('leads.title', { defaultValue: 'Leads' })}
        description={t('leads.description', {
          defaultValue: 'Pessoas que iniciaram o checkout e não finalizaram.'
        })}
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Input
          type="text"
          placeholder={t('leads.searchPlaceholder', {
            defaultValue: 'Buscar por nome ou email...'
          })}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={hideContacted} onCheckedChange={setHideContacted} />
          {t('leads.hideContacted', { defaultValue: 'Ocultar contatados' })}
        </label>
      </div>

      {isLoading && (
        <LoadingSection
          variant="section"
          label={t('leads.loading', { defaultValue: 'Carregando...' })}
        />
      )}

      {!isLoading && isError && isForbiddenError(error) && (
        <EmptyState
          icon={ShieldAlert}
          title={t('leads.forbiddenTitle', { defaultValue: 'Sem permissão' })}
          description={t('leads.forbiddenDescription', {
            defaultValue: 'Esta página é restrita a administradores.'
          })}
        />
      )}

      {!isLoading && isError && !isForbiddenError(error) && (
        <EmptyState
          icon={AlertTriangle}
          title={t('leads.errorTitle', { defaultValue: 'Erro ao carregar leads' })}
          action={
            <Button variant="outline" onClick={() => refetch()}>
              {t('leads.retry', { defaultValue: 'Tentar novamente' })}
            </Button>
          }
        />
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState
          icon={Users}
          title={t('leads.empty', { defaultValue: 'Nenhum lead encontrado' })}
        />
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <div className="overflow-auto rounded-lg border border-border/50">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left">
              <tr>
                <th className="p-3 font-medium">{t('leads.col.name', { defaultValue: 'Nome' })}</th>
                <th className="p-3 font-medium">
                  {t('leads.col.email', { defaultValue: 'Email' })}
                </th>
                <th className="p-3 font-medium">
                  {t('leads.col.phone', { defaultValue: 'Telefone' })}
                </th>
                <th className="p-3 font-medium">
                  {t('leads.col.plan', { defaultValue: 'Plano' })}
                </th>
                <th className="p-3 font-medium">
                  {t('leads.col.attempts', { defaultValue: 'Tentativas' })}
                </th>
                <th className="p-3 font-medium">
                  {t('leads.col.lastAttempt', { defaultValue: 'Última tentativa' })}
                </th>
                <th className="p-3 font-medium">
                  {t('leads.col.actions', { defaultValue: 'Ações' })}
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => {
                const isContacted = lead.contacted_at != null
                const isThisRowPending = pendingIds.has(lead.id)
                const validPhone = isValidBRPhone(lead.phone)
                return (
                  <tr
                    key={lead.id}
                    className={`border-t border-border/50 ${isContacted ? 'opacity-60' : ''}`}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span>{lead.name}</span>
                        {isContacted && (
                          <Badge variant="secondary">
                            {t('leads.contactedOn', {
                              defaultValue: 'Contatado em {{date}}',
                              date: formatDateSafe(lead.contacted_at!, DATE_SHORT_FMT)
                            })}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-3">{lead.email}</td>
                    <td className="p-3">{lead.phone}</td>
                    <td className="p-3">{lead.plan_name}</td>
                    <td className="p-3">{lead.attempts}</td>
                    <td className="p-3">{formatDateSafe(lead.last_attempt_at, DATE_TIME_FMT)}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {validPhone ? (
                          <Button asChild size="sm" variant="outline">
                            <a href={whatsappUrl(lead)} target="_blank" rel="noopener noreferrer">
                              <MessageCircle className="size-4" />
                              {t('leads.whatsapp', { defaultValue: 'WhatsApp' })}
                            </a>
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled
                            title={t('leads.invalidPhone', {
                              defaultValue: 'Telefone inválido'
                            })}
                          >
                            <MessageCircle className="size-4" />
                            {t('leads.whatsapp', { defaultValue: 'WhatsApp' })}
                          </Button>
                        )}
                        {isContacted ? (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isThisRowPending}
                            onClick={() => mutateContacted(lead.id, false)}
                          >
                            <Undo2 className="size-4" />
                            {t('leads.unmarkContacted', { defaultValue: 'Desmarcar' })}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isThisRowPending}
                            onClick={() => mutateContacted(lead.id, true)}
                          >
                            <Check className="size-4" />
                            {t('leads.markContacted', {
                              defaultValue: 'Marcar como contatado'
                            })}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
