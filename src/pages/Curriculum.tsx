import { useState } from 'react'
import { Trash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CurriculumUpload } from '@/components/forms/CurriculumUpload'

export function Curriculum() {
  const [curriculums, setCurriculums] = useState<File[]>([])

  const handleAdd = (file: File) => {
    setCurriculums((prev) => (prev.some((f) => f.name === file.name) ? prev : [...prev, file]))
  }

  const handleRemove = (file: File) => {
    setCurriculums((prev) => prev.filter((x) => x.name !== file.name))
  }

  return (
    <div className="flex flex-col gap-8 md:flex-row">
      <div className="flex w-full flex-col items-center rounded-xl border p-6 shadow-sm md:w-1/3">
        <h2 className="mb-4 text-lg font-semibold">Adicionar currículo</h2>
        <CurriculumUpload onFileSelect={handleAdd} />
      </div>

      <div className="w-full rounded-xl border p-6 shadow-sm md:w-2/3">
        <h2 className="mb-4 text-lg font-semibold">Currículos adicionados</h2>

        <ul className="space-y-3">
          {curriculums.map((file) => (
            <li
              key={file.name}
              className="flex items-center justify-between rounded-md bg-muted px-4 py-2"
            >
              <span className="truncate text-sm">{file.name}</span>

              <Button
                variant="ghost"
                size="icon"
                aria-label="Remover"
                onClick={() => handleRemove(file)}
              >
                <Trash className="h-4 w-4 text-destructive" />
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
