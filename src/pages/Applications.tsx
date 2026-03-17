import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners
} from '@dnd-kit/core'
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core'
import { useQueryClient } from '@tanstack/react-query'
import {
  useApplications,
  useUpdateApplication,
  useDeleteApplication
} from '@/hooks/useApplications'
import type { ApplicationStatus, JobApplicationWithJob } from '@/models/application'
import { APPLICATION_STATUSES } from '@/models/application'
import { KanbanColumn } from '@/components/applications/kanban-column'
import { KanbanCardPreview } from '@/components/applications/kanban-card'
import { ApplicationDrawer } from '@/components/applications/application-drawer'
import { InterviewRoundDialog } from '@/components/applications/interview-round-dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

const ACTIVE_STATUSES: ApplicationStatus[] = [
  'applied',
  'in_review',
  'technical_test',
  'interview',
  'offer',
  'hired'
]
const TERMINAL_STATUSES: ApplicationStatus[] = ['rejected', 'withdrawn']

export default function Applications() {
  const { t } = useTranslation('applications')
  const { data, isLoading, isError } = useApplications()
  const updateApplication = useUpdateApplication()
  const deleteApplication = useDeleteApplication()
  const queryClient = useQueryClient()

  const [activeCard, setActiveCard] = useState<JobApplicationWithJob | null>(null)
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [interviewDialog, setInterviewDialog] = useState<{ appId: number } | null>(null)
  const [confirmAction, setConfirmAction] = useState<{
    appId: number
    status: ApplicationStatus
    message: string
  } | null>(null)

  const apps = data?.applications ?? []
  const selectedApp =
    selectedAppId != null ? (apps.find((a) => a.id === selectedAppId) ?? null) : null

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  )

  const getAppsByStatus = (status: ApplicationStatus) => apps.filter((a) => a.status === status)

  const handleDragStart = (event: DragStartEvent) => {
    const app = apps.find((a) => a.id === event.active.id)
    setActiveCard(app ?? null)
  }

  const applyStatusUpdate = (
    appId: number,
    newStatus: ApplicationStatus,
    round?: number | null
  ) => {
    const previousApps = queryClient.getQueryData(['applications'])
    queryClient.setQueryData(['applications'], (old: unknown) => {
      const data = old as { applications?: JobApplicationWithJob[] } | undefined
      if (!data?.applications) return old
      return {
        ...data,
        applications: data.applications.map((a) =>
          a.id === appId
            ? {
                ...a,
                status: newStatus,
                interview_round: newStatus === 'interview' ? (round ?? null) : null
              }
            : a
        )
      }
    })

    updateApplication.mutate(
      {
        id: appId,
        status: newStatus,
        interview_round: newStatus === 'interview' ? (round ?? null) : null
      },
      {
        onSuccess: () => toast.success(t('toast.updateSuccess')),
        onError: () => {
          queryClient.setQueryData(['applications'], previousApps)
          toast.error(t('toast.updateError'))
        }
      }
    )
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCard(null)
    const { active, over } = event
    if (!over) return

    const appId = active.id as number
    const newStatus = String(over.id)
    if (!APPLICATION_STATUSES.includes(newStatus as ApplicationStatus)) return

    const app = apps.find((a) => a.id === appId)
    if (!app || app.status === newStatus) return

    if (newStatus === 'interview') {
      setInterviewDialog({ appId })
      return
    }

    if (newStatus === 'rejected' || newStatus === 'withdrawn') {
      const msg = newStatus === 'rejected' ? t('kanban.confirmReject') : t('kanban.confirmWithdraw')
      setConfirmAction({ appId: app.id, status: newStatus as ApplicationStatus, message: msg })
      return
    }

    applyStatusUpdate(appId, newStatus as ApplicationStatus)
  }

  const handleConfirmAction = () => {
    if (!confirmAction) return
    applyStatusUpdate(confirmAction.appId, confirmAction.status)
    setConfirmAction(null)
  }

  const handleInterviewConfirm = (round: number) => {
    if (!interviewDialog) return
    applyStatusUpdate(interviewDialog.appId, 'interview', round)
    setInterviewDialog(null)
  }

  const handleCardClick = (app: JobApplicationWithJob) => {
    setSelectedAppId(app.id)
    setDrawerOpen(true)
  }

  const handleDelete = (id: number) => {
    deleteApplication.mutate(id, {
      onSuccess: () => {
        toast.success(t('toast.deleteSuccess'))
        setDrawerOpen(false)
      },
      onError: (err) => toast.error(err.message)
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-destructive">{t('kanban.errorState')}</p>
      </div>
    )
  }

  if (apps.length === 0) {
    return (
      <div className="space-y-10">
        <div className="animate-fade-in-up text-center">
          <h1 className="text-gradient-primary text-3xl font-bold tracking-tight sm:text-4xl">
            {t('kanban.title')}
          </h1>
        </div>
        <div className="text-center py-20 space-y-2">
          <p className="text-muted-foreground">{t('kanban.emptyState')}</p>
          <p className="text-sm text-muted-foreground">{t('kanban.emptyStateHint')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up text-center">
        <h1 className="text-gradient-primary text-3xl font-bold tracking-tight sm:text-4xl">
          {t('kanban.title')}
        </h1>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveCard(null)}
      >
        {/* Main columns */}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
          {ACTIVE_STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              items={getAppsByStatus(status)}
              onCardClick={handleCardClick}
            />
          ))}
        </div>

        {/* Terminal columns */}
        <div className="flex gap-4 opacity-60">
          {TERMINAL_STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              items={getAppsByStatus(status)}
              onCardClick={handleCardClick}
            />
          ))}
        </div>

        <DragOverlay>{activeCard && <KanbanCardPreview app={activeCard} />}</DragOverlay>
      </DndContext>

      <InterviewRoundDialog
        open={!!interviewDialog}
        onConfirm={handleInterviewConfirm}
        onCancel={() => setInterviewDialog(null)}
      />

      <ApplicationDrawer
        app={selectedApp}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false)
          setSelectedAppId(null)
        }}
        onDelete={handleDelete}
      />

      <AlertDialog
        open={!!confirmAction}
        onOpenChange={(o) => {
          if (!o) setConfirmAction(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('common:actions.confirm', { defaultValue: 'Confirmar' })}
            </AlertDialogTitle>
            <AlertDialogDescription>{confirmAction?.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmAction(null)}>
              {t('common:actions.cancel', { defaultValue: 'Cancelar' })}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction}>
              {t('common:actions.confirm', { defaultValue: 'Confirmar' })}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
