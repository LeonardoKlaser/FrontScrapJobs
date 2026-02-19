import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, PlusCircle } from "lucide-react"
import type { Curriculum } from "@/models/curriculum"
import { useSetActiveCurriculum } from "@/hooks/useCurriculum"
import { Badge } from "../ui/badge"

interface CurriculumListProps {
  curriculums: Curriculum[] | undefined
  selectedId: string | null
  onSelect: (id: string) => void
  onCreateNew: () => void
}

export function CurriculumList({ curriculums, selectedId, onSelect, onCreateNew }: CurriculumListProps) {
  const { mutate: setActive, isPending } = useSetActiveCurriculum()
  const [activatingId, setActivatingId] = useState<string | null>(null)

  const handleSetActive = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setActivatingId(id)
    setActive(id, {
      onSettled: () => setActivatingId(null)
    })
  }

  return (
    <div className="space-y-4">
      <Button onClick={onCreateNew} className="w-full bg-transparent" variant="outline">
        <PlusCircle className="mr-2 h-4 w-4" />
        Criar Novo Currículo
      </Button>

      <div className="space-y-3">
        {curriculums?.map((curriculum) => {
          const isActivating = isPending && activatingId === curriculum.id
          return (
            <Card
              key={curriculum.id}
              className={`cursor-pointer transition-all hover:border-primary/50 relative ${
                selectedId === curriculum.id ? "border-primary border-2" : ""
              }`}
              onClick={() => onSelect(curriculum.id)}
            >
              {curriculum.is_active && (
                <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground" variant="default">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Ativo
                </Badge>
              )}
              <CardHeader className="p-4">
                <CardTitle className="text-base text-balance pr-20">{curriculum.title}</CardTitle>
                <CardDescription className="text-sm line-clamp-2 text-pretty">{curriculum.summary}</CardDescription>
                {!curriculum.is_active && (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={(e) => handleSetActive(e, curriculum.id)}
                    disabled={isActivating}
                    className="mt-2 w-fit"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {isActivating ? "Ativando..." : "Definir como ativo"}
                  </Button>
                )}
              </CardHeader>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
