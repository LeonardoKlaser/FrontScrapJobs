import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { toast } from 'sonner'

import {
  useEmailCampaign,
  useCreateCampaign,
  useUpdateCampaign,
  useScheduleCampaign,
  useSendNowCampaign,
  useCancelCampaign,
  useDuplicateCampaign,
  useDeleteCampaign
} from '@/hooks/useEmailCampaigns'
import { useEmailTemplates } from '@/hooks/useEmailTemplates'
import { useSegmentSchema } from '@/hooks/useEmailSegment'
import {
  createCampaignSchema,
  scheduleCampaignSchema,
  type CreateCampaignFormValues
} from '@/validators/emailCampaign'
import {
  isCampaignFullyEditable,
  isCampaignSendAtEditable,
  isCampaignTerminal,
  type CampaignStatus
} from '@/models/emailCampaign'
import type { SegmentFilter } from '@/models/email'
import { PATHS } from '@/router/paths'
import { extractApiError } from '@/lib/extractApiError'
import { extractCampaignApiError } from '@/lib/extractCampaignApiError'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { StatusBadge } from '@/components/admin-emails/StatusBadge'
import { CampaignProgressBar } from '@/components/admin-emails/CampaignProgressBar'
import { FilterBuilder, normalizeFilter } from '@/components/admin-emails/FilterBuilder'
import { AudiencePreview } from '@/components/admin-emails/AudiencePreview'

const DEFAULT_FILTER: SegmentFilter = { op: 'AND', filters: [] }

function toastApiError(e: unknown, t: TFunction) {
  const apiErr = extractCampaignApiError(e)
  if (apiErr?.code === 'status_conflict') {
    toast.warning(t('campaigns.errors.statusConflict'))
    return
  }
  if (apiErr?.code === 'not_editable') {
    toast.error(t('campaigns.errors.notEditable'))
    return
  }
  toast.error(extractApiError(e, t('campaigns.errors.generic')))
}

// segmentFilterFromCampaign casa Record<string, unknown> → SegmentFilter.
// Backend persiste o JSON cru; FilterBuilder espera o discriminated union.
// Se o campaign.segment_filter for inválido (ex: campanha antiga, schema
// drift), volta pro DEFAULT_FILTER em vez de quebrar a UI.
function segmentFilterFromCampaign(raw: Record<string, unknown> | undefined): SegmentFilter {
  if (!raw) return DEFAULT_FILTER
  if ('op' in raw && (raw.op === 'AND' || raw.op === 'OR') && Array.isArray(raw.filters)) {
    return raw as unknown as SegmentFilter
  }
  if ('field' in raw && 'op' in raw && 'value' in raw) {
    return raw as unknown as SegmentFilter
  }
  return DEFAULT_FILTER
}

export default function CampaignEditor() {
  const { t } = useTranslation('admin-emails')
  const { id: idParam } = useParams<{ id: string }>()
  const id = idParam ? Number(idParam) : null
  const isNew = id == null || Number.isNaN(id)
  const navigate = useNavigate()

  const { data: camp, isLoading: campLoading } = useEmailCampaign(isNew ? null : id)
  const { data: templates } = useEmailTemplates(true)
  const { data: schemaFields } = useSegmentSchema('users')

  const create = useCreateCampaign()
  const update = useUpdateCampaign(isNew ? 0 : (id as number))
  const schedule = useScheduleCampaign(isNew ? 0 : (id as number))
  const sendNow = useSendNowCampaign(isNew ? 0 : (id as number))
  const cancel = useCancelCampaign(isNew ? 0 : (id as number))
  const duplicate = useDuplicateCampaign()
  const remove = useDeleteCampaign()

  const status: CampaignStatus | null = camp?.status ?? null
  const fullyEditable = isNew || (camp != null && isCampaignFullyEditable(camp.status))
  const sendAtEditable = isNew || (camp != null && isCampaignSendAtEditable(camp.status))

  const form = useForm<CreateCampaignFormValues>({
    resolver: zodResolver(createCampaignSchema) as unknown as Resolver<CreateCampaignFormValues>,
    defaultValues: { name: '', template_id: 0, segment_filter: {} }
  })

  const [filter, setFilter] = useState<SegmentFilter>(DEFAULT_FILTER)
  const [scheduleAt, setScheduleAt] = useState('')
  const [sendAtEdit, setSendAtEdit] = useState('')

  useEffect(() => {
    if (camp && !isNew) {
      // Polling em sending/scheduled refaz fetch a cada 5s — se o admin estiver
      // editando o nome, form.reset sobrescreveria a edição em curso. Skip se
      // o form está dirty (campos foram tocados desde o último reset).
      if (form.formState.isDirty) return
      form.reset({
        name: camp.name,
        template_id: camp.template_id,
        segment_filter: camp.segment_filter
      })
      setFilter(segmentFilterFromCampaign(camp.segment_filter))
      if (camp.send_at) {
        // datetime-local exige YYYY-MM-DDTHH:mm sem TZ. Backend envia ISO
        // UTC; new Date() interpreta como local — slice 0..16 dá o formato.
        setSendAtEdit(new Date(camp.send_at).toISOString().slice(0, 16))
      }
    }
  }, [camp, isNew, form])

  const onSubmit = form.handleSubmit(async (values) => {
    const normalized = normalizeFilter(filter)
    // Defesa contra clear acidental: se normalize devolveu null mas a campanha
    // ja tinha filtro nao-vazio, pede confirmacao em vez de gravar {} silenciosamente
    // (segment_filter={} = "todos os usuarios", impacto enorme se nao-intencional).
    if (
      normalized == null &&
      camp?.segment_filter &&
      Object.keys(camp.segment_filter as Record<string, unknown>).length > 0
    ) {
      if (!window.confirm(t('campaigns.editor.confirmClearFilter'))) {
        return
      }
    }
    const payload = {
      ...values,
      segment_filter: normalized ?? {}
    }
    try {
      if (isNew) {
        const created = await create.mutateAsync(payload)
        toast.success(t('campaigns.feedback.saved'))
        navigate(PATHS.app.adminEmails.campaignEdit(created.id))
      } else {
        const updated = await update.mutateAsync(payload)
        toast.success(t('campaigns.feedback.saved'))
        // Re-sincroniza form com valores recem-salvos pra zerar isDirty —
        // sem isso, o useEffect de polling pula re-sync indefinidamente
        // e o form fica congelado no estado do ultimo save (multi-review apontou).
        form.reset({
          name: updated.name,
          template_id: updated.template_id,
          segment_filter: updated.segment_filter
        })
        setFilter(segmentFilterFromCampaign(updated.segment_filter))
      }
    } catch (e) {
      toastApiError(e, t)
    }
  })

  const handleSchedule = async () => {
    if (isNew || !scheduleAt) return
    const parsed = scheduleCampaignSchema.safeParse({ send_at: scheduleAt })
    if (!parsed.success) {
      toast.error(t('campaigns.errors.sendAtPast'))
      return
    }
    try {
      await schedule.mutateAsync(new Date(scheduleAt).toISOString())
      toast.success(t('campaigns.feedback.scheduled'))
    } catch (e) {
      toastApiError(e, t)
    }
  }

  const handleSendNow = async () => {
    if (isNew) return
    try {
      await sendNow.mutateAsync()
      toast.success(t('campaigns.feedback.sending'))
    } catch (e) {
      toastApiError(e, t)
    }
  }

  const handleCancel = async () => {
    if (isNew) return
    try {
      await cancel.mutateAsync()
      toast.success(t('campaigns.feedback.canceled'))
    } catch (e) {
      toastApiError(e, t)
    }
  }

  const handleDuplicate = async () => {
    if (isNew || id == null) return
    try {
      const dup = await duplicate.mutateAsync(id)
      toast.success(t('campaigns.feedback.duplicated'))
      navigate(PATHS.app.adminEmails.campaignEdit(dup.id))
    } catch (e) {
      toastApiError(e, t)
    }
  }

  const handleDelete = async () => {
    if (isNew || id == null) return
    try {
      await remove.mutateAsync(id)
      toast.success(t('campaigns.feedback.deleted'))
      navigate(PATHS.app.adminEmails.campaigns)
    } catch (e) {
      toastApiError(e, t)
    }
  }

  // Update name+send_at em status=scheduled usa a mutation `update` (PATCH),
  // não `schedule` (que é o CAS draft→scheduled). Backend valida que apenas
  // name/send_at são aceitos quando status=scheduled.
  const handleUpdateScheduled = async () => {
    if (isNew) return
    const values = form.getValues()
    const payload: { name?: string; send_at?: string } = { name: values.name }
    if (sendAtEdit) {
      const parsed = scheduleCampaignSchema.safeParse({ send_at: sendAtEdit })
      if (!parsed.success) {
        toast.error(t('campaigns.errors.sendAtPast'))
        return
      }
      payload.send_at = new Date(sendAtEdit).toISOString()
    }
    try {
      const updated = await update.mutateAsync(payload)
      toast.success(t('campaigns.feedback.saved'))
      // Limpa isDirty apos save bem-sucedido (mesmo padrao do onSubmit).
      form.reset({
        name: updated.name,
        template_id: updated.template_id,
        segment_filter: updated.segment_filter
      })
    } catch (e) {
      toastApiError(e, t)
    }
  }

  if (!isNew && campLoading) {
    return <div className="p-6 text-muted-foreground">{t('campaigns.list.loading')}</div>
  }

  const showProgress =
    !isNew && camp != null && (camp.status === 'sending' || isCampaignTerminal(camp.status))
  const isDraftWithId = !isNew && status === 'draft'
  const isScheduled = status === 'scheduled'
  const isSending = status === 'sending'
  const isTerminal = status != null && isCampaignTerminal(status)

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{isNew ? t('campaigns.new') : (camp?.name ?? '')}</h1>
          {status && <StatusBadge status={status} />}
        </div>
        <Button variant="ghost" onClick={() => navigate(PATHS.app.adminEmails.campaigns)}>
          {t('campaigns.editor.cancel')}
        </Button>
      </div>

      {camp?.last_error && (
        <Alert variant="destructive">
          <AlertDescription>
            <strong>{t('campaigns.editor.lastError')}:</strong> {camp.last_error}
          </AlertDescription>
        </Alert>
      )}

      {showProgress && camp && (
        <Card>
          <CardContent className="p-4">
            <CampaignProgressBar
              sent={camp.sent_count}
              failed={camp.failed_count}
              recipient={camp.recipient_count ?? null}
            />
          </CardContent>
        </Card>
      )}

      <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <Label>{t('campaigns.editor.name')}</Label>
            <Input
              {...form.register('name')}
              placeholder={t('campaigns.editor.namePlaceholder')}
              disabled={!fullyEditable && !isScheduled}
            />
          </div>
          <div>
            <Label>{t('campaigns.editor.template')}</Label>
            <Select
              value={String(form.watch('template_id') || '')}
              onValueChange={(v) => form.setValue('template_id', Number(v))}
              disabled={!fullyEditable}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('campaigns.editor.templatePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {(templates ?? []).map((tpl) => (
                  <SelectItem key={tpl.id} value={String(tpl.id)}>
                    {tpl.name} ({tpl.key})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {sendAtEditable && !isNew && (
            <div>
              <Label>{t('campaigns.editor.scheduleAt')}</Label>
              <Input
                type="datetime-local"
                value={isScheduled ? sendAtEdit : scheduleAt}
                onChange={(e) =>
                  isScheduled ? setSendAtEdit(e.target.value) : setScheduleAt(e.target.value)
                }
              />
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Label>{t('campaigns.editor.audience')}</Label>
          {fullyEditable ? (
            <>
              {schemaFields ? (
                <FilterBuilder
                  fields={schemaFields}
                  value={filter}
                  onChange={setFilter}
                  maxDepth={3}
                />
              ) : (
                <p className="text-sm text-muted-foreground">{t('campaigns.list.loading')}</p>
              )}
              <AudiencePreview filter={filter} debounceMs={800} />
            </>
          ) : (
            <pre className="bg-muted p-2 rounded font-mono text-xs overflow-auto">
              {JSON.stringify(camp?.segment_filter ?? {}, null, 2)}
            </pre>
          )}
        </div>

        <div className="lg:col-span-2 flex flex-wrap justify-end gap-2">
          {fullyEditable && (
            <Button type="submit" disabled={create.isPending || update.isPending}>
              {t('campaigns.editor.saveDraft')}
            </Button>
          )}
          {isDraftWithId && (
            <>
              <Button
                type="button"
                variant="secondary"
                onClick={handleSchedule}
                disabled={schedule.isPending || !scheduleAt}
              >
                {t('campaigns.editor.schedule')}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleSendNow}
                disabled={sendNow.isPending}
              >
                {t('campaigns.editor.sendNow')}
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={remove.isPending}
              >
                {t('campaigns.editor.delete')}
              </Button>
            </>
          )}
          {isScheduled && (
            <>
              <Button
                type="button"
                variant="secondary"
                onClick={handleUpdateScheduled}
                disabled={update.isPending}
              >
                {t('campaigns.editor.saveDraft')}
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleCancel}
                disabled={cancel.isPending}
              >
                {t('campaigns.editor.cancel')}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleDuplicate}
                disabled={duplicate.isPending}
              >
                {t('campaigns.editor.duplicate')}
              </Button>
            </>
          )}
          {isSending && (
            <Button
              type="button"
              variant="secondary"
              onClick={handleDuplicate}
              disabled={duplicate.isPending}
            >
              {t('campaigns.editor.duplicate')}
            </Button>
          )}
          {isTerminal && (
            <>
              <Button
                type="button"
                variant="secondary"
                onClick={handleDuplicate}
                disabled={duplicate.isPending}
              >
                {t('campaigns.editor.duplicate')}
              </Button>
              {(status === 'failed' || status === 'canceled') && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={remove.isPending}
                >
                  {t('campaigns.editor.delete')}
                </Button>
              )}
            </>
          )}
        </div>
      </form>
    </div>
  )
}
