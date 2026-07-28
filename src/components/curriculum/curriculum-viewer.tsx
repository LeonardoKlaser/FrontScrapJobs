import { useTranslation } from 'react-i18next'
import { FileSearch } from 'lucide-react'
import { EmptyState } from '@/components/common/empty-state'
import { curriculumFilesService } from '@/services/curriculumFilesService'
import type { CurriculumFile } from '@/models/curriculum'

interface CurriculumViewerProps {
  file: CurriculumFile | null
}

// Painel de visualização do PDF selecionado. O endpoint de download 302-
// redireciona pra uma URL presigned do R2 — o navegador segue o redirect
// dentro do próprio iframe, então não precisa lidar com a URL presigned aqui.
export function CurriculumViewer({ file }: CurriculumViewerProps) {
  const { t } = useTranslation('curriculum')

  if (!file) {
    return (
      <EmptyState
        icon={FileSearch}
        title={t('viewer.emptyTitle')}
        description={t('viewer.emptyDescription')}
      />
    )
  }

  return (
    <iframe
      src={curriculumFilesService.downloadUrl(file.id)}
      title={file.filename}
      className="w-full h-[70vh] rounded-md border"
    />
  )
}
