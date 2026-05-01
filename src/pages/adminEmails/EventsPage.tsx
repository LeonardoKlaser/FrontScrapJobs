import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useEmailEvents, useSubscribers, useDeleteSubscriber } from '@/hooks/useEmailEvents'
import { SubscriberFormDialog } from '@/components/admin-emails/SubscriberFormDialog'
import { DeleteConfirmDialog } from '@/components/admin-emails/DeleteConfirmDialog'
import type { EmailEvent, EmailEventSubscriber } from '@/models/email'
import { extractApiError } from '@/lib/extractApiError'

interface SubscribersListProps {
  event: EmailEvent
}

function SubscribersList({ event }: SubscribersListProps) {
  const { data, isLoading, isError, error, refetch } = useSubscribers(event.name)
  const deleteMut = useDeleteSubscriber()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<EmailEventSubscriber | undefined>(undefined)
  const [pendingDelete, setPendingDelete] = useState<EmailEventSubscriber | null>(null)

  const handleNew = () => {
    setEditing(undefined)
    setDialogOpen(true)
  }

  const handleEdit = (sub: EmailEventSubscriber) => {
    setEditing(sub)
    setDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    try {
      await deleteMut.mutateAsync(pendingDelete.id)
      setPendingDelete(null)
    } catch {
      // Hook propaga toast — mantém dialog aberto pra retry.
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">{event.description}</p>
        {event.payload_schema?.length > 0 && (
          <div className="mt-2">
            <p className="text-xs font-medium mb-1">Payload schema:</p>
            <ul className="text-xs font-mono space-y-1">
              {event.payload_schema.map((f) => (
                <li key={f.name}>
                  {f.name}: {f.type}
                  {f.required ? ' (required)' : ''}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Subscribers</h3>
        <Button size="sm" onClick={handleNew}>
          + Adicionar subscriber
        </Button>
      </div>
      {isLoading ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : isError ? (
        <div className="space-y-2">
          <p className="text-sm text-destructive">
            {extractApiError(error, 'Erro ao carregar subscribers')}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      ) : (data?.length ?? 0) === 0 ? (
        <p className="text-muted-foreground text-sm">Nenhum subscriber configurado</p>
      ) : (
        <Card>
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr className="text-left">
                <th className="p-2 font-medium">Nome</th>
                <th className="p-2 font-medium">Template ID</th>
                <th className="p-2 font-medium">Delay (s)</th>
                <th className="p-2 font-medium">Ativo</th>
                <th className="p-2 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((sub) => (
                <tr key={sub.id} className="border-b">
                  <td className="p-2">{sub.name}</td>
                  <td className="p-2 font-mono">{sub.template_id}</td>
                  <td className="p-2">{sub.delay_seconds}</td>
                  <td className="p-2">
                    <Badge variant={sub.is_active ? 'default' : 'secondary'}>
                      {sub.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </td>
                  <td className="p-2 space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(sub)}>
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setPendingDelete(sub)}
                      disabled={deleteMut.isPending}
                    >
                      Deletar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      {dialogOpen && (
        <SubscriberFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          eventId={event.id}
          existing={editing}
        />
      )}
      <DeleteConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(o) => !o && setPendingDelete(null)}
        title={`Deletar subscriber "${pendingDelete?.name ?? ''}"?`}
        description="Esta ação não pode ser desfeita. O subscriber não receberá mais este evento."
        loading={deleteMut.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  )
}

export default function EventsPage() {
  const { t } = useTranslation('admin-emails')
  const { data, isLoading, isError, error, refetch } = useEmailEvents()

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{t('events.title')}</h1>
        <p className="text-muted-foreground">
          Configure subscribers para cada evento publicado pelo sistema
        </p>
      </div>
      {isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : isError ? (
        <div className="space-y-3">
          <p className="text-sm text-destructive">
            {extractApiError(error, 'Erro ao carregar eventos')}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      ) : (data?.length ?? 0) === 0 ? (
        <p className="text-muted-foreground">Nenhum evento registrado</p>
      ) : (
        <Card>
          <Accordion type="single" collapsible className="w-full">
            {(data ?? []).map((event) => (
              <AccordionItem key={event.id} value={String(event.id)} className="px-4">
                <AccordionTrigger>
                  <div className="flex flex-col items-start text-left">
                    <span className="font-mono text-sm">{event.name}</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      {event.description}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <SubscribersList event={event} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      )}
    </div>
  )
}
