import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { ExternalLink, Trash2 } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ApplicationStatusDropdown } from '@/components/common/application-status-dropdown'
import { useUpdateApplication } from '@/hooks/useApplications'
import type { ApplicationStatus, JobApplicationWithJob } from '@/models/application'
import { toast } from 'sonner'
import { safeHref } from '@/utils/url'

interface Props {
  app: JobApplicationWithJob | null
  open: boolean
  onClose: () => void
  onDelete: (id: number) => void
}

export function ApplicationDrawer({ app, open, onClose, onDelete }: Props) {
  const { t } = useTranslation('applications')
  const updateApplication = useUpdateApplication()
  const [notes, setNotes] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const savedNotes = useRef('')

  useEffect(() => {
    if (app) {
      const initial = app.notes ?? ''
      setNotes(initial)
      savedNotes.current = initial
      setConfirmDelete(false)
    }
  }, [app])

  const handleStatusChange = (status: ApplicationStatus, interviewRound?: number) => {
    if (!app) return
    updateApplication.mutate(
      { id: app.id, status, interview_round: status === 'interview' ? interviewRound : null },
      {
        onSuccess: () => toast.success(t('toast.updateSuccess')),
        onError: (err) => toast.error(err.message)
      }
    )
  }

  const handleSaveNotes = () => {
    if (!app) return
    updateApplication.mutate(
      { id: app.id, notes },
      {
        onSuccess: () => {
          savedNotes.current = notes
          toast.success(t('toast.noteSaved'))
        },
        onError: (err) => toast.error(err.message)
      }
    )
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose()
      }}
    >
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        {app ? (
          <>
            <SheetHeader className="pb-4">
              <SheetTitle className="text-lg leading-tight pr-8">{app.job.title}</SheetTitle>
              <p className="text-sm text-muted-foreground">
                {app.job.company} · {app.job.location}
              </p>
            </SheetHeader>

            <div className="space-y-6 px-4 pb-4">
              {/* External link */}
              <a
                href={safeHref(app.job.job_link)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {t('drawer.viewJob')}
              </a>

              {/* Status */}
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-sm">
                  {t('dashboard.changeStatus')}
                </Label>
                <div>
                  <ApplicationStatusDropdown
                    currentStatus={app.status}
                    interviewRound={app.interview_round}
                    onStatusChange={handleStatusChange}
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-sm">{t('drawer.notesLabel')}</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('drawer.notesPlaceholder')}
                  rows={4}
                  className="resize-none"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSaveNotes}
                  disabled={notes === savedNotes.current}
                >
                  {t('drawer.save')}
                </Button>
              </div>

              {/* Metadata */}
              <div className="rounded-lg bg-muted/30 p-3 space-y-1 text-sm text-muted-foreground">
                <p>
                  {t('drawer.appliedAt')}: {new Date(app.applied_at).toLocaleDateString()}
                </p>
                <p>
                  {t('drawer.updatedAt')}: {new Date(app.updated_at).toLocaleDateString()}
                </p>
              </div>

              {/* Delete */}
              <div className="pt-2 border-t border-border/50">
                {confirmDelete ? (
                  <div className="space-y-2">
                    <p className="text-sm text-destructive">{t('drawer.removeConfirm')}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="destructive" onClick={() => onDelete(app.id)}>
                        {t('drawer.removeApplication')}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>
                        {t('common:actions.cancel', { defaultValue: 'Cancelar' })}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    {t('drawer.removeApplication')}
                  </Button>
                )}
              </div>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
