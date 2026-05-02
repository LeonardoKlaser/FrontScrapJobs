import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  useEmailLifecycleJob,
  useCreateLifecycle,
  useUpdateLifecycle,
  useRunLifecycleNow
} from '@/hooks/useEmailLifecycle'
import { useEmailTemplates } from '@/hooks/useEmailTemplates'
import { useSegmentSchema } from '@/hooks/useEmailSegment'
import { lifecycleFormSchema, type LifecycleFormInput } from '@/validators/email'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { CronExpressionInput } from '@/components/admin-emails/CronExpressionInput'
import { AudiencePreview } from '@/components/admin-emails/AudiencePreview'
import { FilterBuilder, normalizeFilter } from '@/components/admin-emails/FilterBuilder'
import { PATHS } from '@/router/paths'
import { extractApiError } from '@/lib/extractApiError'
import type { SegmentFilter } from '@/models/email'

export default function LifecycleEditor() {
  const { id } = useParams()
  const idNum = id ? Number(id) : null
  const isEdit = idNum !== null && !Number.isNaN(idNum)
  const navigate = useNavigate()

  const jobQuery = useEmailLifecycleJob(isEdit ? idNum : null)
  const createMut = useCreateLifecycle()
  const updateMut = useUpdateLifecycle()
  const runNowMut = useRunLifecycleNow()
  const templates = useEmailTemplates(true)
  const schema = useSegmentSchema('users')

  const isSpecialized = jobQuery.data?.kind === 'specialized'
  const editingDisabledForSpecialized = isSpecialized

  const form = useForm<LifecycleFormInput>({
    resolver: zodResolver(lifecycleFormSchema) as unknown as Resolver<LifecycleFormInput>,
    defaultValues: {
      name: '',
      cron_expression: '0 9 * * *',
      timezone: 'America/Sao_Paulo',
      segment_filter: { op: 'AND', filters: [] } as SegmentFilter,
      template_id: 0,
      dedup_key_template: '',
      dedup_window_hours: 168,
      is_active: true
    }
  })

  const [filter, setFilter] = useState<SegmentFilter>({ op: 'AND', filters: [] })

  useEffect(() => {
    if (jobQuery.data) {
      form.reset({
        name: jobQuery.data.name,
        cron_expression: jobQuery.data.cron_expression,
        timezone: jobQuery.data.timezone,
        segment_filter: jobQuery.data.segment_filter ?? { op: 'AND', filters: [] },
        template_id: jobQuery.data.template_id,
        dedup_key_template: jobQuery.data.dedup_key_template,
        dedup_window_hours: jobQuery.data.dedup_window_hours,
        is_active: jobQuery.data.is_active
      })
      if (jobQuery.data.segment_filter) {
        setFilter(jobQuery.data.segment_filter)
      }
    }
  }, [jobQuery.data])

  const watchAll = form.watch()

  const onSubmit = async (data: LifecycleFormInput) => {
    const normalized = normalizeFilter(filter)
    if (!normalized && !isSpecialized) {
      toast.error('Filter vazio — adicione pelo menos 1 condição')
      return
    }
    const input = {
      ...data,
      kind: isSpecialized ? ('specialized' as const) : ('simple_segment' as const),
      segment_filter: normalized
    }
    try {
      if (isEdit && idNum) {
        await updateMut.mutateAsync({ id: idNum, input })
      } else {
        await createMut.mutateAsync(input)
      }
      toast.success('Lifecycle salvo')
      navigate(PATHS.app.adminEmails.lifecycle)
    } catch (err: unknown) {
      toast.error(extractApiError(err, 'Erro ao salvar'))
    }
  }

  const handleRunNow = async () => {
    if (!isEdit || !idNum) return
    try {
      await runNowMut.mutateAsync(idNum)
      toast.success('Lifecycle enfileirado pra execução imediata')
    } catch (err: unknown) {
      toast.error(extractApiError(err, 'Erro ao enfileirar'))
    }
  }

  if (isEdit && jobQuery.isLoading) {
    return <div className="p-6 text-muted-foreground">Carregando...</div>
  }

  if (isEdit && jobQuery.isError) {
    return (
      <div className="p-6 space-y-3">
        <p className="text-sm text-destructive">
          {extractApiError(jobQuery.error, 'Erro ao carregar lifecycle')}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => jobQuery.refetch()}>
            Tentar novamente
          </Button>
          <Button variant="ghost" onClick={() => navigate(PATHS.app.adminEmails.lifecycle)}>
            Voltar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {isEdit ? `Editar lifecycle: ${jobQuery.data?.name ?? ''}` : 'Novo lifecycle'}
        </h1>
        <div className="flex gap-2">
          {isEdit && (
            <Button variant="outline" onClick={handleRunNow} disabled={runNowMut.isPending}>
              {runNowMut.isPending ? 'Enfileirando...' : 'Executar agora'}
            </Button>
          )}
          <Button variant="ghost" onClick={() => navigate(PATHS.app.adminEmails.lifecycle)}>
            Voltar
          </Button>
        </div>
      </div>

      {editingDisabledForSpecialized && (
        <Card>
          <CardContent className="p-3 text-sm text-muted-foreground">
            Esta é uma lifecycle <strong>especializada</strong> (handler em código). Você pode
            alterar template_id, cron_expression, dedup e is_active. Filter é gerenciado pelo
            handler.
          </CardContent>
        </Card>
      )}

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        <div className="space-y-3">
          <div>
            <Label>Nome</Label>
            <Input {...form.register('name')} disabled={isSpecialized} />
          </div>
          <div>
            <Label>Template</Label>
            <Select
              value={String(watchAll.template_id || '')}
              onValueChange={(v) => form.setValue('template_id', Number(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um template" />
              </SelectTrigger>
              <SelectContent>
                {(templates.data ?? []).map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.name} ({t.key})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <CronExpressionInput
            label="Cron"
            value={watchAll.cron_expression}
            onChange={(v) => form.setValue('cron_expression', v)}
            timezone={watchAll.timezone}
          />
          <div>
            <Label>Timezone</Label>
            <Input {...form.register('timezone')} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Dedup key template</Label>
              <Input {...form.register('dedup_key_template')} disabled={isSpecialized} />
            </div>
            <div>
              <Label>Dedup window (horas)</Label>
              <Input
                type="number"
                {...form.register('dedup_window_hours', { valueAsNumber: true })}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={watchAll.is_active}
              onCheckedChange={(v) => form.setValue('is_active', v)}
            />
            <Label>Ativo</Label>
          </div>
        </div>

        <div className="space-y-3">
          {!isSpecialized && (
            <>
              <div>
                <Label>Filtro de usuários</Label>
                {schema.data ? (
                  <FilterBuilder
                    fields={schema.data}
                    value={filter}
                    onChange={setFilter}
                    maxDepth={3}
                  />
                ) : schema.isLoading ? (
                  <p className="text-sm text-muted-foreground">Carregando schema...</p>
                ) : (
                  <p className="text-sm text-destructive">Erro ao carregar schema de fields</p>
                )}
              </div>
              <AudiencePreview filter={filter} debounceMs={800} />
            </>
          )}
          {isSpecialized && (
            <Card>
              <CardContent className="p-4 text-sm text-muted-foreground">
                Filtro gerenciado pelo handler especializado:{' '}
                <code className="font-mono text-xs">{jobQuery.data?.handler_key}</code>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2 flex justify-end gap-2">
          <Button
            variant="ghost"
            type="button"
            onClick={() => navigate(PATHS.app.adminEmails.lifecycle)}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>
            Salvar
          </Button>
        </div>
      </form>
    </div>
  )
}
