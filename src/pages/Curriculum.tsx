import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CurriculumList } from '@/components/curriculum/curriculum-list'
import { CurriculumForm } from '@/components/curriculum/curriculum-form'
import { useCurriculum } from '@/hooks/useCurriculum'
import { PageHeader } from '@/components/common/page-header'

export function Curriculum() {
  const { t } = useTranslation('curriculum')
  const { data: curriculums } = useCurriculum()
  const [selectedCurriculumId, setSelectedCurriculumId] = useState<number | null>(null)

  const selectedCurriculum = curriculums?.find((cv) => cv.id === selectedCurriculumId)

  const handleSelectCurriculum = (id: number) => {
    setSelectedCurriculumId(id)
  }

  const handleCreateNew = () => {
    setSelectedCurriculumId(null)
  }

  return (
    <div>
      <PageHeader title={t('title')} description={t('description')} className="mb-10" />

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] gap-6">
        <div className="animate-fade-in-up" style={{ animationDelay: '50ms' }}>
          <CurriculumList
            curriculums={curriculums}
            selectedId={selectedCurriculumId}
            onSelect={handleSelectCurriculum}
            onCreateNew={handleCreateNew}
          />
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <CurriculumForm
            curriculum={selectedCurriculum}
            isEditing={selectedCurriculumId !== null}
          />
        </div>
      </div>
    </div>
  )
}
