import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CurriculumList } from '@/components/curriculum/curriculum-list'
import { CurriculumForm } from '@/components/curriculum/curriculum-form'
import { useCurriculum } from '@/hooks/useCurriculum'
import { AppPageHeader } from '@/components/common/app-page-header'
import { PdfExportModal } from '@/components/curriculum/pdf-export-modal'
import { PdfImportButton } from '@/components/curriculum/pdf-import-button'
import type { Curriculum as CurriculumType } from '@/models/curriculum'

export function Curriculum() {
  const { t } = useTranslation('curriculum')
  const { data: curriculums } = useCurriculum()
  const [selectedCurriculumId, setSelectedCurriculumId] = useState<number | null>(null)
  const [hasAutoSelected, setHasAutoSelected] = useState(false)
  const [importedData, setImportedData] = useState<Omit<CurriculumType, 'id'> | null>(null)
  const [exportCurriculumId, setExportCurriculumId] = useState<number | null>(null)

  useEffect(() => {
    if (!hasAutoSelected && curriculums?.length && selectedCurriculumId === null) {
      setSelectedCurriculumId(curriculums[0].id)
      setHasAutoSelected(true)
    }
  }, [curriculums, hasAutoSelected, selectedCurriculumId])

  const selectedCurriculum = curriculums?.find((cv) => cv.id === selectedCurriculumId)

  const handleSelectCurriculum = (id: number) => {
    setSelectedCurriculumId(id)
  }

  const handleCreateNew = () => {
    setSelectedCurriculumId(null)
  }

  const handleExtracted = (data: Omit<CurriculumType, 'id'>) => {
    setImportedData(data)
    setSelectedCurriculumId(null)
  }

  return (
    <>
      <AppPageHeader title={t('pageTitle.curriculum', { ns: 'common' })}>
        <PdfImportButton onExtracted={handleExtracted} size="sm" />
        <Button
          onClick={handleCreateNew}
          size="sm"
          aria-label={t('list.newButton')}
          className="gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          <span className="hidden sm:inline">{t('list.newButton')}</span>
        </Button>
      </AppPageHeader>
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground mb-10">{t('description')}</p>

        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] gap-6">
          <div className="animate-fade-in-up [animation-delay:50ms]">
            <CurriculumList
              curriculums={curriculums}
              selectedId={selectedCurriculumId}
              onSelect={handleSelectCurriculum}
              onCreateNew={handleCreateNew}
              onExport={setExportCurriculumId}
            />
          </div>

          <div className="animate-fade-in-up [animation-delay:100ms]">
            <CurriculumForm
              curriculum={selectedCurriculum}
              isEditing={selectedCurriculumId !== null}
              initialData={selectedCurriculumId === null ? (importedData ?? undefined) : undefined}
              onSaveSuccess={() => setImportedData(null)}
            />
          </div>
        </div>

        <PdfExportModal
          curriculumId={exportCurriculumId}
          open={exportCurriculumId !== null}
          onClose={() => setExportCurriculumId(null)}
        />
      </div>
    </>
  )
}
