import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { isAxiosError } from 'axios'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { PlusCircle, FileText, Trash2 } from 'lucide-react'
import type { Curriculum } from '@/models/curriculum'
import { EmptyState } from '@/components/common/empty-state'
import { useDeleteCurriculum } from '@/hooks/useCurriculum'

interface CurriculumListProps {
  curriculums: Curriculum[] | undefined
  selectedId: number | null
  onSelect: (id: number) => void
  onCreateNew: () => void
}

export function CurriculumList({
  curriculums,
  selectedId,
  onSelect,
  onCreateNew
}: CurriculumListProps) {
  const { t } = useTranslation('curriculum')
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const deleteMutation = useDeleteCurriculum()

  const hasCurriculums = curriculums && curriculums.length > 0

  return (
    <div className="space-y-3 lg:sticky lg:top-8">
      <Button onClick={onCreateNew} variant="outline" className="w-full gap-2">
        <PlusCircle className="h-4 w-4" />
        {t('list.newButton')}
      </Button>

      {!hasCurriculums && (
        <EmptyState
          icon={FileText}
          title={t('list.emptyTitle')}
          description={t('list.emptyDescription')}
          action={
            <Button onClick={onCreateNew} variant="glow" size="sm">
              <PlusCircle className="h-4 w-4" />
              {t('list.createButton')}
            </Button>
          }
        />
      )}

      {hasCurriculums && (
        <div className="space-y-2">
          {curriculums.map((curriculum, index) => {
            const isSelected = selectedId === curriculum.id

            return (
              <div
                key={curriculum.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <Card
                  className={`cursor-pointer transition-all duration-150 relative ${
                    isSelected
                      ? 'border-l-2 border-l-primary bg-primary/5 border-primary/30'
                      : 'hover:bg-muted/30'
                  }`}
                  onClick={() => onSelect(curriculum.id)}
                >
                  <CardHeader className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm">{curriculum.title}</CardTitle>
                      {curriculums.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteId(curriculum.id)
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                    <CardDescription className="text-xs line-clamp-2 text-pretty">
                      {curriculum.summary || t('list.noSummary')}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            )
          })}
        </div>
      )}

      <Dialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('list.deleteTitle')}</DialogTitle>
            <DialogDescription>{t('list.deleteDescription')}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" size="sm" onClick={() => setDeleteId(null)}>
              {t('actions.cancel', { ns: 'common' })}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (deleteId) {
                  deleteMutation.mutate(deleteId, {
                    onSuccess: () => {
                      toast.success(t('list.deleteSuccess'))
                      setDeleteId(null)
                    },
                    onError: (err) => {
                      const msg = isAxiosError(err) && err.response?.data?.error
                        ? err.response.data.error
                        : t('list.deleteError')
                      toast.error(msg)
                      setDeleteId(null)
                    }
                  })
                }
              }}
            >
              {deleteMutation.isPending
                ? t('actions.deleting', { ns: 'common' })
                : t('list.confirmDelete')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
