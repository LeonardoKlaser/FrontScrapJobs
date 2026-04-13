import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Download, Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { TemplateSelector } from './template-selector'
import { useGeneratePdf } from '@/hooks/usePdf'
import { toast } from 'sonner'

interface PdfExportModalProps {
  curriculumId: number | null
  open: boolean
  onClose: () => void
}

export function PdfExportModal({ curriculumId, open, onClose }: PdfExportModalProps) {
  const { t } = useTranslation('curriculum')
  const { mutate: generatePdf, isPending } = useGeneratePdf()
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  const handleGenerate = () => {
    if (!curriculumId || !selectedTemplate) return

    generatePdf(
      { curriculumId, templateId: selectedTemplate },
      {
        onSuccess: (data) => {
          setPdfUrl(data.pdf_url)
          toast.success(t('pdf.generateSuccess'))
        },
        onError: (error) => {
          toast.error(error.message)
        }
      }
    )
  }

  const handleClose = () => {
    setSelectedTemplate(null)
    setPdfUrl(null)
    onClose()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose()
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('pdf.exportTitle')}</DialogTitle>
          <DialogDescription>{t('pdf.exportDescription')}</DialogDescription>
        </DialogHeader>

        {pdfUrl ? (
          <div className="flex flex-col items-center gap-6 py-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle className="h-7 w-7 text-primary" />
            </div>
            <div className="text-center space-y-1">
              <p className="font-medium text-foreground">{t('pdf.generateSuccess')}</p>
              <p className="text-xs text-muted-foreground">{t('pdf.linkExpiry')}</p>
            </div>
            <Button className="gap-2" asChild>
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4" />
                {t('pdf.downloadPdf')}
              </a>
            </Button>
          </div>
        ) : (
          <>
            <div className="mt-4">
              <TemplateSelector selectedId={selectedTemplate} onSelect={setSelectedTemplate} />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={handleClose} disabled={isPending}>
                {t('actions.cancel', { ns: 'common' })}
              </Button>
              <Button size="sm" onClick={handleGenerate} disabled={!selectedTemplate || isPending}>
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {isPending ? t('pdf.generating') : t('pdf.generateButton')}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
