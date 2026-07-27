import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { FileText } from 'lucide-react'
import { AppPageHeader } from '@/components/common/app-page-header'
import { EmptyState } from '@/components/common/empty-state'
import { CurriculumFileCard } from '@/components/curriculum/curriculum-file-card'
import { CurriculumViewer } from '@/components/curriculum/curriculum-viewer'
import { UploadCurriculumButton } from '@/components/curriculum/upload-curriculum-button'
import {
  useCurriculumFiles,
  useDeleteCurriculumFile,
  useSetPrincipalCurriculumFile
} from '@/hooks/useCurriculumFiles'
import { curriculumFileErrorKey } from '@/lib/curriculumFileErrorKey'

// Página de currículo é agora um gerenciador de PDFs armazenados no R2 (Task
// 14). Substitui o editor estruturado antigo (CurriculumForm/CurriculumSwitcher
// /PdfImportButton/PdfExportModal) — esses componentes ficam órfãos até serem
// removidos na Task 16.
export function Curriculum() {
  const { t } = useTranslation('curriculum')
  const { data: files, isLoading } = useCurriculumFiles()
  const deleteFile = useDeleteCurriculumFile()
  const setPrincipal = useSetPrincipalCurriculumFile()
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [hasAutoSelected, setHasAutoSelected] = useState(false)

  const list = files ?? []
  const hasFiles = list.length > 0
  const selectedFile = list.find((f) => f.id === selectedId) ?? null

  // Pré-seleciona o arquivo principal (ou o primeiro, se nenhum for principal)
  // assim que a lista carrega, pra o painel de visualização não abrir vazio.
  // Roda só uma vez — depois disso a seleção fica sob controle do usuário.
  useEffect(() => {
    if (!hasAutoSelected && list.length > 0) {
      const defaultFile = list.find((f) => f.is_principal) ?? list[0]
      setSelectedId(defaultFile.id)
      setHasAutoSelected(true)
    }
  }, [list, hasAutoSelected])

  const handleDelete = (id: number) => {
    deleteFile.mutate(id, {
      onSuccess: () => {
        toast.success(t('list.deleteSuccess'))
        setSelectedId((current) => (current === id ? null : current))
      },
      onError: (error) => toast.error(t(curriculumFileErrorKey(error)))
    })
  }

  const handleSetPrincipal = (id: number) => {
    setPrincipal.mutate(id, {
      onSuccess: () => toast.success(t('list.principalSuccess')),
      onError: (error) => toast.error(t(curriculumFileErrorKey(error)))
    })
  }

  return (
    <>
      <AppPageHeader title={t('pageTitle.curriculum', { ns: 'common' })}>
        <UploadCurriculumButton fileCount={list.length} />
      </AppPageHeader>
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <p className="text-sm text-muted-foreground">{t('description')}</p>

        {!isLoading && !hasFiles && (
          <EmptyState
            icon={FileText}
            title={t('list.emptyTitle')}
            description={t('list.emptyDescription')}
            action={<UploadCurriculumButton fileCount={list.length} />}
          />
        )}

        {hasFiles && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((file) => (
                <CurriculumFileCard
                  key={file.id}
                  file={file}
                  isSelected={file.id === selectedId}
                  onView={() => setSelectedId(file.id)}
                  onSetPrincipal={() => handleSetPrincipal(file.id)}
                  onDelete={() => handleDelete(file.id)}
                  isSettingPrincipal={setPrincipal.isPending}
                  isDeleting={deleteFile.isPending}
                />
              ))}
            </div>

            <CurriculumViewer file={selectedFile} />
          </>
        )}
      </div>
    </>
  )
}
