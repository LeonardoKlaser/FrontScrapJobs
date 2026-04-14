import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CurriculumList } from '@/components/curriculum/curriculum-list'
import { CurriculumForm } from '@/components/curriculum/curriculum-form'
import { useCurriculum } from '@/hooks/useCurriculum'
import { PageHeader } from '@/components/common/page-header'
import { PdfExportModal } from '@/components/curriculum/pdf-export-modal'
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
    <div>
      <div className="mb-10">
        <PageHeader title={t('title')} description={t('description')} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] gap-6">
        <div className="animate-fade-in-up [animation-delay:50ms]">
          <CurriculumList
            curriculums={curriculums}
            selectedId={selectedCurriculumId}
            onSelect={handleSelectCurriculum}
            onCreateNew={handleCreateNew}
            onExport={setExportCurriculumId}
            onImportExtracted={handleExtracted}
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
  )
}
