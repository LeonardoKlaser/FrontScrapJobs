import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation('curriculum')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { mutate: extractPdf, isPending } = useExtractPdf()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast.error(t('pdf.importInvalidType'))
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error(t('pdf.importFileTooLarge'))
      return
    }

    extractPdf(file, {
      onSuccess: (data) => {
        toast.success(t('pdf.importSuccess'))
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
        {isPending ? t('pdf.importing') : t('pdf.importButton')}
      </Button>
    </>
  )
}
