import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useEmailTemplates } from '@/hooks/useEmailTemplates'
import { useCreateSubscriber, useUpdateSubscriber } from '@/hooks/useEmailEvents'
import { subscriberFormSchema, type SubscriberFormInput } from '@/validators/email'
import { extractApiError } from '@/lib/extractApiError'
import type { EmailEventSubscriber, SegmentFilter } from '@/models/email'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: number
  existing?: EmailEventSubscriber
  onSuccess?: () => void
}

export function SubscriberFormDialog({ open, onOpenChange, eventId, existing, onSuccess }: Props) {
  const templates = useEmailTemplates(true)
  const createMut = useCreateSubscriber()
  const updateMut = useUpdateSubscriber()

  const form = useForm<SubscriberFormInput>({
    resolver: zodResolver(subscriberFormSchema) as unknown as Resolver<SubscriberFormInput>,
    defaultValues: existing
      ? {
          event_id: existing.event_id,
          template_id: existing.template_id,
          name: existing.name,
          delay_seconds: existing.delay_seconds,
          is_active: existing.is_active,
          filter_dsl: existing.filter_dsl
        }
      : {
          event_id: eventId,
          template_id: 0,
          name: '',
          delay_seconds: 0,
          is_active: true
        }
  })

  const onSubmit = async (data: SubscriberFormInput) => {
    const payload = {
      event_id: data.event_id,
      template_id: data.template_id,
      name: data.name,
      delay_seconds: data.delay_seconds,
      is_active: data.is_active,
      filter_dsl: (data.filter_dsl ?? null) as SegmentFilter | null
    }
    try {
      if (existing) {
        await updateMut.mutateAsync({ id: existing.id, input: payload })
      } else {
        await createMut.mutateAsync(payload)
      }
      onSuccess?.()
      onOpenChange(false)
    } catch (err: unknown) {
      // Toast genérico do hook é insuficiente: admin não sabe qual campo
      // causou 422. setError('root') fixa a mensagem no body do dialog.
      form.setError('root', { message: extractApiError(err, 'Erro ao salvar subscriber') })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{existing ? 'Editar subscriber' : 'Novo subscriber'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Nome</Label>
            <Input {...form.register('name')} />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div>
            <Label>Template</Label>
            <Select
              value={String(form.watch('template_id') || '')}
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
            {form.formState.errors.template_id && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.template_id.message}
              </p>
            )}
          </div>
          <div>
            <Label>Delay (segundos)</Label>
            <Input type="number" {...form.register('delay_seconds', { valueAsNumber: true })} />
            {form.formState.errors.delay_seconds && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.delay_seconds.message}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={form.watch('is_active')}
              onCheckedChange={(v) => form.setValue('is_active', v)}
            />
            <Label>Ativo</Label>
          </div>
          {form.formState.errors.root && (
            <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
          )}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
