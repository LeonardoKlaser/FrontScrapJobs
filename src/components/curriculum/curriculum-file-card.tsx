import { useTranslation } from 'react-i18next'
import { Eye, Download, Star, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

  // Card inteiro é clicável (seleciona o arquivo pra visualização), mas só
  // tinha affordance de mouse — teclado não tinha como ativá-lo (achado da
  // review de a11y). role="button" + tabIndex + Enter/Espaço replicam o
  // comportamento nativo de um <button>. O guard `target === currentTarget`
  // evita disparar onView de novo quando o Enter/Espaço já foi tratado por um
  // botão aninhado na linha de ações (download/estrela/excluir), cujo keydown
  // borbulha até aqui.
  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onView()
    }
  }

  return (
    <Card
      role="button"
      tabIndex={0}
      aria-label={t('list.viewCardLabel', { filename: file.filename })}
      className={cn('cursor-pointer', isSelected && 'ring-2 ring-primary')}
      onClick={onView}
      onKeyDown={handleCardKeyDown}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-medium truncate" title={file.filename}>
            {file.filename}
          </CardTitle>
          {file.is_principal && <Badge>{t('list.principalBadge')}</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          {formatFileSize(file.size_bytes)} · {t('list.uploadedAt', { date: uploadedAt })}
        </p>
        <div className="flex flex-wrap items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" aria-label={t('list.viewAction')} onClick={onView}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label={t('list.downloadAction')} asChild>
            <a href={curriculumFilesService.downloadUrl(file.id)} target="_blank" rel="noreferrer">
              <Download className="h-4 w-4" />
            </a>
          </Button>
          {!file.is_principal && (
            <Button
              variant="ghost"
              size="icon"
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
      </CardContent>
    </Card>
  )
}
