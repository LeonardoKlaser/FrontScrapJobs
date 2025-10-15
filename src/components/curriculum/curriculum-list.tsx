"use client"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle } from "lucide-react"
import type { Curriculum } from "@/models/curriculum"

interface CurriculumListProps {
  curriculums: Curriculum[] | undefined
  selectedId: string | null
  onSelect: (id: string) => void
  onCreateNew: () => void
}

export function CurriculumList({ curriculums, selectedId, onSelect, onCreateNew }: CurriculumListProps) {
  return (
    <div className="space-y-4">
      <Button onClick={onCreateNew} className="w-full bg-transparent" variant="outline">
        <PlusCircle className="mr-2 h-4 w-4" />
        Criar Novo Currículo
      </Button>

      <div className="space-y-3">
        {curriculums?.map((curriculum) => (
          <Card
            key={curriculum.id}
            className={`cursor-pointer transition-all hover:border-primary/50 ${
              selectedId === curriculum.id ? "border-primary border-2" : ""
            }`}
            onClick={() => onSelect(curriculum.id)}
          >
            <CardHeader className="p-4">
              <CardTitle className="text-base text-balance">{curriculum.title}</CardTitle>
              <CardDescription className="text-sm line-clamp-2 text-pretty">{curriculum.summary}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
