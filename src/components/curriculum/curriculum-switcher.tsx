import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { isAxiosError } from 'axios'
import { toast } from 'sonner'
import { Check, ChevronsUpDown, FileDown, FileText, PlusCircle, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { useDeleteCurriculum } from '@/hooks/useCurriculum'
import type { Curriculum } from '@/models/curriculum'

interface CurriculumSwitcherProps {
  curriculums: Curriculum[]
  selectedId: number | null
  isCreatingNew: boolean
  onSelect: (id: number) => void
  onCreateNew: () => void
  onExport: (id: number) => void
}

export function CurriculumSwitcher({
  curriculums,
  selectedId,
  isCreatingNew,
  onSelect,
  onCreateNew,
  onExport
}: CurriculumSwitcherProps) {
  const { t } = useTranslation('curriculum')
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const deleteMutation = useDeleteCurriculum()

  const selected = curriculums.find((cv) => cv.id === selectedId) ?? null
  const triggerLabel = isCreatingNew
    ? t('switcher.creatingNewLabel')
    : selected
      ? t('form.editing', { title: selected.title })
      : t('switcher.selectLabel')

  const canDelete = !isCreatingNew && selected !== null && curriculums.length > 1

  return (
    <div className="flex items-center gap-2 mb-6">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex-1 justify-between gap-2 h-11 px-4 font-semibold"
            aria-label={t('switcher.selectLabel')}
          >
            <span className="flex items-center gap-2 truncate">
              <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{triggerLabel}</span>
            </span>
            <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-(--radix-dropdown-menu-trigger-width) min-w-64"
        >
          {curriculums.map((cv) => {
            const isSelected = !isCreatingNew && cv.id === selectedId
            return (
              <DropdownMenuItem key={cv.id} onSelect={() => onSelect(cv.id)} className="gap-2">
                <Check className={isSelected ? 'h-4 w-4 opacity-100' : 'h-4 w-4 opacity-0'} />
                <span className="truncate">{cv.title}</span>
              </DropdownMenuItem>
            )
          })}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => onCreateNew()} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            {t('switcher.newCurriculumOption')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {!isCreatingNew && selected && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => onExport(selected.id)}
          aria-label={t('switcher.exportAction')}
          title={t('switcher.exportAction')}
          className="h-11 w-11 shrink-0"
        >
          <FileDown className="h-4 w-4" />
        </Button>
      )}

      {canDelete && selected && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => setDeleteId(selected.id)}
          aria-label={t('switcher.deleteAction')}
          title={t('switcher.deleteAction')}
          className="h-11 w-11 shrink-0 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}

      <Dialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('list.deleteTitle')}</DialogTitle>
            <DialogDescription>{t('list.deleteDescription')}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" size="sm" onClick={() => setDeleteId(null)}>
              {t('actions.cancel', { ns: 'common' })}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (deleteId === null) return
                deleteMutation.mutate(deleteId, {
                  onSuccess: () => {
                    toast.success(t('list.deleteSuccess'))
                    setDeleteId(null)
                  },
                  onError: (err) => {
                    const msg =
                      isAxiosError(err) && err.response?.data?.error
                        ? err.response.data.error
                        : t('list.deleteError')
                    toast.error(msg)
                    setDeleteId(null)
                  }
                })
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
