import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
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
          toast.success('PDF gerado com sucesso!')
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
          <DialogTitle>Exportar Currículo em PDF</DialogTitle>
          <DialogDescription>Escolha um modelo para gerar o PDF</DialogDescription>
        </DialogHeader>

        {pdfUrl ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <p className="text-sm text-muted-foreground">PDF gerado com sucesso!</p>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Download className="h-4 w-4" />
              Baixar PDF
            </a>
            <p className="text-xs text-muted-foreground">Link válido por 1 hora</p>
            <Button variant="outline" onClick={handleClose}>
              Fechar
            </Button>
          </div>
        ) : (
          <>
            <div className="mt-4">
              <TemplateSelector selectedId={selectedTemplate} onSelect={setSelectedTemplate} />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={handleClose} disabled={isPending}>
                Cancelar
              </Button>
              <Button onClick={handleGenerate} disabled={!selectedTemplate || isPending}>
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {isPending ? 'Gerando...' : 'Gerar PDF'}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
