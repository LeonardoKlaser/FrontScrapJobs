import { useDroppable } from '@dnd-kit/core'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { STATUS_COLORS } from '@/models/application'
import type { ApplicationStatus, JobApplicationWithJob } from '@/models/application'
import { KanbanCard } from './kanban-card'

interface Props {
  status: ApplicationStatus
  items: JobApplicationWithJob[]
  onCardClick: (app: JobApplicationWithJob) => void
}

export function KanbanColumn({ status, items, onCardClick }: Props) {
  const { t } = useTranslation('applications')
  const { setNodeRef, isOver } = useDroppable({ id: status })

  const label = status === 'interview' ? t('status.interviewNoRound') : t(`status.${status}`)

  return (
    <div
      ref={setNodeRef}
      className={`min-w-[220px] flex-1 rounded-lg bg-muted/30 p-2.5 transition-colors ${
        isOver ? 'ring-2 ring-primary/40 bg-primary/5' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-2.5 px-1">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
        <Badge
          variant="outline"
          className="h-5 min-w-[20px] justify-center text-[10px] font-bold border-0"
          style={{
            backgroundColor: `${STATUS_COLORS[status]}1F`,
            color: STATUS_COLORS[status]
          }}
        >
          {items.length}
        </Badge>
      </div>

      <div className="flex flex-col gap-1.5 min-h-[60px] max-h-[calc(100vh-220px)] overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            {t('kanban.emptyColumn')}
          </p>
        ) : (
          items.map((app) => <KanbanCard key={app.id} app={app} onClick={() => onCardClick(app)} />)
        )}
      </div>
    </div>
  )
}
