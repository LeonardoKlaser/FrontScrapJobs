import { useRef } from 'react'
import { Upload, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useExtractPdf } from '@/hooks/usePdf'
import { toast } from 'sonner'
import type { Curriculum } from '@/models/curriculum'

interface PdfImportButtonProps {
  onExtracted: (data: Omit<Curriculum, 'id'>) => void
}

const MAX_FILE_SIZE = 5 * 1024 * 1024

export function PdfImportButton({ onExtracted }: PdfImportButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { mutate: extractPdf, isPending } = useExtractPdf()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast.error('Apenas arquivos PDF são aceitos.')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Arquivo excede o tamanho máximo de 5MB.')
      return
    }

    extractPdf(file, {
      onSuccess: (data) => {
        toast.success('Dados extraídos com sucesso! Revise e salve.')
        onExtracted(data)
      },
      onError: (error) => {
        toast.error(error.message)
      }
    })

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={isPending}
        className="w-full"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Upload className="h-4 w-4 mr-2" />
        )}
        {isPending ? 'Extraindo...' : 'Importar PDF'}
      </Button>
    </>
  )
}
