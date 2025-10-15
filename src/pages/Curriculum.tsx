import { useMemo, useState } from "react"
import { CurriculumList } from "@/components/curriculum/curriculum-list"
import { CurriculumForm } from "@/components/curriculum/curriculum-form"
import type { Curriculum } from "@/models/curriculum"
import { useCurriculum } from "@/hooks/useCurriculum"

export function Curriculum() {
  const { data } = useCurriculum();
  const curriculums = useMemo(() => {
    return data 
  }, [data]);
  //const [curriculums] = useState<Curriculum[] | undefined >(data)
  const [selectedCurriculumId, setSelectedCurriculumId] = useState<string | null>(null)

  const selectedCurriculum = curriculums?.find((cv) => cv.id === selectedCurriculumId)

  const handleSelectCurriculum = (id: string) => {
    setSelectedCurriculumId(id)
  }

  const handleCreateNew = () => {
    setSelectedCurriculumId(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Gerenciador de Currículos</h1>
          <p className="text-muted-foreground">Crie e gerencie múltiplos currículos para diferentes oportunidades</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
          <div className="order-2 lg:order-1">
            <CurriculumForm curriculum={selectedCurriculum} isEditing={selectedCurriculumId !== null} />
          </div>

          {/* Right Column - List (30%) */}
          <div className="order-1 lg:order-2">
            <CurriculumList
              curriculums={curriculums}
              selectedId={selectedCurriculumId}
              onSelect={handleSelectCurriculum}
              onCreateNew={handleCreateNew}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
