import { useTranslation } from 'react-i18next'
import { Eye, Download, FileText, Star, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { formatFileSize } from '@/lib/format'
import { curriculumFilesService } from '@/services/curriculumFilesService'
import { cn } from '@/lib/utils'
import type { CurriculumFile } from '@/models/curriculum'

interface CurriculumFileCardProps {
  file: CurriculumFile
  isSelected: boolean
  onView: () => void
  onSetPrincipal: () => void
  onDelete: () => void
  isSettingPrincipal?: boolean
  isDeleting?: boolean
}

// Linha compacta (nome + badge + tamanho/data + ações numa linha só): a
// listagem fica acima do visualizador de PDF e cards altos empurravam o
// conteúdo principal da página pra fora da tela.
export function CurriculumFileCard({
  file,
  isSelected,
  onView,
  onSetPrincipal,
  onDelete,
  isSettingPrincipal,
  isDeleting
}: CurriculumFileCardProps) {
  const { t, i18n } = useTranslation('curriculum')

  const uploadedAt = new Date(file.created_at).toLocaleDateString(i18n.language)

  return (
    <Card
      className={cn(
        'cursor-pointer flex-row items-center gap-3 rounded-lg px-3 py-2',
        isSelected && 'ring-2 ring-primary'
      )}
      onClick={onView}
    >
      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
      <p className="min-w-0 flex-1 truncate text-sm font-medium" title={file.filename}>
        {file.filename}
      </p>
      {file.is_principal && <Badge className="shrink-0">{t('list.principalBadge')}</Badge>}
      <p className="hidden shrink-0 text-xs text-muted-foreground sm:block">
        {formatFileSize(file.size_bytes)} · {t('list.uploadedAt', { date: uploadedAt })}
      </p>
      <div className="flex shrink-0 items-center" onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label={t('list.viewAction')}
          onClick={onView}
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label={t('list.downloadAction')}
          asChild
        >
          <a href={curriculumFilesService.downloadUrl(file.id)} target="_blank" rel="noreferrer">
            <Download className="h-4 w-4" />
          </a>
        </Button>
        {!file.is_principal && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label={t('list.makePrincipalAction')}
            onClick={onSetPrincipal}
            disabled={isSettingPrincipal}
          >
            <Star className="h-4 w-4" />
          </Button>
        )}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label={t('list.deleteAction')}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('list.deleteTitle')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('list.deleteDescription', { filename: file.filename })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('list.cancelDelete')}</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete}>{t('list.confirmDelete')}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Card>
  )
}
