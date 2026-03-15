import { useRef } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { useTranslation } from 'react-i18next'

import type { JobApplicationWithJob } from '@/models/application'

interface Props {
  app: JobApplicationWithJob
  onClick?: () => void
}

export function KanbanCard({ app, onClick }: Props) {
  const dragStartPos = useRef<{ x: number; y: number } | null>(null)
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: app.id
  })

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined

  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartPos.current = { x: e.clientX, y: e.clientY }
    // @dnd-kit expects its own event type, safe to cast
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listeners?.onPointerDown?.(e as any)
  }

  const handleClick = (e: React.MouseEvent) => {
    if (!dragStartPos.current) {
      onClick?.()
      return
    }
    const dx = Math.abs(e.clientX - dragStartPos.current.x)
    const dy = Math.abs(e.clientY - dragStartPos.current.y)
    if (dx < 5 && dy < 5) onClick?.()
    dragStartPos.current = null
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      className={`rounded-md border border-border/50 bg-card p-2.5 text-sm transition-shadow hover:shadow-sm cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-50 shadow-lg' : ''
      }`}
    >
      <KanbanCardContent app={app} />
    </div>
  )
}

/** Lightweight preview for DragOverlay (no drag hooks) */
export function KanbanCardPreview({ app }: { app: JobApplicationWithJob }) {
  return (
    <div className="rounded-md border border-border/50 bg-card p-2.5 text-sm shadow-lg opacity-80">
      <KanbanCardContent app={app} />
    </div>
  )
}

function KanbanCardContent({ app }: { app: JobApplicationWithJob }) {
  const { t } = useTranslation('applications')
  const daysAgo = Math.floor(
    (Date.now() - new Date(app.applied_at).getTime()) / (1000 * 60 * 60 * 24)
  )
  const daysLabel = daysAgo === 0 ? t('kanban.today') : t('kanban.daysAgo', { count: daysAgo })

  return (
    <>
      <p className="font-medium text-foreground leading-tight line-clamp-2 text-xs">
        {app.job.title}
      </p>
      <p className="text-[10px] text-muted-foreground mt-1">
        {app.job.company} · {daysLabel}
      </p>
      {app.status === 'interview' && app.interview_round && (
        <p className="text-[10px] text-primary mt-0.5">
          {t('kanban.roundLabel', { round: app.interview_round })}
        </p>
      )}
    </>
  )
}
