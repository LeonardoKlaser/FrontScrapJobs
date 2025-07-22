import { useRef, type ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Paperclip } from 'lucide-react'

interface CurriculumUploadProps {
  onFileSelect: (file: File) => void
  accept?: string
  maxSizeMB?: number
}

export function CurriculumUpload({
  onFileSelect,
  accept = '.pdf,.doc,.docx',
  maxSizeMB = 5
}: CurriculumUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleClick() {
    inputRef.current?.click()
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const isTooBig = file.size / 1024 / 1024 > maxSizeMB
    const isValidType = accept
      .split(',')
      .some((ext) => file.name.toLowerCase().endsWith(ext.trim()))

    if (!isValidType) {
      alert('Formato inválido. Aceite apenas PDF ou DOC(X).')
      return
    }
    if (isTooBig) {
      alert(`Arquivo maior que ${maxSizeMB} MB.`)
      return
    }

    onFileSelect(file)
    e.target.value = ''
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />

      <Button
        type="button"
        variant="outline"
        onClick={handleClick}
        className="flex items-center gap-2"
      >
        <Paperclip className="h-4 w-4" />
        Enviar currículo
      </Button>

      <p className="text-xs text-muted-foreground">
        Formatos aceitos: PDF ou DOCX&nbsp;•&nbsp;Máx. {maxSizeMB} MB
      </p>
    </div>
  )
}
